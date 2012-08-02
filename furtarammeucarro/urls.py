from django.conf.urls import patterns, include, url
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    # url(r'^$', 'furtarammeucarro.views.home', name='home'),
    # url(r'^furtarammeucarro/', include('furtarammeucarro.foo.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
