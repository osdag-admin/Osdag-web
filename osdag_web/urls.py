# django imports
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# simplejwt imports 
from rest_framework_simplejwt.views import TokenVerifyView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from osdag.web_api.beam_to_beam_api import BeamToBeamDesignAPI

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('osdag.urls')),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/design/beam-to-beam/', BeamToBeamDesignAPI.as_view(), name='beam_to_beam_design'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
