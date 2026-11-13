"""Additional Inputs load the selected section's properties, and report section titles parse whole."""
import pytest

from apps.core.api.design.report_customization_api import LaTeXParser
from apps.core.api.design.sync_merge import lookup_sources, merge_design_pref_sync

# (module session name, input key, designation, role the Additional Inputs tab reads)
SECTION_CASES = [
    ("Column Column End Plate Connection", "supported_designation", "HB 150", "supporting"),
    ("Beam Beam End Plate Connection", "supported_designation", "MB 300", "supported"),
    ("Simply Supported Beam Design", "section_designation", "MB 400", "supporting"),
    ("Simply Supported Beam Design", "section_designation", "HB 150", "supporting"),
    ("On Cantilever Beam Design", "section_designation", "MB 400", "supporting"),
    ("Axially Loaded Column", "section_designation", "HB 150", "supporting"),
    # Beam sections are offered for this module too, so both tables must be searched.
    ("Axially Loaded Column", "section_designation", "JB 150", "supporting"),
    ("Tension Member Bolted Design", "section_designation", "20 x 20 x 3", "supported"),
    ("Tension Member Welded Design", "section_designation", "20 x 20 x 3", "supported"),
    ("Struts Bolted to End Gusset", "section_designation", "20 x 20 x 3", "supported"),
    ("Struts Welded to End Gusset", "section_designation", "20 x 20 x 3", "supported"),
]


@pytest.mark.parametrize("module,key,designation,role", SECTION_CASES)
def test_selected_section_details_reach_the_tab_that_reads_them(module, key, designation, role):
    _, _, _, details = merge_design_pref_sync(
        module_session_name=module,
        inputs={},
        operation="open",
        design_pref_draft={key: [designation]},
        **lookup_sources(None),
    )
    assert details[role].get("Designation") == designation


def test_section_titles_keep_their_nested_braces():
    latex = "\n".join([
        r"\section{Design Checks}",
        r"\subsection{Bolt Design {-} Connected to Beam}",
        r"\subsection{Bolt Design {-} Connected to Column}",
        r"\subsection{Plain Title}",
    ])
    sections = LaTeXParser().parse_sections(latex)
    assert sections == {
        "Design Checks": [
            "Bolt Design {-} Connected to Beam",
            "Bolt Design {-} Connected to Column",
            "Plain Title",
        ]
    }
