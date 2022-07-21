from django.http import JsonResponse
from django.shortcuts import redirect
from urllib.parse import quote
from django.core.cache import cache
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint
from django.http import JsonResponse
import requests

def receive_code(request):
    data = request.GET

    if "errcode" in data:
        return JsonResponse({
            'result': "apply failed",
            'errcode': data['errcode'],
            'errmsg': data['errmsg'],
        })

    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state): #不是自己网页发来的请求，是境外势力的攻击！
        return JsonResponse({
            'result': "state not exist", 

        })

    cache.delete(state) #确认是自己人，给予其授权后这个八位随机数就没有用了直接删除
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/" # 申请授权令牌的api
    params = {
        'appid': "2796", 
        'secret': "a5032fe0952c4f04814202459b425733",
        'code': code,
    }

    access_token_res = requests.get(apply_access_token_url, params = params).json()
    access_token = access_token_res["access_token"]
    openid = access_token_res["openid"]
    get_user_info_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"

    players = Player.objects.filter(openid = openid)
    if players.exists(): 
        player = players[0]
        return JsonResponse({
            'result': "success", 
            'username': player.user.username, 
            'photo': player.photo
        })
    params = {
        'access_token': access_token, 
        'openid': openid, 
    }

    userinfo_res = requests.get(get_user_info_url, params = params).json()
    username = userinfo_res['username'] #为该acwing用户注册一个账号
    photo = userinfo_res['photo']

    while User.objects.filter(username = username).exists(): #防止重名
        username += str(randint(0, 9))
    user = User.objects.create(username = username)
    player = Player.objects.create(user = user, photo = photo, openid = openid)

    return JsonResponse({
        'result': "success", 
        'username': player.user.username, 
        'photo': player.photo,
    })

    return redirect("index")