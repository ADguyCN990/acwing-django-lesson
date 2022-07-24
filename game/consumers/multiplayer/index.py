from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.core.cache import cache
import json

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        print("建立连接")
        self.room_name = None
        for i in range (1000):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        if not self.room_name: #资源不够用了，排队  
            return
        
        await self.accept()
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600) #给当前申请对战的玩家开房，有效期一小时

        for player in cache.get(self.room_name): #读取玩家信息
            await self.send(text_data = json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))


        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        players = cache.get(self.room_name) #寻找当前对局的玩家
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo'],
        })       
        cache.set(self.room_name, players, 3600) #创建玩家信息
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_create_player",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'], 
            }
        )

    async def group_create_player(self, data):
        await self.send(text_data = json.dumps(data))

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)

    
