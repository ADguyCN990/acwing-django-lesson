from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username", "").strip() 
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()
    if not username or not password: #判断用户名和密码是否为空,若是直接返回错误
        return JsonResponse({
            'result': "用户名和密码不能为空"
        })
    elif password != password_confirm: #两次密码输入不一致
        return JsonResponse({
            'result': "两次密码输入不一致"
        })
    elif User.objects.filter(username = username).exists(): #该用户已存在
        return JsonResponse({
            'result': "该用户已存在"
        })
    else: #创建用户
        user = User(username = username)
        user.set_password(password)
        user.save()
        Player.objects.create(user=user, photo="https://adguycn990-typoraimage.oss-cn-hangzhou.aliyuncs.com/typora-img/202207191026188.webp") 
        login(request, user)
        return JsonResponse({
            'result': "success"
        })