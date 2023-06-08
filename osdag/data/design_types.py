design_type_data = {
    'data': [
        {
            'id': 1,
            'name': 'connections'
        },
        {
            'id': 2,
            'name': 'Tension_Member'
        },
        {
            'id': 3,
            'name': 'Compression_Member'
        },
        {
            'id': 4,
            'name': 'Flexural_Member'
        },
        {
            'id': 5,
            'name': 'Beam_Column'
        },
        {
            'id': 6,
            'name': 'Plate_Girder'
        },
        {
            'id': 7,
            'name': 'Truss'
        },
        {
            'id': 8,
            'name': '2D_Frame'
        },
        {
            'id': 9,
            'name': '3D_Frame'
        },
        {
            'id': 10,
            'name': 'Group_Design'
        }
    ],
    'success': True,
}

connections_data = {
    'data': [
        {
            'id': 1,
            'name': 'Shear_Connection'
        },
        {
            'id': 2,
            'name': 'Moment_Connection'
        },
        {
            'id': 3,
            'name': 'Base_Plate'
        },
        {
            'id': 4,
            'name': 'Truss_Connection'
        }],
    'has_subtypes': True,
    'success': True
}

shear_connection = {
    'data': [
        {
            'id': 1,
            'name': 'Fin_Plate',
            'image_name': 'sc_fin_plate'
        },
        {
            'id': 2,
            'name': 'Cleat_Angle',
            'image_name': 'sc_cleat_angle'
        },
        {
            'id': 3,
            'name': 'End_Plate',
            'image_name': 'sc_end_plate'
        },
        {
            'id': 4,
            'name': 'Seated_Angle',
            'image_name': 'sc_seated_angle'
        }],
    'has_subtypes': False,
    'success': True
}

moment_connection = {
    'data': [
        {
            'id': 1,
            'name': 'Beam-To-Beam_Splice'
        },
        {
            'id': 2,
            'name': 'Beam-To-Column'
        },
        {
            'id': 3,
            'name': 'Column-To-Column_Splice'
        },
        {
            'id': 4,
            'name': 'PEB'
        }],
    'has_subtypes': True,
    'success': True
}

b2b_splice = {
    'data': [{
        'id': 1,
        'name': 'Cover_Plate_Bolted',
        'image_name': 'mc_btb_cpb'
    },
        {
        'id': 2,
        'name': 'Cover_Plate_Welded',
        'image_name': 'mc_btb_cpw'
    },
        {
        'id': 3,
        'name': 'End_Plate',
        'image_name': 'mc_btb_ep'
    }],
    'has_subtypes': False,
    'success': True
}

b2column = {
    'data': [{
        'id': 1,
        'name': 'End_Plate',
        'image_name': 'mc_btc_ep'
    }],
    'has_subtypes': False,
    'success': True
}

c2c_splice = {
    'data': [
        {
            'id': 1,
            'name': 'Cover_Plate_Bolted',
            'image_name': 'mc_ctc_cpb'
        },
        {
            'id': 2,
            'name': 'Cover_Plate_Welded',
            'image_name': 'mc_ctc_cpw'
        },
        {
            'id': 3,
            'name': 'End_Plate',
            'image_name': 'mc_ctc_ep'
        }],
    'has_subtypes': False,
    'success': True
}

base_plate = {
    'data': [{
        'id': 1,
        'name': 'Base_Plate_Connection',
        'image_name': 'base_plate'
    }],
    'has_subtypes': False,
    'success': True
}

tension_member = {
    'data': [
        {
            'id': 1,
            'name': 'Bolted_To_End_Gusset',
            'image_name': 'bolted_to_end'
        },
        {
            'id': 2,
            'name': 'Welded_To_End_Gusset',
            'image_name': 'welded_to_end'
        }],
    'has_subtypes': False,
    'success': True
}
