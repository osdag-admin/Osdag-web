"""Company logo paths sent with a report request are limited to stored logos."""
import os
import uuid

import pytest

from apps.core.api.design import design_report_pdf_view as view


@pytest.fixture
def logo_dir(tmp_path, monkeypatch):
    directory = tmp_path / "company_logo"
    directory.mkdir()
    monkeypatch.setattr(view, "_company_logo_dir", lambda: os.path.realpath(directory))
    return directory


def _stored_logo(logo_dir, ext=".png"):
    path = logo_dir / (uuid.uuid4().hex + ext)
    path.write_bytes(b"logo")
    return path


def test_full_path_returned_by_the_upload_is_accepted(logo_dir):
    logo = _stored_logo(logo_dir)
    assert view._safe_company_logo_path(str(logo)) == str(logo)


def test_bare_file_name_is_resolved_inside_the_logo_directory(logo_dir):
    logo = _stored_logo(logo_dir, ".jpeg")
    assert view._safe_company_logo_path(logo.name) == str(logo)


@pytest.mark.parametrize("value", [
    "../../etc/passwd",
    "/etc/passwd",
    "C:\\Windows\\win.ini",
    "logo.png",
    "0" * 32 + ".svg",
    "",
    None,
    123,
])
def test_other_values_are_dropped(logo_dir, value):
    assert view._safe_company_logo_path(value) == ""


def test_valid_name_that_was_never_stored_is_dropped(logo_dir):
    assert view._safe_company_logo_path(uuid.uuid4().hex + ".png") == ""
