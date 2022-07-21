from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state():
    #随机生成一个八位数
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "2796"
    redirect_uri = quote("https://app2796.acapp.acwing.com.cn/settings/acwing/web/receive_code") 
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 2 * 60 * 60) #将state存储到redius中，用于确认是否是另一端发送的消息。过期时间为两个小时。    


    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({
        'result': "success", 
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state),
    })