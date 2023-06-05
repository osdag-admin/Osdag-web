from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_design_types, name='index'),
    path('connections', views.get_connections, name='connections'),
    path('connections/shear-connection',
         views.get_shear_connection, name='shear-connection'),
    path('connections/moment-connection', views.get_moment_connection,
         name='moment_connection'),
    path('connections/moment-connection/beam-to-beam-splice',
         views.get_b2b_splice, name='beam-to-beam-splice'),
    path('connections/moment-connection/beam-to-column',
         views.get_b2column, name='beam-to-column'),
    path('connections/moment-connection/column-to-column-splice',
         views.get_c2c_splice, name='column-to-column-splice'),
    path('connections/base-plate', views.get_base_plate, name='base-plate'),
    path('tension-member', views.get_tension_member, name='tension-member'),
]
