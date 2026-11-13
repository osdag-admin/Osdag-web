"""URL routes for `/api/sections/`."""

from django.urls import path

from apps.sections.views import (
    SectionCatalogExportView,
    SectionCustomBulkDeleteView,
    SectionCustomView,
    SectionExportView,
    SectionImportView,
    SectionTemplateView,
)

urlpatterns = [
    path("template/", SectionTemplateView.as_view(), name="sections-template"),
    path("catalog-export/", SectionCatalogExportView.as_view(), name="sections-catalog-export"),
    path("import/", SectionImportView.as_view(), name="sections-import"),
    path("custom/all/", SectionCustomBulkDeleteView.as_view(), name="sections-custom-bulk-delete"),
    path("custom/", SectionCustomView.as_view(), name="sections-custom"),
    path("export/", SectionExportView.as_view(), name="sections-export"),
]
