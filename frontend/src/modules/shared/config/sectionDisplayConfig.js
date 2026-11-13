import Slope_Beam from "../../../assets/Slope_Beam.png";
import equaldp from "../../../assets/equaldp.png";
import { UNIT_LABELS } from "../constants/engineering";

/**
 * Display configurations for different section types in the GenericSectionView.
 */

export const BEAM_DISPLAY_CONFIG = {
  designationKey: "beam_section",
  showType: true,
  image: Slope_Beam,
  dimensions: [
    { label: "Depth, D", key: "D" },
    { label: "Flange Width, B", key: "B" },
    { label: "Flange Thickness, T", key: "T" },
    { label: "Web Thickness, t", key: "tw" },
    { label: "Flange Slope, a", key: "FlangeSlope", unit: UNIT_LABELS.ANGLE },
    { label: "Root Radius, R1", key: "R1" },
    { label: "Toe Radius, R2", key: "R2" },
  ],
  properties: {
    middle: [
      { label: "Mass, M", key: "Mass", unit: UNIT_LABELS.MASS },
      { label: "Sectional Area, a", key: "Area", unit: UNIT_LABELS.AREA },
      { label: "2nd Moment of Area, Iz", key: "Iz", unit: UNIT_LABELS.MOMENT_OF_AREA },
      { label: "2nd Moment of Area, Iy", key: "Iy", unit: UNIT_LABELS.MOMENT_OF_AREA },
      { label: "Radius of Gyration, rz", key: "rz", unit: UNIT_LABELS.RADIUS_OF_GYRATION },
      { label: "Radius of Gyration, ry", key: "ry", unit: UNIT_LABELS.RADIUS_OF_GYRATION },
      { label: "Elastic Modulus, Zz", key: "Zz", unit: UNIT_LABELS.ELASTIC_MODULUS },
      { label: "Elastic Modulus, Zy", key: "Zy", unit: UNIT_LABELS.ELASTIC_MODULUS },
    ],
    right: [
      { label: "Plastic Modulus, Zpz", key: "Zpz", unit: UNIT_LABELS.PLASTIC_MODULUS },
      { label: "Plastic Modulus, Zpy", key: "Zpy", unit: UNIT_LABELS.PLASTIC_MODULUS },
      { label: "Torsion Constant, It", key: "It", unit: UNIT_LABELS.TORSION_CONSTANT },
      { label: "Warping Constant, Iw", key: "Iw", unit: UNIT_LABELS.WARPING_CONSTANT },
    ]
  }
};

export const COLUMN_DISPLAY_CONFIG = {
  ...BEAM_DISPLAY_CONFIG,
  designationKey: "column_section",
};

export const ANGLE_DISPLAY_CONFIG = {
  designationKey: "Designation",
  showType: true,
  image: equaldp,
  dimensions: [
    { label: "Long Leg, A", key: "a" },
    { label: "Short Leg, B", key: "b" },
    { label: "Leg Thickness, t", key: "t" },
    { label: "Root Radius, R1", key: "R1" },
    { label: "Toe Radius, R2", key: "R2" },
  ],
  properties: {
    middle: [
      { label: "Mass, M", key: "Mass", unit: UNIT_LABELS.MASS },
      { label: "Sectional Area, a", key: "Area", unit: UNIT_LABELS.AREA },
      { label: "Cz", key: "Cz", unit: UNIT_LABELS.RADIUS_OF_GYRATION },
      { label: "Cy", key: "Cy", unit: UNIT_LABELS.RADIUS_OF_GYRATION },
      { label: "2nd Moment of Area, Iz", key: "Iz", unit: UNIT_LABELS.MOMENT_OF_AREA },
      { label: "2nd Moment of Area, Iy", key: "Iy", unit: UNIT_LABELS.MOMENT_OF_AREA },
      { label: "Radius of Gyration, rz", key: "rz", unit: UNIT_LABELS.RADIUS_OF_GYRATION },
      { label: "Radius of Gyration, ry", key: "ry", unit: UNIT_LABELS.RADIUS_OF_GYRATION },
    ],
    right: [
      { label: "Radius of Gyration, ru", key: "rumax", unit: UNIT_LABELS.RADIUS_OF_GYRATION },
      { label: "Radius of Gyration, rv", key: "rvmin", unit: UNIT_LABELS.RADIUS_OF_GYRATION },
      { label: "Elastic Modulus, Zz", key: "Zz", unit: UNIT_LABELS.ELASTIC_MODULUS },
      { label: "Elastic Modulus, Zy", key: "Zy", unit: UNIT_LABELS.ELASTIC_MODULUS },
      { label: "Plastic Modulus, Zpz", key: "Zpz", unit: UNIT_LABELS.PLASTIC_MODULUS },
      { label: "Plastic Modulus, Zpy", key: "Zpy", unit: UNIT_LABELS.PLASTIC_MODULUS },
      { label: "Torsion Constant, It", key: "It", unit: UNIT_LABELS.TORSION_CONSTANT },
    ]
  }
};

export const CHANNEL_DISPLAY_CONFIG = {
  ...BEAM_DISPLAY_CONFIG,
  designationKey: "Designation",
  dimensions: [
    ...BEAM_DISPLAY_CONFIG.dimensions,
  ],
  properties: {
    middle: [
      ...BEAM_DISPLAY_CONFIG.properties.middle,
      { label: "Cy", key: "Cy", unit: UNIT_LABELS.RADIUS_OF_GYRATION }
    ],
    right: [
      ...BEAM_DISPLAY_CONFIG.properties.right
    ]
  }
};

