"""
Module id alias resolution shared by CAD generation/export endpoints.

Both `cad_model_api.py` and `cad_model_export.py` need to normalize frontend module
slugs/hyphenated ids to the backend `MODULE_ID`s used by `get_module_api()`.
"""

from typing import Dict


MODULE_ALIASES: Dict[str, str] = {
    # legacy hyphenated
    "ButtJointWelded": "ButtJointWelded",
    "ButtJointBolted": "ButtJointBolted",
    "LapJointWelded": "LapJointWelded",
    "LapJointBolted": "LapJointBolted",
    "Beam-to-Beam-Cover-Plate-Bolted-Connection": "Cover-Plate-Bolted-Connection",
    "Beam-to-Beam-Cover-Plate-Welded-Connection": "Cover-Plate-Welded-Connection",
    "Beam-Beam-End-Plate-Connection": "Beam-Beam-End-Plate-Connection",
    "Beam-to-Column-End-Plate-Connection": "Beam-to-Column-End-Plate-Connection",
    "Column-to-Column-Cover-Plate-Bolted-Connection": "ColumnCoverPlateBolted",
    "Column-to-Column-Cover-Plate-Welded-Connection": "Column-to-Column-Cover-Plate-Welded-Connection",
    "Column-to-Column-End-Plate-Connection": "Column-to-Column-End-Plate-Connection",
    # slug forms
    "butt-joint-welded": "ButtJointWelded",
    "butt-joint-bolted": "ButtJointBolted",
    "lap-joint-welded": "LapJointWelded",
    "lap-joint-bolted": "LapJointBolted",
    # shear slugs
    "shear-connection/fin-plate": "FinPlateConnection",
    "shear-connection/cleat-angle": "CleatAngleConnection",
    "shear-connection/header-plate": "HeaderPlateConnection",
    "shear-connection/seated-angle": "SeatedAngleConnection",
    # moment slugs
    "moment-connection/beam-beam-cover-plate-bolted": "Cover-Plate-Bolted-Connection",
    "moment-connection/beam-beam-cover-plate-welded": "Cover-Plate-Welded-Connection",
    "moment-connection/beam-beam-end-plate": "Beam-Beam-End-Plate-Connection",
    "moment-connection/beam-column-end-plate": "Beam-to-Column-End-Plate-Connection",
    "moment-connection/column-column-cover-plate-bolted": "ColumnCoverPlateBolted",
    "moment-connection/column-column-cover-plate-welded": "Column-to-Column-Cover-Plate-Welded-Connection",
    "moment-connection/column-column-end-plate": "Column-to-Column-End-Plate-Connection",
    # moment keys
    "CoverPlateBolted": "Cover-Plate-Bolted-Connection",
    "CoverPlateWelded": "Cover-Plate-Welded-Connection",
    "BeamBeamEndPlate": "Beam-Beam-End-Plate-Connection",
    "BeamColumnEndPlate": "Beam-to-Column-End-Plate-Connection",
    "CCCoverPlateBolted": "ColumnCoverPlateBolted",
    "CCCoverPlateWelded": "Column-to-Column-Cover-Plate-Welded-Connection",
    "CCEndPlate": "Column-to-Column-End-Plate-Connection",
}


def resolve_module_id(module_id: str) -> str:
    """Return normalized module id for backend lookup."""
    return MODULE_ALIASES.get(module_id, module_id)

