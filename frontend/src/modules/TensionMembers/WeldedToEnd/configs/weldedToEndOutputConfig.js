export const weldedToEndOutputConfig = {
    sections: {
        "Weld": [
            { key: "Weld.Type", label: "Type" },
            { key: "Weld.Size", label: "Size (mm)" },
            { key: "Weld.Strength", label: "Strength (N/mm2)" },
            { key: "bolt.long_joint", label: "Long Joint Red.Factor" },
            { key: "Weld.Strength_red", label: "Red.Strength(N/mm)" },
            { key: "Weld.Stress", label: "Stress (N/mm" },
            { key: "Weld.EffLength", label: "Eff.Length (mm)" },
        ],
        "Plate": [
            { key: "Plate.Thickness", label: "Thickness (mm)" },
            { key: "Plate.Height", label: "Height (mm)" },
            { key: "Plate.Length", label: "Width (mm)" },
            { key: "PlateCapacityModal", label: "Capacity" },
        ],
        "Member": [
            { key: "section_size.designation", label: "Section Designation" },
            { key: "Member.tension_capacity", label: "Tension Capacity (kN)" },
            { key: "Member.tension_rupture", label: "Tension Rupture Capacity (kN)" },
            { key: "Member.tension_yielding", label: "Yielding Capacity (kN)" },
            { key: "Member.Slenderness", label: "Slenderness" },
        ],
        "Design Status": [
            { key: "Member.efficiency", label: "Design Status" },
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