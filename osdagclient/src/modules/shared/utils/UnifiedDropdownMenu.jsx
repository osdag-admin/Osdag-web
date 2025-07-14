/* eslint-disable react/prop-types */
import React from "react";
import { useContext, useRef, useState, useEffect } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { UserContext } from "../../../context/UserState";
import { MODULE_KEY_FIN_PLATE } from '../../../constants/DesignKeys';

// Module-specific configurations
const MODULE_CONFIGS = {
  [MODULE_KEY_FIN_PLATE]: {
    connectivityField: "Connectivity",
    connectivityMap: {
      "Column Flange-Beam-Web": "Column Flange-Beam Web",
      "Column Web-Beam-Web": "Column Web-Beam Web",
      "Beam-Beam": "Beam-Beam",
    },
    connectivityMapInverse: {
      "Column Flange-Beam Web": "Column Flange-Beam-Web",
      "Column Web-Beam Web": "Column Web-Beam-Web",
      "Beam-Beam": "Beam-Beam",
    },
    fields: {
      memberSupported: "Member.Supported_Section.Designation",
      memberSupporting: "Member.Supporting_Section.Designation",
      plateThickness: "Connector.Plate.Thickness_List",
      angleList: "Connector.Angle_List",
      topAngleList: "Connector.Top_Angle_List",
    },
    conditionalLogic: (selectedOption, inputs) => {
      const connectivity = MODULE_CONFIGS[MODULE_KEY_FIN_PLATE].connectivityMap[selectedOption];
      if (connectivity === "Column Flange-Beam Web" || connectivity === "Column Web-Beam Web") {
        return {
          memberSupported: inputs.beam_section,
          memberSupporting: inputs.column_section,
        };
      } else {
        return {
          memberSupported: inputs.secondary_beam,
          memberSupporting: inputs.primary_beam,
        };
      }
    }
  },
  "Beam-to-Beam End Plate Connection": {
    connectivityField: "Connectivity *",
    endPlateField: "EndPlateType",
    connectivityMap: {
      "Flushed - Reversible Moment": "Flushed - Reversible Moment",
      "Extended One Way - Irreversible Moment": "Extended One Way - Irreversible Moment",
      "Extended Both Ways - Reversible Moment": "Extended Both Ways - Reversible Moment",
    },
    fields: {
      memberDesignation: "Member.Supported_Section.Designation",
      memberMaterial: "Member.Supported_Section.Material",
      plateThickness: "Connector.Plate.Thickness_List",
      weldFab: "Weld.Fab",
      weldMaterial: "Weld.Material_Grade_OverWrite",
      weldType: "Weld.Type",
    }
  },
  "Beam-to-Beam Cover Plate Bolted Connection": {
    fields: {
      memberDesignation: "Member.Designation",
      memberMaterial: "Member.Material",
      flangePreferences: "Connector.Flange_Plate.Preferences",
      flangePlateThickness: "Connector.Flange_Plate.Thickness_list",
      webPlateThickness: "Connector.Web_Plate.Thickness_List",
    }
  }
};

