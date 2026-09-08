"""
Centralized constants for module slug-to-ID mappings.

All module slug → report module_id mappings are defined here
so they can be reused across views without duplication.
"""

REPORT_MODULE_ID_MAP = {
    # Shear Connection
    "fin-plate": "FinPlateConnection",
    "cleat-angle": "CleatAngleConnection",
    "end-plate": "EndPlateConnection",
    "seated-angle": "Seated-Angle-Connection",

    # Moment Connection
    "beam-beam-cover-plate-bolted": "Beam-to-Beam-Cover-Plate-Bolted-Connection",
    "beam-beam-cover-plate-welded": "Beam-to-Beam-Cover-Plate-Welded-Connection",
    "beam-beam-end-plate": "Beam-Beam-End-Plate-Connection",
    "beam-column-end-plate": "Beam-to-Column-End-Plate-Connection",
    "column-column-cover-plate-bolted": "Column-to-Column-Cover-Plate-Bolted-Connection",
    "column-column-cover-plate-welded": "Column-to-Column-Cover-Plate-Welded-Connection",
    "column-column-end-plate": "Column-to-Column-End-Plate-Connection",

    # Tension Member
    "bolted": "Tension-Member-Bolted-Design",
    "welded": "Tension-Member-Welded-Design",

    # Simple Connection
    "butt-joint-bolted": "ButtJointBolted",
    "butt-joint-welded": "ButtJointWelded",
    "lap-joint-bolted": "LapJointBolted",
    "lap-joint-welded": "LapJointWelded",

    # Compression Member
    "struts-bolted": "Struts-Bolted-Design",
    "struts-welded": "Struts-Welded-Design",
    "axially-loaded-column": "Axially-Loaded-Column",

    # Flexure Member
    "simply-supported-beam": "Simply-Supported-Beam",
    "purlin": "Purlin",
}


def get_report_module_id(slug):
    return REPORT_MODULE_ID_MAP.get(slug)
