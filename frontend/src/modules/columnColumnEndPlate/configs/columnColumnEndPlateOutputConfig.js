export const columnColumnEndPlateOutputConfig = {
  sections: {
    "Critical Bolt Design": [
      { key: "Bolt.Diameter", label: "Diameter (mm)" },
      { key: "Bolt.Grade", label: "Property Class" },
      { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
      { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
      { key: "Bolt.Capacity", label: "Bolt Value (kN)" },
      { key: "Bolt.Tension", label: "Bolt Tension Capacity (kN)" },
      { key: "Bolt.Pitch", label: "Pitch Distance (mm)" },
      { key: "Bolt.EndDist", label: "End Distance (mm)" },
      { key: "ColumnEndPlate.nb", label: "Total No. of Bolts" },
      { key: "WebBoltSpacingModal", label: "Web Bolts Spacing" },
      { key: "FlangeBoltSpacingModal", label: "Flange Bolts Spacing" }
    ],

    "Plate": [
      { key: "Plate.Thickness", label: "Thickness (mm)" },
      { key: "Plate.Height", label: "Height (mm)" },
      { key: "Plate.Length", label: "Length (mm)" },
      { key: "Plate.MomCapacity", label: "Moment Capacity (kNm)" }
    ],

    "Weld at Flange": [
      { key: "Weld.Type", label: "Type" },
      { key: "SketchFlangeModal", label: "Details" }
    ]
  },

  modals: {
    DimensionsModal: { type: "details", buttonText: "Details" },
    DetailingModal: { type: "detailing", buttonText: "Details" },
    SketchModal: { type: "stiffener", buttonText: "Details" },
    SketchFlangeModal: { type: "groove", buttonText: "Details" },

    WebBoltSpacingModal: { type: "spacing", buttonText: "Details" },
    FlangeBoltSpacingModal: { type: "spacing", buttonText: "Details" }
  },

  modalTypes: {
    details: {
      title: "Capacity Details",
      width: "35%",
      layout: "single-column",
      hasImage: false
    },
    detailing: {
      title: "Typical Detailing",
      width: "40%",
      layout: "image-only",
      hasImage: true,
      imageType: "detailing"
    },
    stiffener: {
      title: "Stiffener Details",
      width: "40%",
      layout: "image-only",
      hasImage: true,
      imageType: "stiffener"
    },
    groove: {
      title: "Stiffener Details",
      width: "40%",
      layout: "image-only",
      hasImage: true,
      imageType: "groove"
    },
    spacing: {
      title: "Bolt Spacing Details",
      width: "60%",
      layout: "spacing-diagram",
      note: "Representative image for Bolt Spacing"
    }
  },

  modalData: {
    details: {
      DimensionsModal: [
        { key: "Stiffener.Length", label: "Length (mm)" },
        { key: "Stiffener.Width", label: "Width (mm)" },
        { key: "Stiffener.Thickness", label: "Thickness (mm)" }
      ]
    },

    spacing: {
      WebBoltSpacingModal: {
        fields: [
          { key: "Bolt.EndDist", label: "End Distance (mm)" },
          { key: "ColumnEndPlate.nbw", label: "No. of Bolts (along one side of the web) (n)" },
          { key: "ColumnEndPlate.nbwtotal", label: "No. of Bolts (along web)" },
          { key: "ColumnEndPlate.p2_flange", label: "Pitch (Web) (p2)" }
        ],
        diagram: {
          origin: "right",
          props: {
            pitch: "ColumnEndPlate.p2_flange",
            plateWidth: "Plate.Length",
            plateHeight: "Plate.Height",
            holeDiameter: "Bolt.Diameter"
          }
        }
      },

      FlangeBoltSpacingModal: {
        fields: [
          { key: "Bolt.EndDist", label: "End Distance (mm)" },
          { key: "ColumnEndPlate.nbf", label: "No. of Bolts (along one side of the flange overhang) (n)" },
          { key: "ColumnEndPlate.nbftotal", label: "No. of Bolts (along Flange)" },
          { key: "ColumnEndPlate.p2_flange", label: "Pitch (bolts along center) (p2)" }
        ],
        diagram: {
          origin: "right",
          props: {
            cols: "ColumnEndPlate.nbf",
            rows: "ColumnEndPlate.nbftotal",
            pitch: "ColumnEndPlate.p2_flange",
            plateWidth: "Plate.Length",
            plateHeight: "Plate.Height",
            holeDiameter: "Bolt.Diameter"
          }
        }
      }
    }
  }
};

// Final output: {'Bolt.Diameter': {'key': 'Bolt.Diameter', 'label': 'Diameter (mm)', 'val': 27}, 'Bolt.Grade': {'key': 'Bolt.Grade', 'label': 'Property Class *', 'val': 8.8}, 'Bolt.Shear': {'key': 'Bolt.Shear', 'label': 'Shear Capacity (kN)', 'val': 175.96}, 'Bolt.Bearing': {'key': 'Bolt.Bearing', 'label': 'Bearing Capacity (kN)', 'val': 657.12}, 'Bolt.Capacity': {'key': 'Bolt.Capacity', 'label': 'Bolt Value (kN)', 'val': 175.96}, 'Bolt.Tension': {'key': 'Bolt.Tension', 'label': 'Bolt Tension Capacity (kN)', 'val': 274.3}, 'Bolt.Pitch': {'key': 'Bolt.Pitch', 'label': 'Pitch 4-5', 'val': 67.5}, 'Bolt.EndDist': {'key': 'Bolt.EndDist', 'label': 'End Distance (mm)', 'val': 55}, 'ColumnEndPlate.nb': {'key': 'ColumnEndPlate.nb', 'label': 'Total No. of Bolts', 'val': 10}, 'Plate.Thickness': {'key': 'Plate.Thickness', 'label': 'Thickness (mm)', 'val': 56}, 'Plate.Height': {'key': 'Plate.Height', 'label': 'Height (mm)', 'val': 450.0}, 'Plate.Length': {'key': 'Plate.Length', 'label': 'Length (mm)', 'val': 250.0}, 'Plate.MomCapacity': {'key': 'Plate.MomCapacity', 'label': 'Moment Capacity (kNm)', 'val': 12.03}, 'Stiffener.Height': {'key': 'Stiffener.Height', 'label': 'Height (mm)', 'val': 0.0}, 'Stiffener.Width': {'key': 'Stiffener.Width', 'label': 'Width (mm)', 'val': 0.0}, 'Stiffener.Thickness': {'key': 'Stiffener.Thickness', 'label': 'Thickness (mm)', 'val': 0.0}, 'Weld.Type': {'key': 'Weld.Type', 'label': 'Type', 'val': 'N/A'}, 'Stiffener.weld_flange': {'key': 'Stiffener.weld_flange', 'label': 'Weld Between Stiffener and End plate', 'val': 'Groove Weld'}, 'Weld.Size_stiffener': {'key': 'Weld.Size_stiffener', 'label': 'Weld Size at Stiffener (mm)', 'val': 'N/A'}, 'Popup.Top_Half_Flange_Bolt_Spacing_for_(n)_Bolts': {'type': 'popup_image', 'title': 'Top Half Flange Bolt Spacing for (n) Bolts', 'image': '/static/data/ResourceFiles/images/spacing_5.png', 'width': 401, 'height': 248}, 'ColumnEndPlate.nbf': {'key': 'ColumnEndPlate.nbf', 'label': 'No. of Bolts (along one side of the flange overhang) (n)', 'val': 1}, 'ColumnEndPlate.nbftotal': {'key': 'ColumnEndPlate.nbftotal', 'label': 'No. of Bolts (along flange)', 'val': 4}, 'ColumnEndPlate.p2_flange': {'key': 'ColumnEndPlate.p2_flange', 'label': 'Pitch (bolts along centre) (p2)', 'val': 65.1}, 'Popup.Web_Bolt_Spacing_for_(n)_Bolts': {'type': 'popup_image', 'title': 'Web Bolt Spacing for (n) Bolts', 'image': '/static/data/ResourceFiles/images/spacing_4.png', 'width': 400, 'height': 411}, 'ColumnEndPlate.nbw': {'key': 'ColumnEndPlate.nbw', 'label': 'No. of Bolts (along one side of the web) (n)', 'val': 5}, 'ColumnEndPlate.nbwtotal': {'key': 'ColumnEndPlate.nbwtotal', 'label': 'No. of Bolts (along web)', 'val': 10}}