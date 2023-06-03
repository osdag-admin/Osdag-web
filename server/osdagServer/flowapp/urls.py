from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_design_types, name='index'),
]
