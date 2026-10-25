"""Every module the frontend registry lists has the backend endpoints the frontend calls."""
import re
from pathlib import Path

import pytest
from django.urls import Resolver404, resolve

REGISTRY = Path(__file__).resolve().parents[4] / "frontend" / "src" / "modules" / "registry.js"

# Same paths as frontend/src/datasources/endpoints.js (MODULES.*).
ENDPOINTS = ["options/", "design/", "cad/", "report/generate-initial/"]


def _api_slugs():
    return sorted(set(re.findall(r'apiSlug:\s*"([^"]+)"', REGISTRY.read_text(encoding="utf-8"))))


API_SLUGS = _api_slugs()


def test_registry_lists_modules():
    assert len(API_SLUGS) >= 20, API_SLUGS


@pytest.mark.parametrize("slug", API_SLUGS)
@pytest.mark.parametrize("endpoint", ENDPOINTS)
def test_endpoint_resolves(slug, endpoint):
    url = f"/api/modules/{slug}/{endpoint}"
    try:
        resolve(url)
    except Resolver404:
        pytest.fail(f"{url} has no backend route")
