"""Design logs sent with a report request reach the report's Design Log section."""
from apps.core.api.design.design_report_pdf_view import format_report_logs

# reportGenerator_latex prints a log line only if it contains one of these words.
REPORT_LEVEL_WORDS = ("INFO", "WARNING", "ERROR")


def _printed_by_report(line):
    return any(word in line for word in REPORT_LEVEL_WORDS)


def test_custom_logger_entries_become_lines_the_report_prints():
    logs = [
        {"message": "Design is safe", "type": "info", "timestamp": "2026-10-25 15:50:01"},
        {"message": "Bolt spacing is close to the limit", "type": "warning", "timestamp": "2026-10-25 15:50:02"},
        {"message": "Plate is too thin", "type": "error", "timestamp": "2026-10-25 15:50:03"},
        {"message": "Solver stopped", "type": "critical", "timestamp": "2026-10-25 15:50:04"},
    ]
    lines = format_report_logs(logs).split("\n")
    assert lines == [
        "2026-10-25 15:50:01 - INFO - Design is safe",
        "2026-10-25 15:50:02 - WARNING - Bolt spacing is close to the limit",
        "2026-10-25 15:50:03 - ERROR - Plate is too thin",
        "2026-10-25 15:50:04 - ERROR - Solver stopped",
    ]
    assert all(_printed_by_report(line) for line in lines)


def test_missing_level_defaults_to_info():
    assert format_report_logs([{"message": "m", "timestamp": "t"}]) == "t - INFO - m"


def test_no_logs():
    assert format_report_logs([]) == ""
    assert format_report_logs(None) == ""