function UnifiedDropdownMenu({
  label,
  dropdown,
  setDesignPrefModalStatus,
  inputs,
  allSelected,
  setInputs,
  setAllSelected,
  logs,
  setCreateDesignReportBool,
  setDisplaySaveInputPopup,
  setSaveInputFileName,
  triggerScreenshotCapture,
  selectedOption = null,
  setSelectedOption = () => {},
  moduleType, // "finplate" | "endplate" | "coverplate"
}) {
  const {
    boltDiameterList,
    propertyClassList,
    thicknessList,
    angleList,
    topAngleList,
    downloadCADModel,
  } = useContext(ModuleContext);
  
  const { SaveInputValueFile } = useContext(UserContext);

  const [isOpen, setIsOpen] = useState(false);
  const parentRef = useRef(null);

  // Get module configuration based on module name from inputs
  const getModuleConfig = () => {
    const moduleName = inputs?.module;
    return MODULE_CONFIGS[moduleName] || {};
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const loadInput = () => {
    let element = document.createElement("input");
    element.setAttribute("type", "file");
    parentRef.current.appendChild(element);
    element.click();

    element.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = function (event) {
        const fileContent = event.target.result;
        const fileArr = fileContent.split("\n");
        let inputFromFileObj = {};
        let boltDiameterIndex = -1;
        let boltGradeIndex = -1;
        let plateThicknessIndex = -1;
        let flangePlateThicknessIndex = -1;
        let webPlateThicknessIndex = -1;
        let angleListIndex = -1;
        let topAngleIndex = -1;
        let moduleName = "";

        // Parse file content
        for (let i = 0; i < fileArr.length; i++) {
          const item = fileArr[i];
          const arr = item.split(":");
          arr[0] = arr[0].trim();

          // Find array field indices
          if (arr[0].includes("Bolt.Diameter")) {
            boltDiameterIndex = i;
            continue;
          }
          if (arr[0].includes("Bolt.Grade")) {
            boltGradeIndex = i;
            continue;
          }
          if (arr[0].includes("Connector.Plate.Thickness_List")) {
            plateThicknessIndex = i;
            continue;
          }
          if (arr[0].includes("Connector.Flange_Plate.Thickness_list")) {
            flangePlateThicknessIndex = i;
            continue;
          }
          if (arr[0].includes("Connector.Web_Plate.Thickness_List")) {
            webPlateThicknessIndex = i;
            continue;
          }
          if (arr[0].includes("Angle_List")) {
            angleListIndex = i;
            continue;
          }
          if (arr[0].includes("Top_Angle")) {
            topAngleIndex = i;
            continue;
          }

          if (arr.length <= 1) continue;

          let val = arr[1].trim();
          
          // Parse basic fields
          switch (arr[0]) {
            case "Bolt.Bolt_Hole_Type":
              inputFromFileObj.bolt_hole_type = val;
              break;
            case "Bolt.Slip_Factor":
              inputFromFileObj.bolt_slip_factor = val;
              break;
            case "Bolt.TensionType":
              inputFromFileObj.bolt_tension_type = val;
              break;
            case "Bolt.Type":
              inputFromFileObj.bolt_type = val;
              break;
            case "Connectivity":
              const config = MODULE_CONFIGS[MODULE_KEY_FIN_PLATE];
              if (config?.connectivityMapInverse) {
                setSelectedOption(config.connectivityMapInverse[val]);
              }
              break;
            case "Connectivity *":
              inputFromFileObj.connectivity = val;
              break;
            case "EndPlateType":
              const endPlateConfig = MODULE_CONFIGS["Beam-to-Beam End Plate Connection"];
              if (endPlateConfig?.connectivityMap) {
                setSelectedOption(Object.keys(endPlateConfig.connectivityMap).find(key => 
                  endPlateConfig.connectivityMap[key] === val
                ));
              }
              break;
            case "Connector.Material":
              inputFromFileObj.connector_material = val;
              break;
            case "Design.Design_Method":
              inputFromFileObj.design_method = val;
              break;
            case "Detailing.Corrosive_Influences":
              inputFromFileObj.detailing_corr_status = val;
              break;
            case "Detailing.Edge_type":
              inputFromFileObj.detailing_edge_type = val;
              break;
            case "Detailing.Gap":
              inputFromFileObj.detailing_gap = val;
              break;
            case "Load.Axial":
              inputFromFileObj.load_axial = val;
              break;
            case "Load.Shear":
              inputFromFileObj.load_shear = val;
              break;
            case "Load.Moment":
              inputFromFileObj.load_moment = val;
              break;
            case "Material":
              inputFromFileObj.material = val;
              break;
            case "Module":
              inputFromFileObj.module = val;
              moduleName = val;
              break;
            case "Weld.Fab":
              inputFromFileObj.weld_fab = val;
              break;
            case "Weld.Material_Grade_OverWrite":
              inputFromFileObj.weld_material_grade = val;
              break;
            case "Weld.Type":
              inputFromFileObj.weld_type = val;
              break;
            case "Member.Designation":
              inputFromFileObj.member_designation = val;
              break;
            case "Member.Material":
              inputFromFileObj.member_material = val;
              break;
            case "Member.Supported_Section.Designation":
              if (moduleName === MODULE_KEY_FIN_PLATE) {
                if (selectedOption === "Beam-Beam") {
                  inputFromFileObj.secondary_beam = val;
                } else {
                  inputFromFileObj.beam_section = val;
                }
              } else {
                inputFromFileObj.supported_designation = val;
              }
              break;
            case "Member.Supported_Section.Material":
              inputFromFileObj.supported_material = val;
              break;
            case "Member.Supporting_Section.Designation":
              if (moduleName === MODULE_KEY_FIN_PLATE) {
                if (selectedOption === "Beam-Beam") {
                  inputFromFileObj.primary_beam = val;
                } else {
                  inputFromFileObj.column_section = val;
                }
              }
              break;
            case "Member.Supporting_Section.Material":
              inputFromFileObj.supporting_material = val;
              break;
            case "Connector.Flange_Plate.Preferences":
              inputFromFileObj.flange_plate_preferences = val;
              break;
          }
        }

        // Parse array fields
        if (boltDiameterIndex !== -1) {
          inputFromFileObj.bolt_diameter = getFormatedArrayFields(fileArr, boltDiameterIndex);
        }
        if (boltGradeIndex !== -1) {
          inputFromFileObj.bolt_grade = getFormatedArrayFields(fileArr, boltGradeIndex);
        }
        if (plateThicknessIndex !== -1) {
          inputFromFileObj.plate_thickness = getFormatedArrayFields(fileArr, plateThicknessIndex);
        }
        if (flangePlateThicknessIndex !== -1) {
          inputFromFileObj.flange_plate_thickness = getFormatedArrayFields(fileArr, flangePlateThicknessIndex);
        }
        if (webPlateThicknessIndex !== -1) {
          inputFromFileObj.web_plate_thickness = getFormatedArrayFields(fileArr, webPlateThicknessIndex);
        }
        if (angleListIndex !== -1) {
          inputFromFileObj.angle_list = getFormatedArrayFields(fileArr, angleListIndex);
        }
        if (topAngleIndex !== -1) {
          inputFromFileObj.topangle_list = getFormatedArrayFields(fileArr, topAngleIndex);
        }

        setInputs(inputFromFileObj);
        
        // Reset all selected states based on what fields were loaded
        const resetStates = {
          bolt_diameter: false,
          bolt_grade: false,
        };
        
        if (plateThicknessIndex !== -1) resetStates.plate_thickness = false;
        if (flangePlateThicknessIndex !== -1) resetStates.flange_plate_thickness = false;
        if (webPlateThicknessIndex !== -1) resetStates.web_plate_thickness = false;
        if (angleListIndex !== -1) resetStates.angle_list = false;
        if (topAngleIndex !== -1) resetStates.topangle_list = false;
        
        setAllSelected(resetStates);
      };

      reader.readAsText(file);
    });

    parentRef.current.removeChild(element);
  };

  const buildContentString = () => {
    let content = "";
    const moduleConfig = getModuleConfig();
    const moduleName = inputs.module;

    // Basic bolt and connector fields
    content += `Bolt.Bolt_Hole_Type: ${inputs.bolt_hole_type}\n`;
    content += `Bolt.Diameter:\n${formatArrayForText(
      allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter
    )}\n`;
    content += `Bolt.Grade:\n${formatArrayForText(
      allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade
    )}\n`;
    content += `Bolt.Slip_Factor: ${inputs.bolt_slip_factor}\n`;
    content += `Bolt.TensionType: ${inputs.bolt_tension_type}\n`;
    content += `Bolt.Type: ${inputs.bolt_type.replaceAll("_", " ")}\n`;

    // Module-specific connectivity handling
    if (moduleName === MODULE_KEY_FIN_PLATE) {
      content += `Connectivity: ${moduleConfig.connectivityMap[selectedOption]}\n`;
    } else if (moduleName === "Beam-to-Beam End Plate Connection") {
      content += `Connectivity *: ${inputs.connectivity}\n`;
      content += `EndPlateType: ${moduleConfig.connectivityMap[selectedOption]}\n`;
    }

    content += `Connector.Material: ${inputs.connector_material}\n`;
    content += `Design.Design_Method: ${inputs.design_method}\n`;
    content += `Detailing.Corrosive_Influences: ${inputs.detailing_corr_status}\n`;
    content += `Detailing.Edge_type: ${inputs.detailing_edge_type}\n`;
    content += `Detailing.Gap: ${inputs.detailing_gap}\n`;
    content += `Load.Axial: ${inputs.load_axial || ""}\n`;
    content += `Load.Shear: ${inputs.load_shear || ""}\n`;

    if (inputs.load_moment !== undefined) {
      content += `Load.Moment: ${inputs.load_moment || ""}\n`;
    }

    content += `Material: ${inputs.material || inputs.connector_material}\n`;
    content += `Module: ${inputs.module}\n`;

    // Module-specific member designation handling
    if (moduleName === MODULE_KEY_FIN_PLATE) {
      const memberData = moduleConfig.conditionalLogic(selectedOption, inputs);
      content += `Member.Supported_Section.Designation: ${memberData.memberSupported}\n`;
      content += `Member.Supported_Section.Material: ${inputs.supported_material}\n`;
      content += `Member.Supporting_Section.Designation: ${memberData.memberSupporting}\n`;
      content += `Member.Supporting_Section.Material: ${inputs.supporting_material}\n`;
    } else if (moduleName === "Beam-to-Beam End Plate Connection") {
      content += `Member.Supported_Section.Designation: ${inputs.supported_designation}\n`;
      content += `Member.Supported_Section.Material: ${inputs.supported_material}\n`;
    } else if (moduleName === "Beam-to-Beam Cover Plate Bolted Connection") {
      content += `Member.Designation: ${inputs.member_designation}\n`;
      content += `Member.Material: ${inputs.member_material}\n`;
      content += `Connector.Flange_Plate.Preferences: ${inputs.flange_plate_preferences}\n`;
    }

    // Weld information (not for cover plate bolted)
    if (moduleName !== "Beam-to-Beam Cover Plate Bolted Connection") {
      content += `Weld.Fab: ${inputs.weld_fab}\n`;
      content += `Weld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\n`;
      if (inputs.weld_type) {
        content += `Weld.Type: ${inputs.weld_type}\n`;
      }
    }

    // Thickness lists based on module
    if (inputs.plate_thickness) {
      content += `Connector.Plate.Thickness_List:\n${formatArrayForText(
        allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
      )}\n`;
    }
    if (inputs.flange_plate_thickness) {
      content += `Connector.Flange_Plate.Thickness_list:\n${formatArrayForText(
        allSelected.flange_plate_thickness ? thicknessList : inputs.flange_plate_thickness
      )}\n`;
    }
    if (inputs.web_plate_thickness) {
      content += `Connector.Web_Plate.Thickness_List:\n${formatArrayForText(
        allSelected.web_plate_thickness ? thicknessList : inputs.web_plate_thickness
      )}\n`;
    }
    if (inputs.angle_list) {
      content += `Connector.Angle_List:\n${formatArrayForText(
        allSelected.angle_list ? angleList : inputs.angle_list
      )}\n`;
    }
    if (inputs.topangle_list) {
      content += `Connector.Top_Angle_List:\n${formatArrayForText(
        allSelected.topangle_list ? topAngleList : inputs.topangle_list
      )}\n`;
    }

    return content;
  };

  const downloadInput = () => {
    const content = buildContentString();
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", "input_osdag.osi");
    element.style.display = "none";
    parentRef.current.appendChild(element);
    element.click();
    parentRef.current.removeChild(element);
  };

  const saveInput = () => {
    const content = buildContentString();

    if (localStorage.getItem("userType") === "guest") {
      alert("Cannot save, user is not logged in");
    } else if (localStorage.getItem("userType") === "user") {
      SaveInputValueFile(content).then((response) => {
        setDisplaySaveInputPopup(response.saveInputStatus);
        setSaveInputFileName(response.saveInputFileName);
      });
    } else {
      // userType not matched
    }
  };

  const saveLogMessages = () => {
    if (!logs) {
      alert("No logs to save.");
      return;
    }

    let logsArr = [];
    let flag = false;

    for (const log of logs) {
      if (log.msg === "=== End Of Design ===") {
        flag = true;
        continue;
      }
      logsArr.push(`${log.type}: ${log.msg}`);
    }
    if (flag) logsArr.push(`INFO: === End Of Design ===`);

    const content = logsArr.join("\n");
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", "logs_osdag.osi");
    element.style.display = "none";
    parentRef.current.appendChild(element);
    element.click();
    parentRef.current.removeChild(element);
  };

  const handleClick = (option) => {
    switch (option.name) {
      case "Load Input":
        loadInput();
        break;
      case "Download Input":
        downloadInput();
        break;
      case "Save Input":
        saveInput();
        break;
      case "Save Log Messages":
        saveLogMessages();
        break;
      case "Create Design Report":
        setCreateDesignReportBool(true);
        break;
      case "Save 3D Model":
        (async () => {
          try {
            const options = {
              types: [
                {
                  description: "OBJ File",
                  accept: { "application/octet-stream": [".obj"] },
                },
                {
                  description: "BREP File",
                  accept: { "application/octet-stream": [".brep"] },
                },
                {
                  description: "STEP File",
                  accept: { "application/octet-stream": [".step"] },
                },
                {
                  description: "IGES File",
                  accept: { "application/octet-stream": [".iges"] },
                },
              ],
              suggestedName: "3dmodel",
            };
            
            const handle = await window.showSaveFilePicker(options);
            const fileExtension = handle.name.split(".").pop();
            const blob = await downloadCADModel(fileExtension);

            if (blob) {
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
              // CAD file saved successfully
              message.success(`${fileExtension.toUpperCase()} CAD file saved successfully.`);
            } else {
              console.error("Failed to download CAD model blob.");
            }
          } catch (error) {
            console.error("Save 3D model cancelled or failed", error);
          }
        })();
        break;
      case "Save Cad Image":
        triggerScreenshotCapture();
        break;
      case "Design Preferences":
        setDesignPrefModalStatus(true);
        break;
      default:
        // Default value
        setInputs({
          ...inputs,
          [inputKey]: option.name,
        });
        break;
    }
  };

  // UTILITY FUNCTIONS
  const formatArrayForText = (arr) => {
    if (!arr || arr.length === 0) return "";
    let text = "";
    for (let i = 0; i < arr.length; i++) {
      if (i !== arr.length - 1) text += `- '${arr[i]}'\n`;
      else text += `- '${arr[i]}'`;
    }
    return text;
  };

  const getFormatedArrayFields = (arr, index) => {
    let res = [];
    for (let i = index + 1; i < arr.length; i++) {
      const line = arr[i].trim();
      if (!line.startsWith("-")) break;

      const match = line.match(/'([^']+)'/);
      if (match) {
        res.push(match[1]);
      }
    }
    return res;
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (parentRef.current && !parentRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="dropdown" ref={parentRef}>
      <div className="dropdown-label" onClick={handleToggle}>
        {label}
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {dropdown.map((option, index) => (
            <div
              className="dropdown-items"
              key={index}
              onClick={() => handleClick(option)}
            >
              {option.name}
              {option.shortcut && (
                <span className="shortcut">{option.shortcut}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UnifiedDropdownMenu;