import {
    KEY_MODULE, KEY_MATERIAL, KEY_AXIAL, KEY_DP_DETAILING_EDGE_TYPE,
    KEY_PLATE1_THICKNESS, KEY_PLATE2_THICKNESS, KEY_PLATE_WIDTH,
    KEY_DISP_PLATE1_THICKNESS, KEY_DISP_PLATE_WIDTH, KEY_DP_BOLT_SLIP_FACTOR,
    KEY_DISP_PLATE2_THICKNESS, KEY_D, KEY_TYP, KEY_GRD, KEY_DP_BOLT_HOLE_TYPE,
    KEY_DP_BOLT_TYPE, KEY_DESIGN_FOR,
} from "../../../../constants/DesignKeys";
import { validateSimpleConnectionInputs } from "../../shared/validation";

export const lapJointBoltedConfig = {
    sessionName: "Lap Joint Bolted",
    routePath: "/design/connections/simple/lap_joint_bolted",
    designType: "LapJointBolted",
    cameraKey: "Connection",
    cadOptions: ["Model", "Plate 1", "Plate 2", "Bolts"],

    defaultInputs: {
        axial_force: "60",
        module: "Lap Joint Bolted",
        plate1_thickness: [],
        plate2_thickness: [],
        bolt_diameter: [],
        bolt_grade: [],
        bolt_type: "Bearing Bolt",
        bolt_hole_type: "Standard",
        bolt_slip_factor: "0.3",
        plate_width: "200",
        material: "E 250 (Fe 410 W)A",
        detailing_edge_type: "Sheared or hand flame cut",
        bolt_tension_type: "Non Pre-tensioned",
        design_for: "Tension",
    },

    modalConfig: [
        { key: "boltDiameter", inputKey: "bolt_diameter", dataSource: "boltDiameterList" },
        { key: "propertyClass", inputKey: "bolt_grade", dataSource: "propertyClassList" },
    ],

    selectionConfig: [
        { key: "boltDiameterSelect", inputKey: "bolt_diameter", defaultValue: "All" },
        { key: "propertyClassSelect", inputKey: "bolt_grade", defaultValue: "All" },

    ],

    validateInputs: (inputs) => {
        return validateSimpleConnectionInputs(inputs, { 
            moduleType: 'bolted'
        });
    },

    buildSubmissionParams: (inputs, allSelected, lists) => {
        const getArrayParam = (allSelectedFlag, fullList, selectedList) => {
            if (allSelectedFlag) {
                const list = Array.isArray(fullList) && fullList.length ? fullList : (Array.isArray(selectedList) ? selectedList : []);
                return list.filter(item => item !== "All");
            }
            if (Array.isArray(selectedList)) {
                return selectedList.filter(item => item !== "All");
            }
            return [selectedList].filter(item => item !== "All");
        };
        return {
            [KEY_MODULE]: "LapJointBolted",
            [KEY_PLATE1_THICKNESS]: String(inputs.plate1_thickness),
            [KEY_PLATE2_THICKNESS]: String(inputs.plate2_thickness),
            [KEY_PLATE_WIDTH]: String(inputs.plate_width),
            [KEY_MATERIAL]: String(inputs.material),
            [KEY_AXIAL]: String(inputs.axial_force),
            [KEY_D]: getArrayParam(allSelected.bolt_diameter, lists.boltDiameterList, inputs.bolt_diameter),
            [KEY_GRD]: getArrayParam(allSelected.bolt_grade, lists.propertyClassList, inputs.bolt_grade),
            [KEY_TYP]: String(inputs.bolt_type),
            [KEY_DP_BOLT_HOLE_TYPE]: String(inputs.bolt_hole_type),
            [KEY_DP_BOLT_SLIP_FACTOR]: String(inputs.bolt_slip_factor),
            [KEY_DP_DETAILING_EDGE_TYPE]: String(inputs.detailing_edge_type),
            [KEY_DP_BOLT_TYPE]: String(inputs.bolt_tension_type),
            [KEY_DESIGN_FOR]: String(inputs.design_for),
        };
    },

    inputSections: [
        {
            title: "Connecting Members",
            fields: [
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
                },
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
            title: "Bolt",
            fields: [
                {
                    key: "bolt_diameter",
                    label: "Diameter (mm) *",
                    type: "customizable",
                    selectionKey: "boltDiameterSelect",
                    modalKey: "boltDiameter",
                    dataSource: "boltDiameterList"
                },
                {
                    key: "bolt_type",
                    label: "Type *",
                    type: "select",
                    options: [
                        { value: "Bearing Bolt", label: "Bearing Bolt" },
                        { value: "Friction Grip Bolt", label: "Friction Grip Bolt" }
                    ]
                },
                {
                    key: "bolt_grade",
                    label: "Property Class *",
                    type: "customizable",
                    selectionKey: "propertyClassSelect",
                    modalKey: "propertyClass",
                    dataSource: "propertyClassList"
                }
            ]
        },
    ]
}; 