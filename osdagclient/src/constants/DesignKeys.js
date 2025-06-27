// Design Keys Constants
// These keys should match exactly with the backend KEY constants in Common.py

// Module and Basic Info
export const KEY_MODULE = 'Module';
export const KEY_CONN = 'Connectivity';
export const KEY_LOCATION = 'Conn_Location';
export const KEY_MATERIAL = 'Material';

// Member Properties
export const KEY_SEC_MATERIAL = 'Member.Material';
export const KEY_SECSIZE = 'Member.Designation';
export const KEY_SEC_PROFILE = 'Member.Profile';
export const KEY_LENGTH = 'Member.Length';

// Loads
export const KEY_SHEAR = 'Load.Shear';
export const KEY_AXIAL = 'Load.Axial';
export const KEY_MOMENT = 'Load.Moment';

// Bolt Properties
export const KEY_D = 'Bolt.Diameter';
export const KEY_TYP = 'Bolt.Type';
export const KEY_GRD = 'Bolt.Grade';
export const KEY_DP_BOLT_HOLE_TYPE = 'Bolt.Bolt_Hole_Type';
export const KEY_DP_BOLT_SLIP_FACTOR = 'Bolt.Slip_Factor';

// Connector Properties
export const KEY_CONNECTOR_MATERIAL = 'Connector.Material';
export const KEY_PLATETHK = 'Connector.Plate.Thickness_List';

// Design Preferences
export const KEY_DP_DETAILING_EDGE_TYPE = 'Detailing.Edge_type';
export const KEY_DP_DETAILING_GAP = 'Detailing.Gap';
export const KEY_DP_DETAILING_CORROSIVE_INFLUENCES = 'Detailing.Corrosive_Influences';
export const KEY_DP_DESIGN_METHOD = 'Design.Design_Method';

// Display Keys (for labels)
export const KEY_DISP_MODULE = 'Module';
export const KEY_DISP_CONN = 'Connectivity';
export const KEY_DISP_LOCATION = 'Connection Location';
export const KEY_DISP_MATERIAL = 'Material';
export const KEY_DISP_SEC_MATERIAL = 'Member Material';
export const KEY_DISP_SECSIZE = 'Member Designation';
export const KEY_DISP_SEC_PROFILE = 'Member Profile';
export const KEY_DISP_LENGTH = 'Member Length';
export const KEY_DISP_SHEAR = 'Shear Force';
export const KEY_DISP_AXIAL = 'Axial Force';
export const KEY_DISP_MOMENT = 'Moment';
export const KEY_DISP_D = 'Bolt Diameter';
export const KEY_DISP_TYP = 'Bolt Type';
export const KEY_DISP_GRD = 'Bolt Grade';
export const KEY_DISP_BOLT_HOLE_TYPE = 'Bolt Hole Type';
export const KEY_DISP_BOLT_SLIP_FACTOR = 'Bolt Slip Factor';
export const KEY_DISP_CONNECTOR_MATERIAL = 'Connector Material';
export const KEY_DISP_PLATETHK = 'Plate Thickness';
export const KEY_DISP_DETAILING_EDGE_TYPE = 'Edge Type';
export const KEY_DISP_DETAILING_GAP = 'Detailing Gap';
export const KEY_DISP_DETAILING_CORROSIVE_INFLUENCES = 'Corrosive Influences';
export const KEY_DISP_DESIGN_METHOD = 'Design Method';

// Flexural Member Constants - Must match exactly with Common.py backend constants
export const KEY_ALLOW_CLASS = 'Design.Allowable_Class';
export const KEY_EFFECTIVE_AREA_PARA = 'Design.Effective_Area_Parameter';
export const KEY_LENGTH_OVERWRITE = 'Length.Overwrite';           // Matches Common.py KEY_LENGTH_OVERWRITE = 'Length.Overwrite'
export const KEY_BEARING_LENGTH = 'Bearing.Length';               // Matches Common.py KEY_BEARING_LENGTH = 'Bearing.Length'
export const KEY_SUPPORT = 'Support.Type';
export const KEY_TORSIONAL_RES = 'Torsion.restraint';             // Matches Common.py KEY_TORSIONAL_RES = 'Torsion.restraint'
export const KEY_WARPING_RES = 'Warping.restraint';               // Matches Common.py KEY_WARPING_RES = 'Warping.restraint'

// Flexural Member Display Constants
export const KEY_DISP_PLASTIC_STRENGTH_MOMENT = 'Plastic Strength (kNm)';
export const KEY_DISP_Bending_STRENGTH_MOMENT = 'Bending Strength (kNm)';
export const KEY_DISP_LTB_Bending_STRENGTH_MOMENT = 'Lateral Torsional Buckling Strength (kNm)';
export const KEY_DISP_Elastic_CM = 'Critical Moment (M_cr)';
export const KEY_DISP_T_constatnt = 'Torsional Constant (mm⁴)';
export const KEY_DISP_W_constatnt = 'Warping Constant (mm⁶)';
export const KEY_DISP_BUCKLING_STRENGTH = 'Buckling Strength (kN)';
export const KEY_WEB_CRIPPLING = 'Crippling.Strength';
export const KEY_IMPERFECTION_FACTOR_LTB = 'Imperfection.LTB';
export const KEY_SR_FACTOR_LTB = 'SR.LTB';
export const KEY_NON_DIM_ESR_LTB = 'NDESR.LTB';

// Additional constants for Flexural Member
export const KEY_DESIGN_TYPE_FLEXURE = "KEY_DESIGN_TYPE_FLEXURE"; 