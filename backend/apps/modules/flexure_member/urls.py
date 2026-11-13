"""
Flexure Member URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FlexureMemberViewSet

router = DefaultRouter()
router.register(r'', FlexureMemberViewSet, basename='flexure-member')

urlpatterns = router.urls

