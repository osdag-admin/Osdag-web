from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_design_types, name='index'),
    path('connections', views.get_connections, name='connections'),
    path('shear-connection', views.get_shear_connection, name='shear-connection'),
    path('moment-connection', views.get_moment_connection,
         name='moment_connection'),
    path('b2b-splice', views.get_b2b_splice, name='b2b-splice'),
]
