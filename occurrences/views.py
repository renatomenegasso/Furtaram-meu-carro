#coding=ISO-8859-1
from django.http import HttpResponse, HttpResponseRedirect
from django.core.context_processors import csrf
from django.template import loader
from django.template.context import RequestContext
from jsonui.response import JSONResponse
from occurrences.models import Theft, TheftContactInfo, StolenCarInfo

def add_occurrence(request):

    t = loader.get_template('add-occurrence.html')
    c = RequestContext(request)
    c.update(csrf(request))

    return HttpResponse(t.render(c))

def add_occurrence_post(request):
    if request.POST.get("address") == "":
        return JSONResponse({'errors':{'address':['Informe um endereço']}})

    theft = __populateObjFromRequest(Theft(), request)
    theft.ip = __get_client_ip(request)
    theft.save()

    contact_info = __populateObjFromRequest(TheftContactInfo(), request)
    if not contact_info is None:
        contact_info.theft = theft
        contact_info.save()

    stolen_car = __populateObjFromRequest(StolenCarInfo(), request)
    if not stolen_car is None:
        stolen_car.theft = theft
        stolen_car.save()

    return JSONResponse({'success':True})

def get_occurrences(request):
    occurrences = Theft.objects.filter(latitude__isnull=False, longitude__isnull=False).values('id', 'latitude', 'longitude')
    return JSONResponse({'occurrences':occurrences})

def __get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def __populateObjFromRequest(obj, request):
    properties = dir(obj)
    has_field_filled = False
    for field in properties:
        if not hasattr(obj, field):
            continue

        if request.POST.has_key(field):
            if request.POST.get(field) != "":
                has_field_filled = True
                setattr(obj, field, request.POST.get(field))
            else:
                setattr(obj, field, None)
    
    return obj if has_field_filled else None