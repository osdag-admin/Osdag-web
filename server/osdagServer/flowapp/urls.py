from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_design_types, name='index'),
    path('connections', views.get_connections, name='connections'),
    path('connections/shear-connection',
         views.get_shear_connection, name='shear-connection'),
    path('connections/moment-connection', views.get_moment_connection,
         name='moment_connection'),
    path('connections/moment-connection/b2b-splice',
         views.get_b2b_splice, name='b2b-splice'),
    path('connections/moment-connection/b2column',
         views.get_b2column, name='b2column'),
    path('connections/moment-connection/c2c-splice',
         views.get_c2c_splice, name='c2c-splice'),
    path('connections/base-plate', views.get_base_plate, name='base-plate'),
    path('tension-member', views.get_tension_member, name='tension-member'),
]
