export const lapJointBoltedOutputConfig = {
    sections: {
        "Bolt Details": [
            { key: "Bolt.Diameter", label: "Diameter (mm)" },
            { key: "Bolt.Grade_Provided", label: "Property Class" },
            { key: "Bolt.Type_Provided", label: "Type" },
            { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
            { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
            { key: "Bolt.Capacity", label: "Capacity (kN)" },
            { key: "Bolt.Slip", label: "Slip Resistance" }
        ],
        "Bolt Design": [
            { key: "Bolt.number", label: "Number of Bolts" },
            { key: "Bolt.Rows", label: "Rows of Bolts" },
            { key: "Bolt.Cols", label: "Columns of Bolts" },
            { key: "Bolt.ConnLength", label: "Length of Connection (mm)" },
            { key: "Bolt.UtilizationRatio", label: "Utilisation Ratio" },
            { key: "Design For", label: "Design For" },
            { key: "Plate.BaseCapacity", label: "Base Metal Capacity (kN)" },
            { key: "Plate.BaseUtilization", label: "Base Metal Utilization" },
            { key: "Bolt.Utilization", label: "Bolt Utilization" },
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
                    { key: "PlateWidth", label: "Member Depth (mm)" },
                    { key: "Bolt.Diameter", label: "Hole Diameter (mm)" },
                ],
                diagram: {
                    origin: "right",
                    props: {
                        plateWidth: "Bolt.ConnLength",
                        plateHeight: "PlateWidth",
                        rows: "Bolt.Rows",
                        cols: "Bolt.Cols",
                        end: "Bolt.EndDist",
                        pitch: "Bolt.Gauge",
                        gauge: "Bolt.Pitch",
                        edge: "Bolt.EdgeDist",
                        holeDiameter: "Bolt.Diameter",
                    },
                },
            },
        }
    }
}; 