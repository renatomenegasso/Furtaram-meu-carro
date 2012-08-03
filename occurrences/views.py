from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from django.template.context import RequestContext

def add_occurrence(request):
    t = loader.get_template('add-occurrence.html')
    c = RequestContext(request, {})
    
    return HttpResponse(t.render(c))

def add_occurrence_post(request):
    
    return ""