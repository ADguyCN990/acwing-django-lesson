from django.http import HttpResponse

# Create your views here.


def index(request):
    line1 = '<h1 style="text-align: center">我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲我爱庄轲</h1>'
    return HttpResponse(line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1 + line1)
