"""
Shear Connection URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShearConnectionViewSet

router = DefaultRouter()
router.register(r'', ShearConnectionViewSet, basename='shear-connection')

urlpatterns = router.urls

