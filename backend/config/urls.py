# django imports
from django.contrib import admin
from django.urls import path
from django.urls import include
from django.conf import settings
from django.conf.urls.static import static

from apps.core.metrics_view import internal_metrics

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.core.urls')),  # Core app URLs (replaces osdag.urls)
    path('api/sections/', include('apps.sections.urls')),
    path('api/modules/', include('apps.modules.urls')),  # All module URLs aggregated here
    path('metrics', internal_metrics, name='prometheus-metrics'),  # internal only, see metrics_view
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if getattr(settings, 'ENABLE_SILK', False):
    urlpatterns.append(path('silk/', include('silk.urls', namespace='silk')))

if settings.DEBUG:
    urlpatterns += static(settings.OSIFILES_URL, document_root=settings.OSIFILES_ROOT)

