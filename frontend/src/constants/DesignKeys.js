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
export const KEY_DP_BOLT_TYPE = 'Bolt.TensionType';

// Connector Properties
export const KEY_CONNECTOR_MATERIAL = 'Connector.Material';
export const KEY_PLATETHK = 'Connector.Plate.Thickness_List';

// Design Preferences
export const KEY_DP_DETAILING_EDGE_TYPE = 'Detailing.Edge_type';
export const KEY_DP_DETAILING_GAP = 'Detailing.Gap';
export const KEY_DP_DETAILING_CORROSIVE_INFLUENCES = 'Detailing.Corrosive_Influences';
export const KEY_DP_DESIGN_METHOD = 'Design.Design_Method';
export const KEY_DESIGN_FOR = 'Design.For';

export const KEY_DP_WELD_FAB = 'Weld.Fab';
export const KEY_DP_WELD_MATERIAL_G_O = 'Weld.Material_Grade_OverWrite';
export const KEY_DP_WELD_TYPE = 'Weld.Type';
export const KEY_DP_DETAILING_PACKING_PLATE = 'Detailing.Packing_Plate';

// Plate and Weld Properties
export const KEY_WELD_SIZE = 'Weld.Size';
export const KEY_PLATE1_THICKNESS = "Plate1Thickness";
export const KEY_PLATE2_THICKNESS = "Plate2Thickness";
export const KEY_PLATE_WIDTH = "PlateWidth";
export const KEY_COVER_PLATE = "ButtJoint.CoverPlate";

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
export const KEY_DISP_PLATE1_THICKNESS = "Thickness of Plate-1 (mm) *";
export const KEY_DISP_PLATE2_THICKNESS = "Thickness of Plate-2 (mm) *";
export const KEY_DISP_PLATE_WIDTH = "Width of Plate (mm) *";
export const KEY_DISP_WELD_SIZE = 'Weld Size';
export const KEY_DISP_COVER_PLT = 'Cover Plate *';
export const KEY_DISP_DP_DETAILING_PACKING_PLATE = 'Packing Plate';

// Flexural Member Constants - Must match exactly with Common.py backend constants
export const KEY_ALLOW_CLASS = 'Optimum.Class';
export const KEY_EFFECTIVE_AREA_PARA = 'Effective.Area_Para';
export const KEY_LENGTH_OVERWRITE = 'Length.Overwrite';           // Matches Common.py KEY_LENGTH_OVERWRITE = 'Length.Overwrite'
export const KEY_BEARING_LENGTH = 'Bearing.Length';               // Matches Common.py KEY_BEARING_LENGTH = 'Bearing.Length'
export const KEY_SUPPORT = 'Support.Type';
export const KEY_TORSIONAL_RES = 'Torsion.restraint';
export const KEY_WARPING_RES = 'Warping.restraint';

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

// Module Keys - FinPlate

export const MODULE_KEY_FIN_PLATE = 'FinPlateConnection';
export const MODULE_KEY_SEAT_ANGLE = 'SeatedAngleConnection';
export const MODULE_DISPLAY_FIN_PLATE = 'FinPlateConnection';
// Module Keys - CleatAngle
export const MODULE_KEY_CLEAT_ANGLE = 'CleatAngleConnection';
export const MODULE_DISPLAY_CLEAT_ANGLE = 'CleatAngleConnection';
export const MODULE_DISPLAY_SEAT_ANGLE = 'SeatedAngleConnection';

// Module Keys - End Plate / Beam-Column End Plate / Beam-Beam End Plate
export const MODULE_KEY_END_PLATE = 'EndPlateConnection';
export const MODULE_DISPLAY_END_PLATE = 'EndPlateConnection';
export const MODULE_KEY_BEAM_COLUMN_END_PLATE = 'BeamToColumnEndPlate';
export const MODULE_KEY_BEAM_BEAM_END_PLATE = 'BeamBeamEndPlate';

// Module Keys - Cover Plate (Moment)
export const MODULE_KEY_COVER_PLATE_BOLTED = 'CoverPlateBolted';
export const MODULE_KEY_COVER_PLATE_WELDED = 'CoverPlateWelded';
export const MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_BOLTED = 'Beam-to-Beam-Cover-Plate-Bolted-Connection';
export const MODULE_KEY_BEAM_TO_BEAM_COVER_PLATE_WELDED = 'Beam-to-Beam-Cover-Plate-Welded-Connection';
export const MODULE_KEY_COVER_PLATE_BOLTED_ALT = 'Cover-Plate-Bolted-Connection';
export const MODULE_KEY_COVER_PLATE_WELDED_ALT = 'Cover-Plate-Welded-Connection';
export const MODULE_KEY_BEAM_BEAM_END_PLATE_ALT = 'Beam-Beam-End-Plate-Connection';
export const MODULE_KEY_BEAM_COLUMN_END_PLATE_ALT = 'Beam-to-Column-End-Plate-Connection';
export const MODULE_KEY_CC_COVER_PLATE_BOLTED = 'Column-to-Column-Cover-Plate-Bolted-Connection';
export const MODULE_KEY_CC_COVER_PLATE_WELDED = 'Column-to-Column-Cover-Plate-Welded-Connection';
export const MODULE_KEY_CC_END_PLATE = 'Column-to-Column-End-Plate-Connection';

// Module Keys - Base Plate
export const MODULE_KEY_BASE_PLATE = 'BasePlateConnection';

// Module Keys - Simple connections
export const MODULE_KEY_BUTT_JOINT_BOLTED = 'ButtJointBolted';
export const MODULE_KEY_BUTT_JOINT_WELDED = 'ButtJointWelded';
export const MODULE_KEY_LAP_JOINT_BOLTED = 'LapJointBolted';
export const MODULE_KEY_LAP_JOINT_WELDED = 'LapJointWelded';

// Module Keys - Tension
export const MODULE_KEY_TENSION_BOLTED = 'Tension-Member-Bolted-Design';
export const MODULE_KEY_TENSION_WELDED = 'Tension-Member-Welded-Design';
export const MODULE_KEY_BOLTED_TO_END_GUSSET = 'BoltedToEndGusset';
export const MODULE_KEY_WELDED_TO_END_GUSSET = 'WeldedToEndGusset';

// Module Keys - Flexure
export const MODULE_KEY_SIMPLY_SUPPORTED_BEAM = 'Simply-Supported-Beam';
export const MODULE_KEY_PURLIN = 'Purlin';
export const MODULE_KEY_ON_CANTILEVER_BEAM = 'On-Cantilever-Beam';

// Compression Member Keys
export const KEY_END1 = 'Member.End_1';
export const KEY_END2 = 'Member.End_2';
export const KEY_ALLOW_LOAD = 'Member.AllowLoadType';

// Module Keys - Compression
export const MODULE_KEY_STRUTS_BOLTED = 'Struts-Bolted-Design';
export const MODULE_KEY_STRUTS_WELDED = 'Struts-Welded-Design';

export const MODULE_KEY_AXIALLY_LOADED_COLUMN = 'AxiallyLoadedColumn';