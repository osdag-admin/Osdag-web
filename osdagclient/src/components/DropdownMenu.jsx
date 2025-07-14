/* eslint-disable react/prop-types */
import React from "react";
import { useContext, useRef, useState, useEffect } from "react";
import { ModuleContext } from "../context/ModuleState";
import { UserContext } from "../context/UserState";

const conn_map = {
  "Column Flange-Beam-Web": "Column Flange-Beam Web",
  "Column Web-Beam-Web": "Column Web-Beam Web",
  "Beam-Beam": "Beam-Beam",
};

const conn_map_inv = {
  "Column Flange-Beam Web": "Column Flange-Beam-Web",
  "Column Web-Beam Web": "Column Web-Beam-Web",
  "Beam-Beam": "Beam-Beam",
};

function DropdownMenu({
  label,
  dropdown,
  setDesignPrefModalStatus,
  inputs,
  allSelected,
  selectedOption = null,
  setInputs,
  setSelectedOption = () => {},
  setAllSelected,
  logs,
  setCreateDesignReportBool,
  setDisplaySaveInputPopup,
  setSaveInputFileName,
  triggerScreenshotCapture
}) {
  const {
    boltDiameterList,
    propertyClassList,
    thicknessList,
    angleList,
    topAngleList,
  } = useContext(ModuleContext);
  const { SaveInputValueFile } = useContext(UserContext);
  const { downloadCADModel } = useContext(ModuleContext);


  const [isOpen, setIsOpen] = useState(false);
  const parentRef = useRef(null);

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
        let angleListIndex = -1;
        let topAngleIndex = -1;

        for (let i = 0; i < fileArr.length; i++) {
          const item = fileArr[i];
          const arr = item.split(":");
          arr[0] = arr[0].trim();

          if (arr[0].includes("Bolt.Diameter")) {
            boltDiameterIndex = i;
            continue;
          }
          if (arr[0].includes("Bolt.Grade")) {
            boltGradeIndex = i;
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
          if (arr[0].includes("Thickness_List")) {
            plateThicknessIndex = i;
            continue;
          }

          if (arr.length <= 1) continue;

          let val = arr[1].trim();
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
              setSelectedOption(conn_map_inv[val]);
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
            case "Material":
              inputFromFileObj.connector_material = val;
              break;
            case "Member.Supported_Section.Designation":
              if (selectedOption == "Beam-Beam")
                inputFromFileObj.secondary_beam = val;
              else inputFromFileObj.beam_section = val;
              break;
            case "Member.Supported_Section.Material":
              inputFromFileObj.supported_material = val;
              break;
            case "Member.Supporting_Section.Designation":
              if (selectedOption == "Beam-Beam")
                inputFromFileObj.primary_beam = val;
              else inputFromFileObj.column_section = val;
              break;
            case "Member.Supporting_Section.Material":
              inputFromFileObj.supporting_material = val;
              break;
            case "Module":
              inputFromFileObj.module = val;
              break;
            case "Weld.Fab":
              inputFromFileObj.weld_fab = val;
              break;
            case "Weld.Material_Grade_OverWrite":
              inputFromFileObj.weld_material_grade = val;
              break;
          }
        }

        if (boltDiameterIndex !== -1) {
          inputFromFileObj.bolt_diameter = getFormatedArrayFields(
            fileArr,
            boltDiameterIndex
          );
        }
        if (boltGradeIndex !== -1) {
          inputFromFileObj.bolt_grade = getFormatedArrayFields(
            fileArr,
            boltGradeIndex
          );
        }
        if (angleListIndex !== -1) {
          inputFromFileObj.angle_list = getFormatedArrayFields(
            fileArr,
            angleListIndex
          );
        }
        if (topAngleIndex !== -1) {
          inputFromFileObj.topangle_list = getFormatedArrayFields(
            fileArr,
            topAngleIndex
          );
        }
        if (plateThicknessIndex !== -1) {
          inputFromFileObj.plate_thickness = getFormatedArrayFields(
            fileArr,
            plateThicknessIndex
          );
        }

        setInputs(inputFromFileObj);
        setAllSelected({
          plate_thickness: false,
          bolt_diameter: false,
          bolt_grade: false,
          angle_list: false,
          topangle_list: false,
        });
      };

      reader.readAsText(file);
    });

    parentRef.current.removeChild(element);
  };

  const downloadInput = () => {
    let content = "";

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
    content += `Connectivity: ${conn_map[selectedOption]}\n`;
    content += `Connector.Material: ${inputs.connector_material}\n`;
    content += `Design.Design_Method: ${inputs.design_method}\n`;
    content += `Detailing.Corrosive_Influences: ${inputs.detailing_corr_status}\n`;
    content += `Detailing.Edge_type: ${inputs.detailing_edge_type}\n`;
    content += `Detailing.Gap: ${inputs.detailing_gap}\n`;
    content += `Load.Axial: ${inputs.load_axial || ""}\n`;
    content += `Load.Shear: ${inputs.load_shear || ""}\n`;
    content += `Material: ${inputs.connector_material}\n`;

    if (
      conn_map[selectedOption] === "Column Flange-Beam Web" ||
      conn_map[selectedOption] === "Column Web-Beam Web"
    ) {
      content += `Member.Supported_Section.Designation: ${inputs.beam_section}\n`;
      content += `Member.Supported_Section.Material: ${inputs.supported_material}\n`;
      content += `Member.Supporting_Section.Designation: ${inputs.column_section}\n`;
      content += `Member.Supporting_Section.Material: ${inputs.supporting_material}\n`;
    } else {
      content += `Member.Supported_Section.Designation: ${inputs.secondary_beam}\n`;
      content += `Member.Supported_Section.Material: ${inputs.supported_material}\n`;
      content += `Member.Supporting_Section.Designation: ${inputs.primary_beam}\n`;
      content += `Member.Supporting_Section.Material: ${inputs.supporting_material}\n`;
    }

    content += `Module: ${inputs.module}\n`;
    content += `Weld.Fab: ${inputs.weld_fab}\n`;
    content += `Weld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\n`;

    // Add extra fields only if available
    if (inputs.plate_thickness) {
      content += `Connector.Plate.Thickness_List:\n${formatArrayForText(
        allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
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

    // an API call, send the .osi file in the backend
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

  const saveInput = () => {
    let content = "";

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
    content += `Connectivity: ${conn_map[selectedOption]}\n`;
    content += `Connector.Material: ${inputs.connector_material}\n`;
    content += `Design.Design_Method: ${inputs.design_method}\n`;
    content += `Detailing.Corrosive_Influences: ${inputs.detailing_corr_status}\n`;
    content += `Detailing.Edge_type: ${inputs.detailing_edge_type}\n`;
    content += `Detailing.Gap: ${inputs.detailing_gap}\n`;
    content += `Load.Axial: ${inputs.load_axial || ""}\n`;
    content += `Load.Shear: ${inputs.load_shear || ""}\n`;
    content += `Material: ${inputs.connector_material}\n`;

    if (
      conn_map[selectedOption] === "Column Flange-Beam Web" ||
      conn_map[selectedOption] === "Column Web-Beam Web"
    ) {
      content += `Member.Supported_Section.Designation: ${inputs.beam_section}\n`;
      content += `Member.Supported_Section.Material: ${inputs.supported_material}\n`;
      content += `Member.Supporting_Section.Designation: ${inputs.column_section}\n`;
      content += `Member.Supporting_Section.Material: ${inputs.supporting_material}\n`;
    } else {
      content += `Member.Supported_Section.Designation: ${inputs.secondary_beam}\n`;
      content += `Member.Supported_Section.Material: ${inputs.supported_material}\n`;
      content += `Member.Supporting_Section.Designation: ${inputs.primary_beam}\n`;
      content += `Member.Supporting_Section.Material: ${inputs.supporting_material}\n`;
    }

    content += `Module: ${inputs.module}\n`;
    content += `Weld.Fab: ${inputs.weld_fab}\n`;
    content += `Weld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\n`;

    // Add extra fields only if available
    if (inputs.plate_thickness) {
      content += `Connector.Plate.Thickness_List:\n${formatArrayForText(
        allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
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

    if (localStorage.getItem("userType") == "guest") {
      alert("Cannot save, user is not loggedin in");
    } else if (localStorage.getItem("userType") == "user") {
      // send the content to the Server
      SaveInputValueFile(content).then((response) => {
        setDisplaySaveInputPopup(response.saveInputStatus);
        setSaveInputFileName(response.saveInputFileName);
      });
    } else {
      console.log("userType not matched");
    }
  };

  const handleClick = (option) => {
    switch (option.name) {
      case `Load Input`:
        loadInput();
        break;

      case `Download Input`:
        downloadInput();
        break;

      case "Save Input":
        saveInput();
        break;

      case `Save Log Messages`:
        saveLogMessages();
        break;

      case `Create Design Report`:
        setCreateDesignReportBool(true);
        break;

      case `Save 3D Model`:
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
                // {
                //   description: "STL File",
                //   accept: { "application/octet-stream": [".stl"] },
                // },
                {
                  description: "IGES File",
                  accept: { "application/octet-stream": [".iges"] },
                },
              ],
              suggestedName: "3dmodel",
            };
            
            const handle = await window.showSaveFilePicker(options);
            const fileExtension = handle.name.split(".").pop(); // Get selected format

            const blob = await downloadCADModel(fileExtension); // Call only to download

            if (blob) {
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
            } else {
              console.error("Failed to download CAD model blob.");
            }
          } catch (error) {
            console.error("Save 3D model cancelled or failed", error);
          }
        })();
        break;

      case `Save Cad Image`:
        triggerScreenshotCapture();
        break;

      // File End
      // Edit Start
      case `Design Preferences`:
        setDesignPrefModalStatus(true);
        break;
      // Edit End
      // Graphics Start
      case `Zoom In`:
        break;

      case `Zoom Out`:
        break;

      case `Pan`:
        break;

      case `Rotate 3D Model`:
        break;

      case `Model`:
        break;

      case `Beam`:
        break;

      case `Column`:
        break;

      case `FinePlate`:
        break;
      // Graphics End

      case `Downloads`:
        break;

      case `Reset`:
        break;
      // Database End
      // Help Start
      case `Video Tutorials`:
        break;

      case `Design Examples`:
        break;

      case `Ask us a question`:
        break;

      case `About Osdag`:
        break;
      // Help End

      default:
        break;
    }
  };

  // UTILITY FUNCTIONS
  const formatArrayForText = (arr) => {
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

      // Match string inside single quotes
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
    <>
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
    </>
  );
}

export default DropdownMenu;
