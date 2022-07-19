# 用 Django 自带的基类扩充
from django.db import models # 从django的数据库中引入models
from django.contrib.auth.models import User # 从django中引入这个基本的User类

class Player(models.Model): # 要从models.Model这个类来继承
    user = models.OneToOneField(User, on_delete  = models.CASCADE) # Player从User扩充，这里是定义一个扩充关系，代表Player都有唯一对应的User，User就是代表User数据表，on_delete代表删除User的时候，把他对应的Player也删掉
    photo = models.URLField(max_length = 256, blank = True) # 代表头像的URL，max_length是链接最大长度，blank是是否可空

    def __str__(self): # 返回一个对象的描述信息
        return str(self.user)

