export const buttJointWeldedOutputConfig = {
    sections: {
        "Cover Plate Details": [
            { key: "Utilisation Ratio", label: "Utilisation Ratio" },
            { key: "No Cover Plate", label: "No Cover Plate" },
            { key: "Width of Cover Plate", label: "Width of Cover Plate" },
            { key: "Length of Cover Plate", label: "Length of Cover Plate" },
            { key: "Thickness of Cover Plate", label: "Thickness of Cover Plate" },
        ],
        "Weld Details": [
            { key: "Weld.Type", label: "Type" },
            { key: "Weld.Size", label: "Size (mm)" },
            { key: "Weld.Strength", label: "Strength (kN)" },
            { key: "Weld.EffLength", label: "Eff.Length (mm)" },
            { key: "Bolt.ConnLength", label: "Length of Connection (mm)" },
            { key: "Design For", label: "Design For" },
            { key: "SpacingModal", label: "Spacing Details" },
        ],
    },

    modals: {
        SpacingModal: { type: "spacing", buttonText: "Spacing Details" }
    },

    modalTypes: {
        spacing: {
            title: "Spacing Details",
            width: "68%",
            layout: "spacing-diagram",
            hasImage: true,
            note: "Representative Image for Spacing Details - 3 x 3 pattern considered"
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
                        plateWidth: "Width of Cover Plate",
                        plateHeight: "Length of Cover Plate",
                        rows: 3,  // Representative 3x3 pattern as per note
                        cols: 3,  // Representative 3x3 pattern as per note
                        end: "Bolt.EndDist",
                        pitch: "Bolt.Pitch",
                        gauge: "Bolt.Gauge",
                        edge: "Bolt.EdgeDist",
                    },
                },
            },
        }
    }
}; 