from osdag_api.module_finder import *

developed_modules = [
    "Fin-Plate-Connection",
    "End-Plate-Connection", 
    "Cleat-Angle-Connection",
    "Seated-Angle-Connection",
    "Cover-Plate-Bolted-Connection",
    "Cover-Plate-Welded-Connection",
    "Beam-Beam-End-Plate-Connection",
    "Beam-to-Column-End-Plate-Connection",
    "Tension-Member-Bolted-Design",
    "Simply-Supported-Beam"
]

module_dict = [
    {
        "key": "Fin-Plate-Connection",
        "image": "/static/images/modules/fin_plate_connection.png",
        "name": "Fin Plate",
        "path": "Connection/Shear Connection",
    },
    {
        "key": "End-Plate-Connection",
        "image": "/static/images/modules/end_plate_connection.png",
        "name": "End Plate",
        "path": "Connection/Shear Connection",
    },
    {
        "key": "Cleat-Angle-Connection",
        "image": "/static/images/modules/cleat_angle_connection.png",
        "name": "Cleat Angle",
        "path": "Connection/Shear Connection",
    },
    {
        "key": "Seated-Angle-Connection",
        "image": "/static/images/modules/seated_angle_connection.png",
        "name": "Seated Angle",
        "path": "Connection/Shear Connection"
    },
    {
        "key": "Cover-Plate-Bolted-Connection",
        "image": "/static/images/modules/cover_plate_bolted_connection.png",
        "name": "Cover Plate Bolted",
        "path": "Connection/Moment Connection"
    },
    {
        "key": "Beam-Beam-End-Plate-Connection",
        "image": "/static/images/modules/beam_beam_end_plate_connection.png",
        "name": "Beam Beam End Plate",
        "path": "Connection/Moment Connection"
    },
    {
        "key": "Cover-Plate-Welded-Connection",
        "image": "/static/images/modules/cover_plate_welded_connection.png",
        "name": "Cover Plate Welded",
        "path": "Connection/Moment Connection"
    },
    {
        "key": "Beam-to-Column-End-Plate-Connection",
        "image": "/static/images/modules/beam_to_column_end_plate_connection.png",
        "name": "Beam-to-Column End Plate",
        "path": "Connection/Moment Connection"
    },
    {
        "key": "Tension-Member-Bolted-Design",
        "image": "/static/images/modules/tension_member_bolted.png",
        "name": "Tension Member Bolted Design",
        "path": "Tension Member/tension_bolted"
    },
    {
        "key": "Simply-Supported-Beam",
        "image": "/static/images/modules/simply_supported_beam.png",
        "name": "Simply Supported Beam",
        "path": "Flexural Member/simply_supported_beam"
    }
]
