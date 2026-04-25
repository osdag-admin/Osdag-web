export const strutsBoltedOutputConfig = {
    sections: {
        "Section Details": [
            { key: "section_size.designation", label: "Designation" },
            { key: "KEY_EFFECTIVE_LENGTH", label: "Effective Length, KL (mm)" },
            { key: "KEY_FCD", label: "Design Compressive Stress, fcd (MPa)" },
            { key: "Member.tension_capacity", label: "Design Strength (kN)" },
            { key: "Member.Slenderness", label: "Slenderness ratio" },
            { key: "Member.efficiency", label: "Utilization Ratio" },
        ],
        "Bolt Details": [
            { key: "Bolt.Diameter", label: "Diameter (mm)" },
            { key: "Bolt.Grade_Provided", label: "Property Class" },
            { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
            { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
            { key: "bolt.long_joint", label: "Long Joint Red.Factor" },
            { key: "bolt.large_grip", label: "Large Grip Red.Factor" },
            { key: "Bolt.Capacity", label: "Capacity (kN)" },
            { key: "Bolt.Force (kN)", label: "Bolt Force (kN)" },
            { key: "SpacingModal", label: "Spacing" },
        ],
        "Gusset Plate Details": [
            { key: "Plate.Thickness", label: "Thickness (mm)" },
            { key: "Plate.Height", label: "Min.Height (mm)" },
            { key: "Plate.Length", label: "Min.Plate Length (mm)" },
            { key: "Plate.Yield", label: "Tension Yielding Capacity (kN)" },
            { key: "Plate.Rupture", label: "Tension Rupture Capacity (kN)" },
            { key: "Plate.BlockShear", label: "Block Shear Capacity (kN)" },
            { key: "PatternModal", label: "Pattern" },
        ],
        "Connection Details": [
            { key: "Intermittent.Connection", label: "Connection (nos)" },
            { key: "Intermittent.Spacing", label: "Spacing (mm)" },
        ],
        "Intermittent Bolt Details": [
            { key: "Bolt.InterDiameter", label: "Diameter (mm)" },
            { key: "Bolt.InterGrade", label: "Grade" },
            { key: "Bolt.InterLine", label: "Columns (nos)" },
            { key: "Bolt.InterOneLine", label: "Rows (nos)" },
        ],
        "Plate Details": [
            { key: "Plate.InterHeight", label: "Height (mm)" },
            { key: "Plate.InterLength", label: "Length (mm)" },
        ],
    },

    modals: {
        SpacingModal: { type: "spacing", buttonText: "Spacing" },
        PatternModal: { type: "pattern", buttonText: "Pattern" }
    },

    modalTypes: {
        spacing: {
            title: "Spacing Details",
            width: "68%",
            layout: "spacing-diagram",
            note: "Representative image for Spacing Details"
        },
        pattern: {
            title: "Pattern Details",
            width: "68%",
            layout: "capacity-complex",
            hasImage: true,
            note: "Representative image for Failure Pattern"
        }
    },

    modalData: {
        spacing: {
            SpacingModal: {
                fields: [
                    { key: "Bolt.Pitch", label: "Pitch Distance (mm)" },
                    { key: "Bolt.EndDist", label: "End Distance (mm)" },
                    { key: "Bolt.Gauge", label: "Gauge Distance (mm)" },
                    { key: "Bolt.EdgeDist", label: "Edge Distance (mm)" },
                ],
                diagram: {
                    origin: "right",
                    props: {
                        plateWidth: "Plate.Length",
                        plateHeight: "Plate.Height",
                        rows: "Bolt.OneLine",
                        cols: "Bolt.Line",
                        end: "Bolt.EndDist",
                        pitch: "Bolt.Pitch",
                        gauge: "Bolt.Gauge",
                        edge: "Bolt.EdgeDist",
                        holeDiameter: "Bolt.Diameter",
                    },
                },
            },
        },
        pattern: {
            PatternModal: [
                { key: "Plate.Yield", label: "Tension Yielding Capacity (kN)", section: "Failure due to Tension in Plate" },
                { key: "Plate.Rupture", label: "Tension Rupture Capacity (kN)", section: "Failure due to Tension in Plate" },
                { key: "Plate.BlockShear", label: "Block Shear Capacity (kN)", section: "Failure due to Block Shear in Plate" },
            ]
        }
    }
};
