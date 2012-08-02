from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from django.template.context import RequestContext

def home(request):
    t = loader.get_template('home.html')
    c = RequestContext(request, {})
    
    return HttpResponse(t.render(c))