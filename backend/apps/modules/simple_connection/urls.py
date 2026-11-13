from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SimpleConnectionViewSet

router = DefaultRouter()
router.register(r'', SimpleConnectionViewSet, basename='simple-connection')

urlpatterns = router.urls
