import {
    KEY_MODULE, KEY_MATERIAL, KEY_AXIAL, KEY_DP_DETAILING_EDGE_TYPE,
    KEY_PLATE1_THICKNESS, KEY_PLATE2_THICKNESS, KEY_PLATE_WIDTH, KEY_WELD_SIZE,
    KEY_DISP_WELD_SIZE, KEY_DISP_PLATE1_THICKNESS, KEY_DISP_PLATE_WIDTH,
    KEY_DISP_PLATE2_THICKNESS,
    KEY_DESIGN_FOR,
    KEY_DP_WELD_TYPE, KEY_DP_WELD_MATERIAL_G_O
} from "../../../../constants/DesignKeys";
import { validateSimpleConnectionInputs } from "../../shared/validation";

export const lapJointWeldedConfig = {
    sessionName: "Lap Joint Welded",
    routePath: "/design/connections/simple/lap_joint_welded",
    designType: "LapJointWelded",
    cameraKey: "Connection",
    cadOptions: ["Model", "Plate 1", "Plate 2", "Welds"],

    defaultInputs: {
        axial_force: "60",
        module: "Lap Joint Welded",
        plate1_thickness: [],
        plate2_thickness: [],
        weld_size: [],
        plate_width: "200",
        material: "E 250 (Fe 410 W)A",
        detailing_edge_type: "Sheared or hand flame cut",
        weld_fab: "Shop weld",
        weld_material_grade: "290",
        design_for: "Tension",
    },

    modalConfig: [
        { key: "weldSelect", inputKey: "weld_size", dataSource: "weldSizeList" },
    ],

    selectionConfig: [
        { key: "weldSizeSelect", inputKey: "weld_size", defaultValue: "All" },

    ],

    validateInputs: (inputs) => {
        // Validate inputs before API call - return early if invalid
        return validateSimpleConnectionInputs(inputs, { 
            moduleType: 'welded'
        });
    },

    buildSubmissionParams: (inputs, allSelected, lists) => {
        const getArrayParam = (allSelectedFlag, fullList, selectedList) => {
            if (allSelectedFlag) {
                // Prefer full list; if not loaded yet, use already-synced selectedList (e.g. from useEffect)
                const list = Array.isArray(fullList) && fullList.length ? fullList : (Array.isArray(selectedList) ? selectedList : []);
                return list.filter(item => item !== "All");
            }
            if (Array.isArray(selectedList)) {
                return selectedList.filter(item => item !== "All");
            }
            return [selectedList].filter(item => item !== "All");
        };

        return {
            [KEY_MODULE]: "LapJointWelded",
            [KEY_PLATE1_THICKNESS]: String(inputs.plate1_thickness),
            [KEY_PLATE2_THICKNESS]: String(inputs.plate2_thickness),
            [KEY_PLATE_WIDTH]: String(inputs.plate_width),
            [KEY_MATERIAL]: String(inputs.material),
            [KEY_AXIAL]: String(inputs.axial_force),
            [KEY_WELD_SIZE]: getArrayParam(allSelected.weld_size, lists.weldSizeList, inputs.weld_size),
            [KEY_DESIGN_FOR]: String(inputs.design_for),
            [KEY_DP_WELD_TYPE]: String(inputs.weld_fab || "Shop weld"),
            [KEY_DP_WELD_MATERIAL_G_O]: String(inputs.weld_material_grade || ""),
            [KEY_DP_DETAILING_EDGE_TYPE]: String(inputs.detailing_edge_type),
        };
    },

    inputSections: [
        {
            title: "Connecting Members",
            fields: [
                {
                    key: "plate1_thickness",
                    label: KEY_DISP_PLATE1_THICKNESS,
                    type: "select",
                    options: "thicknessList",
                    onChange: (value, inputs, setInputs) => {
                        setInputs({
                            ...inputs,
                            "plate1_thickness": value,
                        });
                    }
                },
                {
                    key: "plate2_thickness",
                    label: KEY_DISP_PLATE2_THICKNESS,
                    type: "select",
                    options: "thicknessList",
                    onChange: (value, inputs, setInputs) => {
                        setInputs({
                            ...inputs,
                            "plate2_thickness": value,
                        });
                    }
                },
                {
                    key: "plate_width",
                    label: KEY_DISP_PLATE_WIDTH,
                    type: "number"
                },
                {
                    key: "material",
                    label: "Material *",
                    type: "select",
                    options: "materialList",
                    onChange: (value, inputs, setInputs, materialList) => {
                        const material = materialList.find(item => item.id === value);
                        setInputs({
                            ...inputs,
                            material: material.Grade,
                            connector_material: material.Grade,
                        });
                    }
                }
            ]
        },
        {
            title: "Factored Loads",
            fields: [
                { key: "axial_force", label: "Axial Force (kN)*", type: "number", required: true }
            ]
        },
        {
            title: "Weld",
            fields: [
                {
                    key: "weld_size",
                    label: KEY_DISP_WELD_SIZE,
                    type: "customizable",
                    selectionKey: "weldSizeSelect",
                    modalKey: "weldSelect",
                    dataSource: "weldSizeList"
                }
            ]
        }
    ]
}; 