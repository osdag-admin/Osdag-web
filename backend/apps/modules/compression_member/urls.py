"""
Compression Member URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompressionMemberViewSet

router = DefaultRouter()
router.register(r'', CompressionMemberViewSet, basename='compression-member')

urlpatterns = router.urls
