/* eslint-disable react/prop-types */
import React from "react";
import { useContext, useRef, useState, useEffect } from "react";
import { ModuleContext } from "../context/ModuleState";
import { UserContext } from "../context/UserState";

const conn_map = {
  "Flushed - Reversible Moment": "Flushed - Reversible Moment",
  "Extended One Way - Irreversible Moment":
    "Extended One Way - Irreversible Moment",
  "Extended Both Ways - Reversible Moment":
    "Extended Both Ways - Reversible Moment",
};

function MomentDropdownMenu({
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
}) {
  const { boltDiameterList, propertyClassList, thicknessList } =
    useContext(ModuleContext);
  const { SaveInputValueFile } = useContext(UserContext);
  const { downloadCADModel } = useContext(ModuleContext);

  const [isOpen, setIsOpen] = useState(false);
  const parentRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  let moduleName = "";

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
        let PlateThicknessIndex = -1;
        let flangePlateThicknessIndex = -1;
        let webPlateThicknessIndex = -1;

        for (let i = 0; i < fileArr.length; i++) {
          const item = fileArr[i];
          const arr = item.split(":");

          console.log(arr[0]);

          if (arr[0].includes("Bolt.Diameter")) {
            boltDiameterIndex = i;
            continue;
          }
          if (arr[0].includes("Bolt.Grade")) {
            boltGradeIndex = i;
            continue;
          }
          if (arr[0].includes("Connector.Plate.Thickness_List")) {
            PlateThicknessIndex = i;
            console.log(PlateThicknessIndex);
            continue;
          }
          if (arr[0].includes("Connector.Web_Plate.Thickness_List")) {
            webPlateThicknessIndex = i;
            console.log(webPlateThicknessIndex);
            continue;
          }
          if (arr[0].includes("Connector.Flange_Plate.Thickness_list")) {
            flangePlateThicknessIndex = i;
            console.log(flangePlateThicknessIndex);
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
            case "Connectivity *":
              inputFromFileObj.connectivity = val;
              break;
            case "EndPlateType":
              setSelectedOption(conn_map[val]);
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
            case "Connector.Flange_Plate.Preferences":
              inputFromFileObj.flange_plate_preferences = val;
              break;
            case "Member.Supported_Section.Designation":
              inputFromFileObj.supported_designation = val;
              break;
            case "Member.Supported_Section.Material":
              inputFromFileObj.supported_material = val;
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
        if (moduleName === "Beam-to-Beam Cover Plate Bolted Connection") {
          if (flangePlateThicknessIndex !== -1) {
            inputFromFileObj.flange_plate_thickness = getFormatedArrayFields(
              fileArr,
              flangePlateThicknessIndex
            );
          }
          if (webPlateThicknessIndex !== -1) {
            inputFromFileObj.web_plate_thickness = getFormatedArrayFields(
              fileArr,
              webPlateThicknessIndex
            );
          }
        } else if (moduleName === "Beam-to-Beam End Plate Connection") {
          if (PlateThicknessIndex !== -1) {
            inputFromFileObj.plate_thickness = getFormatedArrayFields(
              fileArr,
              PlateThicknessIndex
            );
          }
        }

        console.log(inputFromFileObj);
        setInputs(inputFromFileObj);
        setAllSelected({
          bolt_diameter: false,
          bolt_grade: false,
          plate_thickness: false,
          flange_plate_thickness: false,
          web_plate_thickness: false,
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
    content += `Connector.Material: ${inputs.connector_material}\n`;
    content += `Design.Design_Method: ${inputs.design_method}\n`;
    content += `Detailing.Corrosive_Influences: ${inputs.detailing_corr_status}\n`;
    content += `Detailing.Edge_type: ${inputs.detailing_edge_type}\n`;
    content += `Detailing.Gap: ${inputs.detailing_gap}\n`;
    content += `Load.Axial: ${inputs.load_axial || ""}\n`;
    content += `Load.Shear: ${inputs.load_shear || ""}\n`;
    content += `Load.Moment: ${inputs.load_moment || ""}\n`;
    content += `Material: ${inputs.material}\n`;
    content += `Module: ${inputs.module}\n`;

    if (`${inputs.module}` === "Beam-to-Beam Cover Plate Bolted Connection") {
      content += `Connector.Flange_Plate.Preferences: ${inputs.flange_plate_preferences}\n`;
      content += `Member.Designation: ${inputs.member_designation}\n`;
      content += `Member.Material: ${inputs.member_material}\n`;
    }

    if (`${inputs.module}` === "Beam-to-Beam End Plate Connection") {
      content += `Connectivity *: ${inputs.connectivity}\n`;
      content += `EndPlateType: ${conn_map[selectedOption]}\n`;
      content += `Member.Supported_Section.Designation: ${inputs.supported_designation}\n`;
      content += `Memeber.Supported_Section.Material: ${inputs.supported_material}\n`;
      content += `Weld.Fab: ${inputs.weld_fab}\n`;
      content += `Weld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\n`;
      content += `Weld.Type: ${inputs.weld_type}\n`;
    }

    // Add extra fields only if available
    if (inputs.plate_thickness) {
      content += `Connector.Plate.Thickness_List:\n${formatArrayForText(
        allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
      )}\n`;
    }
    if (inputs.flange_plate_thickness) {
      content += `Connector.Flange_Plate.Thickness_list:\n${formatArrayForText(
        allSelected.flange_plate_thickness
          ? thicknessList
          : inputs.flange_plate_thickness
      )}\n`;
    }
    if (inputs.web_plate_thickness) {
      content += `Connector.Web_Plate.Thickness_List:\n${formatArrayForText(
        allSelected.web_plate_thickness
          ? thicknessList
          : inputs.web_plate_thickness
      )}\n`;
    }

    console.log(content);

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
    console.log("inside save input");
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
    content += `Connector.Material: ${inputs.connector_material}\n`;
    content += `Design.Design_Method: ${inputs.design_method}\n`;
    content += `Detailing.Corrosive_Influences: ${inputs.detailing_corr_status}\n`;
    content += `Detailing.Edge_type: ${inputs.detailing_edge_type}\n`;
    content += `Detailing.Gap: ${inputs.detailing_gap}\n`;
    content += `Load.Axial: ${inputs.load_axial || ""}\n`;
    content += `Load.Shear: ${inputs.load_shear || ""}\n`;
    content += `Load.Moment: ${inputs.load_moment || ""}\n`;
    content += `Material: ${inputs.material}\n`;
    content += `Module: ${inputs.module}\n`;

    if (moduleName !== "Beam-to-Beam Cover Plate Bolted Connection") {
      content += `Weld.Fab: ${inputs.weld_fab}\n`;
      content += `Weld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\n`;
    }

    // Add extra fields only if available
    if (inputs.flange_plate_thickness) {
      content += `Connector.Flange_Plate.Thickness_list:\n${formatArrayForText(
        allSelected.flange_plate_thickness
          ? thicknessList
          : inputs.flange_plate_thickness
      )}\n`;
    }
    if (inputs.web_plate_thickness) {
      content += `Connector.Web_Plate.Thickness_List:\n${formatArrayForText(
        allSelected.web_plate_thickness
          ? thicknessList
          : inputs.web_plate_thickness
      )}\n`;
    }

    console.log(content);

    if (localStorage.getItem("userType") == "guest") {
      alert("Cannot save, user is not loggedin in");
    } else if (localStorage.getItem("userType") == "user") {
      // send the content to the Server
      SaveInputValueFile(content).then((response) => {
        console.log("response in dropdown : ", response);
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
        console.log(`Save 3D model val ${option.name}`);
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
            console.log("Selected extension:", fileExtension);

            const blob = await downloadCADModel(fileExtension); // Call only to download

            if (blob) {
              const writable = await handle.createWritable();
              await writable.write(blob);
              await writable.close();
              console.log(
                `${fileExtension.toUpperCase()} CAD file saved successfully.`
              );
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
        console.log("Cad image saved");
        break;
      // File End
      // Edit Start
      case `Design Preferences`:
        setDesignPrefModalStatus(true);
        break;
      // Edit End
      // Graphics Start
      case `Zoom In`:
        console.log(`Zoom In val ${option.name}`);
        break;

      case `Zoom Out`:
        console.log(`Zoom Out val ${option.name}`);
        break;

      case `Pan`:
        console.log(`Pan val ${option.name}`);
        break;

      case `Rotate 3D Model`:
        console.log(`Rotate 3D Model val ${option.name}`);
        break;

      case `Model`:
        console.log(`Model val ${option.name}`);
        break;

      case `Beam`:
        console.log(`Beam val ${option.name}`);
        break;

      case `Column`:
        console.log(`Column val ${option.name}`);
        break;

      case `FinePlate`:
        console.log(`FinePlate val ${option.name}`);
        break;
      // Graphics End

      case `Downloads`:
        console.log(`Downloads val ${option.name}`);
        break;

      case `Reset`:
        console.log(`Reset val ${option.name}`);
        break;
      // Database End
      // Help Start
      case `Video Tutorials`:
        console.log(`Video Tutorials val ${option.name}`);
        break;

      case `Design Examples`:
        console.log(`Design Examples val ${option.name}`);
        break;

      case `Ask us a question`:
        console.log(`Ask us a question val ${option.name}`);
        break;

      case `About Osdag`:
        console.log(`About Osdag val ${option.name}`);
        break;
      // Help End

      default:
        console.log(`Default Val: ${option.name}`);
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

export default MomentDropdownMenu;
