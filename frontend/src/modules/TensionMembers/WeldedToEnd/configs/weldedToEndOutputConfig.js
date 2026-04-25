export const weldedToEndOutputConfig = {
    sections: {
        "Section Details": [
            { key: "section_size.designation", label: "Designation" },
            { key: "Member.tension_yielding", label: "Tension Yielding Capacity (kN)" },
            { key: "Member.tension_rupture", label: "Tension Rupture Capacity (kN)" },
            { key: "Member.tension_capacity", label: "Tension Capacity (kN)" },
            { key: "Member.Slenderness", label: "Slenderness ratio" },
            { key: "Member.efficiency", label: "Utilization Ratio" },
        ],

            "End Connection - Weld Details": [
            { key: "Weld.Type", label: "Type" },
            { key: "Weld.Size", label: "Size (mm)" },
            { key: "Weld.Strength", label: "Strength (N/mm²)" },
            { key: "bolt.long_joint", label: "Long Joint Red.Factor" },
            { key: "Weld.Strength_red", label: "Red.Strength (N/mm)" },
            { key: "Weld.Stress", label: "Stress (N/mm)" },
            { key: "Weld.EffLength", label: "Eff.Length (mm)" },
        ],
        "Gusset Plate Details": [
            { key: "Plate.Thickness", label: "Thickness (mm)" },
            { key: "Plate.Height", label: "Min.Height (mm)" },
            { key: "Plate.Length", label: "Min.Plate Length (mm)" },
            { key: "Plate.Yield", label: "Tension Yielding Capacity (kN)" },
            { key: "Plate.BlockShear", label: "Block Shear Capacity (kN)" },
            { key: "Plate.Capacity", label: "Tension Capacity (kN)" },
            { key: "PlateCapacityModal", label: "Capacity" },

        ],
        "Intermittent Connection": [
            { key: "Intermittent.Connection", label: "Connection (nos)" },
            { key: "Intermittent.Spacing", label: "Spacing (mm)" },
        ],

        "Intermittent Weld Details": [
            { key: "InterWeld.Size", label: "Size (mm)" },
        ],

        "Intermittent Plate Details": [
            { key: "Plate.InterHeight", label: "Height (mm)" },
            { key: "Plate.InterLength", label: "Length (mm)" },
        ],
    },

    modals: {
        PlateCapacityModal: { type: "capacity", buttonText: "Plate Capacity" }
    },

    modalTypes: {
        capacity: {
            title: "Capacity Details",
            width: "68%",
            layout: "capacity-complex",
            hasImage: true,
            note: "Representative image for Failure Pattern"
        }
    },

    modalData: {
        capacity: {
            PlateCapacityModal: [
                { key: "Plate.Yield", label: "Tension Yielding Capacity (kN)", section: "Failure due to Tension in Plate" },
                { key: "Plate.Rupture", label: "Tension Rupture Capacity (kN)", section: "Failure due to Tension in Plate" },
                { key: "Plate.BlockShear", label: "Block Shear Capacity (kN)", section: "Failure due to Block Shear in Plate" },
                { key: "Plate.Capacity", label: "Tension Capacity (kN)", section: "Overall Plate Capacity" },
            ]
        }
    }
}; 