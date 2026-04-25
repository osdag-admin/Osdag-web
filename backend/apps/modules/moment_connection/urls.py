"""
Moment Connection URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MomentConnectionViewSet

router = DefaultRouter()
router.register(r'', MomentConnectionViewSet, basename='moment-connection')

urlpatterns = router.urls

