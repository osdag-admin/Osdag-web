"""URL routes for `/api/sections/`."""

from django.urls import path

from apps.sections.views import (
    SectionCustomView,
    SectionExportView,
    SectionImportView,
    SectionTemplateView,
)

urlpatterns = [
    path("template/", SectionTemplateView.as_view(), name="sections-template"),
    path("import/", SectionImportView.as_view(), name="sections-import"),
    path("custom/", SectionCustomView.as_view(), name="sections-custom"),
    path("export/", SectionExportView.as_view(), name="sections-export"),
]
