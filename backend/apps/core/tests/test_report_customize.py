"""Saving a report as PDF compiles it without touching the process working directory.

The working directory is shared by every request thread, so changing it while pdflatex runs
made a second report request look for its .tex file in the first request's temporary folder
and answer "LaTeX file not found".
"""
import os

import pytest
from rest_framework.test import APIRequestFactory

from apps.core.api.design import report_customization_api as api

REPORT_ID = "AbCdEfGhIjKlMnOp"
TEX = "\\documentclass{article}\n\\begin{document}\n\\section{Input Parameters}\nx\n\\end{document}\n"


@pytest.fixture
def storage(tmp_path, monkeypatch):
    report_dir = tmp_path / "file_storage" / "design_report" / REPORT_ID
    report_dir.mkdir(parents=True)
    (report_dir / f"{REPORT_ID}.tex").write_text(TEX, encoding="utf-8")
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(api, "PDFLATEX", "pdflatex")
    return tmp_path


def _save_pdf():
    request = APIRequestFactory().post(
        "/api/report/customize/",
        {"report_id": REPORT_ID, "selected_sections": ["Input Parameters"]},
        format="json",
    )
    return api.CustomizeReport.as_view()(request)


def _body(response):
    return b"".join(response.streaming_content) if response.streaming else response.content


def test_pdf_is_compiled_in_the_temp_dir_and_cwd_is_unchanged(storage, monkeypatch):
    cwd_before = os.getcwd()
    seen = []

    def fake_run(cmd, **kwargs):
        if "--version" not in cmd:
            work_dir = kwargs["cwd"]
            seen.append(work_dir)
            assert os.getcwd() == cwd_before
            assert os.path.isfile(os.path.join(work_dir, "filtered_report.tex"))
            with open(os.path.join(work_dir, "filtered_report.pdf"), "wb") as f:
                f.write(b"%PDF-1.5 fake")
        return type("Done", (), {"returncode": 0, "stdout": "", "stderr": ""})()

    monkeypatch.setattr(api.subprocess, "run", fake_run)

    response = _save_pdf()

    assert response.status_code == 200
    assert _body(response) == b"%PDF-1.5 fake"
    assert os.getcwd() == cwd_before
    assert len(seen) == 2  # two LaTeX passes
    assert not os.path.exists(seen[0])


def test_a_request_during_a_compile_still_finds_its_tex_file(storage, monkeypatch):
    inner = []
    started = []

    def fake_run(cmd, **kwargs):
        if "--version" not in cmd:
            if not started:
                started.append(True)
                inner.append(_save_pdf())  # another user saves while this compile is running
            with open(os.path.join(kwargs["cwd"], "filtered_report.pdf"), "wb") as f:
                f.write(b"%PDF-1.5 fake")
        return type("Done", (), {"returncode": 0, "stdout": "", "stderr": ""})()

    monkeypatch.setattr(api.subprocess, "run", fake_run)

    outer = _save_pdf()

    assert inner[0].status_code == 200
    assert outer.status_code == 200


def test_failed_compile_reports_an_error_and_cleans_up(storage, monkeypatch):
    cwd_before = os.getcwd()
    work_dirs = []

    def fake_run(cmd, **kwargs):
        if "--version" not in cmd:
            work_dirs.append(kwargs["cwd"])
        return type("Done", (), {"returncode": 1, "stdout": "! Emergency stop.", "stderr": ""})()

    monkeypatch.setattr(api.subprocess, "run", fake_run)

    response = _save_pdf()

    assert response.status_code == 500
    assert "PDF compilation failed" in response.data["error"]["message"]
    assert os.getcwd() == cwd_before
    assert work_dirs and not os.path.exists(work_dirs[0])


def test_missing_pdflatex_is_a_clear_error(storage, monkeypatch):
    monkeypatch.setattr(api, "PDFLATEX", "")
    monkeypatch.setattr(api.shutil, "which", lambda name: None)

    response = _save_pdf()

    assert response.status_code == 500
    assert "pdflatex" in response.data["error"]["message"]
