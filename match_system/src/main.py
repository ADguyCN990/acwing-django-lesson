#! /usr/bin/env python3

import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])

from match_server.match_service import Match

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from queue import Queue
from time import sleep
from threading import Thread

from acapp.asgi import channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache

queue = Queue() #消息队列

class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0 #等待时间越长,对对手的期望阈值越低，具体指天梯分的差距

class Pool: #匹配池
    def __init__(self):
        self.players = []
    
    def add_player(self, player):
        self.players.append(player)
        print("Add Player: %s %d" % (player.username, player.score))

    def check_match(self, a, b):
        dt = abs(a.score - b.score) #匹配到的两人的分数差
        a_max_dif = a.waiting_time * 50 #a能接受的分数差
        b_max_dif = b.waiting_time * 50 #b能接受的分数差
        return dt <= a_max_dif and dt <= b_max_dif

    def match(self):
        while len(self.players) >= 2:
            self.players = sorted(self.players, key = lambda p: p.score)
            flag = False
            for i in range(len(self.players) - 1):
                a = self.players[i]
                b = self.players[i + 1]
                if self.check_match(a, b):
                    flag = True
                    self.match_success([a, b])
                    self.players = self.players[:i] + self.players[i + 2:]
                    break
            if not flag:
                break
        self.increase_waiting_time()

    def match_success(self, ps): #匹配成功后执行的函数
        print("Match Success: %s %s" % (ps[0].username, ps[1].username))
        players = []
        room_name = "room-%s-%s" % (ps[0].uuid, ps[1].uuid)
        for p in ps:
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name)
            players.append({
                'uuid': p.uuid, 
                'username': p.username,
                'photo': p.photo,
                'hp': 100,
            })
        cache.set(room_name, players, 3600) #有效时间一小时
        for p in ps:
            async_to_sync(channel_layer.group_send) (
                room_name,
                {
                    'type': "group_send_event",
                    'event': "create_player",
                    'uuid': p.uuid,
                    'username': p.username,
                    'photo': p.photo,
                }
            )


    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None

def worker(): #生产者消费者匹配，不断往匹配池中塞玩家，并发匹配
    pool = Pool()
    while (True):
        #print("matching...")
        player = get_player_from_queue()
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)


class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player)
        return 0


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)

    # You could do one of these for a multithreaded server
    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory) # 并行度最高
    # server = TServer.TThreadPoolServer(
    #     processor, transport, tfactory, pfactory)

    Thread(target = worker, daemon = True).start()

    print('Starting the server...')
    server.serve()
    print('done.')