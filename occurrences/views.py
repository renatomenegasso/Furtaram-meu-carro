from django.http import HttpResponse, HttpResponseRedirect
from django.core.context_processors import csrf
from django.template import loader
from django.template.context import RequestContext
from occurrences.models import Theft, TheftContactInfo, StolenCarInfo

def add_occurrence(request):
    t = loader.get_template('add-occurrence.html')
    c = RequestContext(request)
    c.update(csrf(request))

    return HttpResponse(t.render(c))

def add_occurrence_post(request):
    
    def __populateObjFromRequest(obj, request):
    	properties = dir(obj)
    	for field in properties:
    		if not hasattr(obj, field):
    			continue

    		if request.POST.has_key(field):
    			setattr(obj, field, request.POST.get(field))
    	return obj

    theft = __populateObjFromRequest(Theft(), request)

    print theft.latitude

    return HttpResponse("{success:true}")