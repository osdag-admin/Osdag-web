"""
Tension Member URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TensionMemberViewSet

router = DefaultRouter()
router.register(r'', TensionMemberViewSet, basename='tension-member')

urlpatterns = router.urls

