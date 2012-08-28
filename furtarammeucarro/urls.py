from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic.simple import direct_to_template, redirect_to

admin.autodiscover()

urlpatterns = patterns('',
    (r'^$', direct_to_template, {'template': 'home.html'}),
    url(r'^add-occurrence$', 'occurrences.views.add_occurrence'),
    url(r'^add-occurrence-post$', 'occurrences.views.add_occurrence_post'),
    url(r'^get-occurrences$', 'occurrences.views.get_occurrences'),
    (r'^sobre-o-site$', direct_to_template, {'template': 'sobre.html'}),
    (r'^como-prevenir-roubos$', direct_to_template, {'template': 'como-prevenir.html'}),
    (r'^roubos$', 'occurrences.views.stolen_list'),
     (r'^estatisticas-de-roubos$', redirect_to, {'url': '/carros-mais-roubados'}),
    url(r'^carros-mais-roubados$', 'furtarammeucarro.views.estatisticas'),

    url(r'^admin/', include(admin.site.urls)),
)
