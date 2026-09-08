export const cleatAngleOutputConfig = {
  sections: {
    "Cleat Angle": [
      { key: "Cleat.Angle", label: "Cleat Angle Designation" },
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Cleat.Shear", label: "Shear Yielding Capacity (kN)" },
      { key: "Cleat.BlockShear", label: "Block Shear Capacity (kN)" },
      { key: "Cleat.MomDemand", label: "Moment Demand (kNm)" },
      { key: "Cleat.MomCapacity", label: "Moment Capacity (kNm)" },
      { key: "PlateCapacityModal_supported", label: "Plate Capacity Details" },
    ],
    Bolt: [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
    ],
    "Bolts on Supported Leg": [
      { key: "Bolt.Line", label: "Bolt Columns (nos)" },
      { key: "Bolt.OneLine", label: "Bolt Rows (nos)" },
      { key: "Bolt.Force (kN)", label: "Bolt Force (kN)" },
      { key: "Bolt.Capacity_sptd", label: "Bolt Value (kN)" },
      { key: "BoltCapSimpleModal_supported", label: "Bolt Capacity" },
      { key: "CapacityModal_supported", label: "Bolt Capacity Details" },
      { key: "SupportedSpacingModal", label: "Spacing" },
    ],
    "Bolts on Supporting Leg": [
      { key: "Cleat.Spting_leg.Line", label: "Bolt Columns (nos)" },
      { key: "Cleat.Spting_leg.OneLine", label: "Bolt Rows (nos)" },
      { key: "Cleat.Spting_leg.Force", label: "Bolt Force (kN)" },
      { key: "Bolt.Capacity_spting", label: "Bolt Value (kN)" },
      { key: "BoltCapSimpleModal_supporting", label: "Bolt Capacity" },
      { key: "CapacityModal_supporting", label: "Bolt Capacity Details" },
      { key: "SupportingSpacingModal", label: "Spacing" },
      { key: "PlateCapacityModal_supporting", label: "Plate Capacity Details" },
    ],
    "Section Details": [
      { key: "SectionCapacityModal", label: "Section Capacity" },
    ],
  },

  modals: {
    SupportedSpacingModal:         { type: "spacing",              buttonText: "Supported Spacing" },
    SupportingSpacingModal:        { type: "spacingSupporting",    buttonText: "Supporting Spacing" },
    CapacityModal_supported:       { type: "details",              buttonText: "Capacity" },
    CapacityModal_supporting:      { type: "detailsSupporting",    buttonText: "Capacity" },
    BoltCapSimpleModal_supported:  { type: "boltCapSimpleSptd",   buttonText: "Capacity" },
    BoltCapSimpleModal_supporting: { type: "boltCapSimpleSpting",  buttonText: "Capacity" },
    PlateCapacityModal_supported:  { type: "plateCapSptd",        buttonText: "Capacity" },
    PlateCapacityModal_supporting: { type: "plateCapSpting",       buttonText: "Capacity" },
    SectionCapacityModal:          { type: "sectionCap",           buttonText: "Capacity" },
  },

  modalTypes: {
    spacing: {
      title: "Supported Leg — Spacing Details",
      width: "68%",
      layout: "spacing-diagram",
      hasImage: true,
    },
    spacingSupporting: {
      title: "Supporting Leg — Spacing Details",
      width: "68%",
      layout: "spacing-diagram",
      hasImage: true,
    },
    details: {
      title: "Supported Leg — Bolt Capacity Details",
      width: "35%",
      layout: "single-column",
      hasImage: false,
    },
    detailsSupporting: {
      title: "Supporting Leg — Bolt Capacity Details",
      width: "35%",
      layout: "single-column",
      hasImage: false,
    },
    boltCapSimpleSptd: {
      title: "Supported Leg — Bolt Capacity",
      width: "68%",
      layout: "cleat-bolt-capacity",
      hasImage: true,
    },
    boltCapSimpleSpting: {
      title: "Supporting Leg — Bolt Capacity",
      width: "68%",
      layout: "cleat-bolt-capacity",
      hasImage: true,
    },
    plateCapSptd: {
      title: "Supported Leg — Plate Capacity Details",
      width: "35%",
      layout: "single-column",
      hasImage: false,
    },
    plateCapSpting: {
      title: "Supporting Leg — Plate Capacity Details",
      width: "35%",
      layout: "single-column",
      hasImage: false,
    },
    sectionCap: {
      title: "Section Capacity Details",
      width: "68%",
      layout: "cleat-section-capacity",
      hasImage: true,
    },
  },

  modalData: {
    spacing: {
      SupportedSpacingModal: {
        fields: [
          { key: "Bolt.Pitch_supported", label: "Pitch Distance (mm)" },
          { key: "Bolt.EndDist_supported", label: "End Distance (mm)" },
          { key: "Bolt.Gauge1_supported", label: "Gauge 1 Distance (mm)" },
          { key: "Bolt.Gauge2_supported", label: "Gauge 2 Distance (mm)" },
          { key: "Bolt.EdgeDist_supported", label: "Edge Distance (mm)" },
        ],
        diagram: {
          origin: "right",
          props: {
            plateWidth: 0,
            plateHeight: "Plate.Height",
            rows: "Bolt.OneLine",
            cols: "Bolt.Line",
            end: "Bolt.EndDist_supported",
            pitch: "Bolt.Pitch_supported",
            gauge: ["Bolt.Gauge1_supported", "Bolt.Gauge2_supported"],
            edge: "Bolt.EdgeDist_supported",
            holeDiameter: "Bolt.Diameter",
            angleDesignation: "Cleat.Angle",
            drawAngleThickness: "left",
          },
        },
      },
    },
    spacingSupporting: {
      SupportingSpacingModal: {
        fields: [
          { key: "Bolt.Pitch_supporting", label: "Pitch Distance (mm)" },
          { key: "Bolt.EndDist_supporting", label: "End Distance (mm)" },
          { key: "Bolt.Gauge1_supporting", label: "Gauge 1 Distance (mm)" },
          { key: "Bolt.Gauge2_supporting", label: "Gauge 2 (Pitch) Distance (mm)" },
          { key: "Bolt.EdgeDist_supporting", label: "Edge Distance (mm)" },
        ],
        diagram: {
          origin: "right",
          props: {
            plateWidth: 0,
            plateHeight: "Plate.Height",
            rows: "Cleat.Spting_leg.OneLine",
            cols: "Cleat.Spting_leg.Line",
            end: "Bolt.EndDist_supporting",
            pitch: "Bolt.Pitch_supporting",
            gauge: ["Bolt.Gauge1_supporting", "Bolt.Gauge2_supporting"],
            edge: "Bolt.EdgeDist_supporting",
            holeDiameter: "Bolt.Diameter",
            angleDesignation: "Cleat.Angle",
            drawAngleThickness: "left",
          },
        },
      },
    },
    details: {
      CapacityModal_supported: [
        { key: "Bolt.Bearing_supported", label: "Bearing Capacity (kN)" },
        { key: "Bolt.Shear_supported", label: "Shear Capacity (kN)" },
        { key: "Bolt.Betalg_supported", label: "β<sub>lg</sub>" },
        { key: "Bolt.Betalj_supported", label: "β<sub>lj</sub>" },
        { key: "Bolt.Capacity_supported", label: "Bolt Value (kN)" },
        { key: "Bolt.Force (kN)_supported", label: "Bolt Shear Force (kN)" },
      ],
    },
    detailsSupporting: {
      CapacityModal_supporting: [
        { key: "Bolt.Bearing_supporting", label: "Bearing Capacity (kN)" },
        { key: "Bolt.Shear_supporting", label: "Shear Capacity (kN)" },
        { key: "Bolt.Betalg_supporting", label: "β<sub>lg</sub>" },
        { key: "Bolt.Betalj_supporting", label: "β<sub>lj</sub>" },
        { key: "Bolt.Capacity_supporting", label: "Bolt Value (kN)" },
        { key: "Bolt.Force (kN)_supporting", label: "Bolt Shear Force (kN)" },
      ],
    },
    boltCapSimpleSptd: {
      BoltCapSimpleModal_supported: {
        fields: [
          { key: "Bolt.Shear_bolt_sptd", label: "Shear Capacity (kN)", section: "Failure Pattern due to Shear" },
          { key: "Bolt.Bearing_bolt_sptd", label: "Bearing Capacity (kN)", section: "Failure Pattern due to Shear" },
          { key: "Bolt.Capacity_bolt_sptd", label: "Bolt Value (kN)", section: "Failure Pattern due to Shear" },
          { key: "Bolt.Shear_bolt_sptd", label: "Shear Capacity (kN)", section: "Failure Pattern due to Tension" },
          { key: "Bolt.Bearing_bolt_sptd", label: "Bearing Capacity (kN)", section: "Failure Pattern due to Tension" },
          { key: "Bolt.Capacity_bolt_sptd", label: "Bolt Value (kN)", section: "Failure Pattern due to Tension" },
        ],
        diagram: {
          props: {
            leg: "supported",
            plateHeight: "Plate.Height",
            boltRows: "Bolt.OneLine",
            boltCols: "Bolt.Line",
            end: "Bolt.EndDist_supported",
            pitch: "Bolt.Pitch_supported",
            edge: "Bolt.EdgeDist_supported",
            gauge1: "Bolt.Gauge1_supported",
            angleDesignation: "Cleat.Angle",
          },
        },
      },
    },
    boltCapSimpleSpting: {
      BoltCapSimpleModal_supporting: {
        fields: [
          { key: "Bolt.Shear_bolt_spting", label: "Shear Capacity (kN)", section: "Failure Pattern due to Shear" },
          { key: "Bolt.Bearing_bolt_spting", label: "Bearing Capacity (kN)", section: "Failure Pattern due to Shear" },
          { key: "Bolt.Capacity_bolt_spting", label: "Bolt Value (kN)", section: "Failure Pattern due to Shear" },
          { key: "Bolt.Shear_bolt_spting", label: "Shear Capacity (kN)", section: "Failure Pattern due to Tension" },
          { key: "Bolt.Bearing_bolt_spting", label: "Bearing Capacity (kN)", section: "Failure Pattern due to Tension" },
          { key: "Bolt.Capacity_bolt_spting", label: "Bolt Value (kN)", section: "Failure Pattern due to Tension" },
        ],
        diagram: {
          props: {
            leg: "supporting",
            plateHeight: "Plate.Height",
            boltRows: "Cleat.Spting_leg.OneLine",
            boltCols: "Cleat.Spting_leg.Line",
            end: "Bolt.EndDist_supporting",
            pitch: "Bolt.Pitch_supporting",
            edge: "Bolt.EdgeDist_supporting",
            gauge1: "Bolt.Gauge1_supporting",
            angleDesignation: "Cleat.Angle",
          },
        },
      },
    },
    plateCapSptd: {
      PlateCapacityModal_supported: {
        fields: [
          { key: "Plate.Shear_sptd_plate", label: "Shear Yielding Capacity (kN)", section: "Failure Pattern due to Shear (Supported Leg)" },
          { key: "Plate.Rupture_sptd_plate", label: "Shear Rupture Capacity (kN)", section: "Failure Pattern due to Shear (Supported Leg)" },
          { key: "Plate.BlockShear_sptd_plate", label: "Block Shear (Shear) (kN)", section: "Failure Pattern due to Shear (Supported Leg)" },
          { key: "Plate.TensionYield_sptd_plate", label: "Tension Yielding Capacity (kN)", section: "Failure Pattern due to Tension (Supported Leg)" },
          { key: "Plate.TensionRupture_sptd_plate", label: "Tension Rupture Capacity (kN)", section: "Failure Pattern due to Tension (Supported Leg)" },
          { key: "Plate.BlockShearAxial_sptd_plate", label: "Block Shear (Axial) (kN)", section: "Failure Pattern due to Tension (Supported Leg)" },
          { key: "Section.BlockShearAxial_sptd_plate", label: "Section Block Shear Capacity (kN)", section: "Section (Beam Web) Block Shear" },
        ],
      },
    },
    plateCapSpting: {
      PlateCapacityModal_supporting: {
        fields: [
          { key: "Plate.Shear_spting_plate", label: "Shear Yielding Capacity (kN)", section: "Failure Pattern due to Shear (Supporting Leg)" },
          { key: "Plate.Rupture_spting_plate", label: "Shear Rupture Capacity (kN)", section: "Failure Pattern due to Shear (Supporting Leg)" },
          { key: "Plate.BlockShear_spting_plate", label: "Block Shear (Shear) (kN)", section: "Failure Pattern due to Shear (Supporting Leg)" },
          { key: "Plate.TensionYield_spting_plate", label: "Tension Yielding Capacity (kN)", section: "Failure Pattern due to Tension (Supporting Leg)" },
          { key: "Plate.TensionRupture_spting_plate", label: "Tension Rupture Capacity (kN)", section: "Failure Pattern due to Tension (Supporting Leg)" },
          { key: "Plate.BlockShearAxial_spting_plate", label: "Block Shear (Axial) (kN)", section: "Failure Pattern due to Tension (Supporting Leg)" },
        ],
      },
    },
    sectionCap: {
      SectionCapacityModal: {
        fields: [
          { key: "Cleat.Shear_section", label: "Cleat Shear Yielding Capacity (kN)", section: "Failure Pattern due to Shear in Supported Section" },
          { key: "Cleat.BlockShear_section", label: "Cleat Block Shear Capacity (kN)", section: "Failure Pattern due to Shear in Supported Section" },
          { key: "Cleat.MomDemand_section", label: "Moment Demand (kNm)", section: "Failure Pattern due to Tension in Supporting Section" },
          { key: "Cleat.MomCapacity_section", label: "Moment Capacity (kNm)", section: "Failure Pattern due to Tension in Supporting Section" },
        ],
        diagram: {
          props: {
            connectivity: "Connectivity",
            pitch: "Bolt.Pitch_supported",
            end: "Bolt.EndDist_supported",
            edge: "Bolt.Gauge1_supported",
            gauge1: "Bolt.Gauge2_supported",
          },
        },
      },
    },
  },
};
