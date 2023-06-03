from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_design_types, name='index'),
    path('connections', views.get_connections, name='connections'),
    path('shear-connection', views.get_shear_connection, name='shear-connection'),
    path('moment-connection', views.get_moment_connection,
         name='moment_connection'),
    path('moment-connection/b2b-splice',
         views.get_b2b_splice, name='b2b-splice'),
    path('moment-connection/b2column', views.get_b2column, name='b2column'),
    path('moment-connection/c2c-splice',
         views.get_c2c_splice, name='c2c-splice'),
    path('base-plate', views.get_base_plate, name='base-plate'),
    path('tension-member', views.get_tension_member, name='tension-member'),
]
