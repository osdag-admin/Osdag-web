export const coverPlateBoltedOutputConfig = {
  // Output sections and field mappings
  sections: {
    "Member Capacity": [
      { key: "MemberCapacityModal", label: "Member Capacity" },
    ],
    Bolt: [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade_Provided", label: "Property Class" },
    ],
    "Bolt Capacities": [
      { key: "BoltFlangeCapacityModal", label: "Flange Bolt Capacity" },
      { key: "BoltWebCapacityModal", label: "Web Bolt Capacity" },
    ],
    "Web Splice Plate": [
      { key: "Web_Plate.Height (mm)", label: "Height (mm)" },
      { key: "Web_Plate.Width", label: "Width (mm)" },
      { key: "Web_Plate.Thickness", label: "Thickness (mm)*" },
      { key: "WebSpacingDetailsModal", label: "Spacing (mm)" },
      { key: "WebCapacityModal", label: "Capacity" },
    ],
    "Flange Splice Plate Outer Plate": [
      { key: "Flange_Plate.Width (mm)", label: "Width (mm)" },
      { key: "flange_plate.Length", label: "Length (mm)" },
      { key: "Connector.Flange_Plate.Thickness_list", label: "Thickness (mm)" },
      { key: "FlangeSpacingDetailsModal", label: "Spacing (mm)" },
      { key: "FlangeCapacityModal", label: "Capacity" },
    ],
    "Inner Plate": [
      { key: "Flange_Plate.InnerWidth", label: "Width (mm)" },
      { key: "flange_plate.InnerLength", label: "Length (mm)" },
      { key: "flange_plate.innerthickness_provided", label: "Thickness (mm)" },
    ],
  },

  // Modal trigger mappings
  modals: {
    WebSpacingDetailsModal: { type: "spacing", buttonText: "Web Spacing" },
    FlangeSpacingDetailsModal: {
      type: "spacing",
      buttonText: "Flange Spacing",
    },
    WebCapacityModal: { type: "capacity", buttonText: "Web Capacity" },
    FlangeCapacityModal: { type: "capacity", buttonText: "Flange Capacity" },
    BoltWebCapacityModal: { type: "details", buttonText: "Web Bolt Capacity" },
    BoltFlangeCapacityModal: {
      type: "details",
      buttonText: "Flange Bolt Capacity",
    },
    MemberCapacityModal: { type: "details", buttonText: "Member Capacity" },
  },

  // Modal type configurations (NO JSX HERE)
  modalTypes: {
    spacing: {
      title: "Spacing Details",
      width: "68%",
      layout: "two-column", // ← Configuration instead of JSX
      hasImage: true,
    },

    details: {
      title: "Capacity Details",
      width: "35%",
      layout: "single-column", // ← Configuration instead of JSX
      hasImage: false,
    },

    capacity: {
      title: "Plate Capacity Details",
      width: "68%",
      layout: "two-column", // ← Configuration instead of JSX
      hasImage: true,
    },
  },

  // Modal data - what fields appear in each modal
  modalData: {
    spacing: {
      WebSpacingDetailsModal: [
        {
          key: "Web_plate.pitch_provided_web_spacing",
          label: "Pitch Distance (mm)",
        },
        {
          key: "Web_plate.end_dist_provided _web_spacing",
          label: "End Distance (mm)",
        },
        {
          key: "Web_plate.gauge_provided _web_spacing",
          label: "Gauge Distance (mm)",
        },
        {
          key: "Web_plate.edge_dist_provided_web_spacing",
          label: "Edge Distance (mm)",
        },
      ],
      FlangeSpacingDetailsModal: [
        {
          key: "Flange_plate.pitch_provided_flange_spacing",
          label: "Pitch Distance (mm)",
        },
        {
          key: "Flange_plate.end_dist_provided _flange_spacing",
          label: "End Distance",
        },
        {
          key: "Flange_plate.gauge_provided _flange_spacing",
          label: "Gauge Distance (mm)",
        },
        {
          key: "Flange_plate.edge_dist_provided_flange_spacing",
          label: "Edge Distance (mm)",
        },
      ],
    },

    capacity: {
      WebCapacityModal: [
        {
          key: "section.Tension_capacity_web_web_capacity",
          label: "Web Tension Capacity (kN)",
        },
        {
          key: "Web_plate.capacity_web_capacity",
          label: "Web Plate Tension Capacity (kN)",
        },
        {
          key: "web_plate.shear_capacity_web_plate_web_capacity",
          label: "Web Plate Shear Capacity (kN)",
        },
        {
          key: "Web_Plate.MomDemand_web_capacity",
          label: "Web Moment Demand (kNm)",
        },
      ],
      FlangeCapacityModal: [
        {
          key: "Section.flange_capacity_flange_capacity",
          label: "Flange Tension Capacity (kN)",
        },
        {
          key: "flange_plate.tension_capacity_flange_plate_flange_capacity",
          label: "Flange Plate Tension Capacity (kN)",
        },
      ],
    },

    details: {
      MemberCapacityModal: [
        { key: "Section.AxialCapacity", label: "Axial Capacity Member (kN)" },
        { key: "Section.MomCapacity", label: "Moment Capacity Member (kNm)" },
        { key: "Section.ShearCapacity", label: "Shear Capacity Member (kN)" },
      ],
      BoltFlangeCapacityModal: [
        {
          key: "Flange_plate.Bolt_Line_flange_bolt_capacity",
          label: "Bolt Lines ",
        },
        {
          key: "Flange_plate.Bolt_OneLine_flange_bolt_capacity",
          label: "Bolts in One Line ",
        },
        {
          key: "Flange_plate.Bolt_required_flange_bolt_capacity",
          label: "Bolts Required",
        },
        {
          key: "Bolt.Shear_flange_bolt_capacity",
          label: "Shear Capacity (kN)",
        },
        {
          key: "Bolt.Bearing_flange_bolt_capacity",
          label: "Bearing Capacity (kN)",
        },
        {
          key: "flange_bolt.large_grip_flange_bolt_capacity",
          label: "Large Grip Red.Factor",
        },
        {
          key: "flange_plate.red,factor_flange_bolt_capacity",
          label: "Long Joint Red.Factor",
        },
        { key: "Bolt.Capacity_flange_bolt_capacity", label: "Capacity (kN)" },
        {
          key: "Bolt.Force (kN)_flange_bolt_capacity",
          label: "Bolt Force (kN)",
        },
      ],
      BoltWebCapacityModal: [
        { key: "Web_plate.Bolt_Line_web_bolt_capacity", label: "Bolt Lines " },
        {
          key: "Web_plate.Bolt_OneLine_web_bolt_capacity",
          label: "Bolts in One Line ",
        },
        {
          key: "Web_plate.Bolt_required_web_bolt_capacity",
          label: "Bolts Required",
        },
        { key: "Bolt.Shear_web_bolt_capacity", label: "Shear Capacity (kN)" },
        {
          key: "Bolt.Bearing_web_bolt_capacity",
          label: "Bearing Capacity (kN)",
        },
        { key: "web_plate.red,factor_web_bolt_capacity", label: "Red. Factor" },
        { key: "Bolt.Capacity_web_bolt_capacity", label: "Capacity (kN)" },
        { key: "Bolt.Force (kN)_web_bolt_capacity", label: "Bolt Force (kN)" },
      ],
    },
  },
};
