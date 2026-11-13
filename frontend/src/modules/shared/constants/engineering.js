/**
 * Shared engineering constants used across Osdag modules.
 * Values are based on IS 800 and standard structural engineering practices.
 */

export const STEEL_CONSTANTS = {
  E: 200,             // Modulus of Elasticity (GPa)
  G: 76.9,            // Modulus of Rigidity (GPa)
  POISSON_RATIO: 0.3, // Poisson's Ratio
  THERMAL_EXPANSION: 12, // Thermal Expansion Coefficient (x10^-6 / C)
};

export const UNIT_LABELS = {
  E: "GPa",
  G: "GPa",
  FU: "MPa",
  FY: "MPa",
  DIMENSION: "mm",
  AREA: "cm²",
  MOMENT_OF_AREA: "cm⁴",
  RADIUS_OF_GYRATION: "cm",
  ELASTIC_MODULUS: "cm³",
  PLASTIC_MODULUS: "cm³",
  TORSION_CONSTANT: "cm⁴",
  WARPING_CONSTANT: "cm⁶",
  MASS: "Kg/m",
  ANGLE: "deg.",
};
