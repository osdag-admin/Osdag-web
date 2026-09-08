"""
Base Plate URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BasePlateViewSet

router = DefaultRouter()
router.register(r'', BasePlateViewSet, basename='base-plate')

urlpatterns = router.urls
