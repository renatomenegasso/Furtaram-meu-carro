from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from django.template.context import RequestContext

def estatisticas(request):
    t = loader.get_template('estatisticas.html')
    c = RequestContext(request, {})
    
    return HttpResponse(t.render(c))