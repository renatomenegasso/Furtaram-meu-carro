# -*- coding: utf-8 -*-
from django.http import HttpResponse
from utils import serialize_to_json
 
class JSONResponse(HttpResponse):
    """ JSON response class """
    def __init__(self,content='',json_opts={},mimetype="application/json",*args,**kwargs):

        if content:
            content = serialize_to_json(content,**json_opts)
        else:
            content = serialize_to_json([],**json_opts)
        super(JSONResponse,self).__init__(content,mimetype,*args,**kwargs)