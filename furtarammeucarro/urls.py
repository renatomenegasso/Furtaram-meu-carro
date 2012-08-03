from django.conf.urls import patterns, include, url
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'furtarammeucarro.views.home'),
    url(r'^add-occurrence', 'occurrences.views.add_occurrence'),
    url(r'^add-occurrence-post', 'occurrences.views.add_occurrence_post'),
    url(r'^admin/', include(admin.site.urls)),
)
