import React from 'react'
import { useContext, useRef, useState, useEffect } from 'react';
import { ModuleContext } from '../context/ModuleState';
import { UserContext } from '../context/UserState'

const conn_map = {
  "Column Flange-Beam-Web": "Column Flange-Beam Web",
  "Column Web-Beam-Web": "Column Web-Beam Web",
  "Beam-Beam": "Beam-Beam"
}

const conn_map_inv = {
  "Column Flange-Beam Web": "Column Flange-Beam-Web",
  "Column Web-Beam Web": "Column Web-Beam-Web",
  "Beam-Beam": "Beam-Beam"
}

function DropdownMenu({ label, dropdown, setDesignPrefModalStatus, inputs, allSelected, selectedOption, setInputs, setSelectedOption, setAllSelected, logs, setCreateDesignReportBool, setDisplaySaveInputPopup, setSaveInputFileName}) {

  const { boltDiameterList, propertyClassList, thicknessList } = useContext(ModuleContext)
  const { SaveInputValueFile} = useContext(UserContext)

  const [isOpen, setIsOpen] = useState(false);
  const parentRef = useRef(null)

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const loadInput = () => {
    let element = document.createElement('input');
    element.setAttribute('type', 'file');
    parentRef.current.appendChild(element)
    element.click()

    element.addEventListener('change', e => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = function(event){
        const fileContent = event.target.result;
        const fileArr = fileContent.split('\n');
        let inputFromFileObj = {}
        let boltDiameterIndex = -1;
        let boltGradeIndex = -1;
        let plateThicknessIndex = -1;

        for(let i=0; i<fileArr.length; i++){
          const item = fileArr[i]
          const arr = item.split(":")

          if(arr[0].includes("Bolt.Diameter")){
            boltDiameterIndex = i; continue;
          }
          if(arr[0].includes("Bolt.Grade")){
            boltGradeIndex = i; continue;
          }
          if(arr[0].includes("Thickness_List")){
            plateThicknessIndex = i; continue;
          }

          if(arr.length <= 1) continue;
          
          let val = arr[1].trim();
          switch(arr[0]){
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
              if(selectedOption == "Beam-Beam") 
                inputFromFileObj.secondary_beam = val;
              else 
                inputFromFileObj.beam_section = val;
              break;
            case "Member.Supported_Section.Material":
              inputFromFileObj.supported_material = val;
              break;
            case "Member.Supporting_Section.Designation":
              if(selectedOption == "Beam-Beam") 
                inputFromFileObj.primary_beam = val;
              else
                inputFromFileObj.column_section = val;
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

        inputFromFileObj.bolt_diameter = getFormatedArrayFields(fileArr, boltDiameterIndex)
        inputFromFileObj.bolt_grade = getFormatedArrayFields(fileArr, boltGradeIndex);
        inputFromFileObj.plate_thickness = getFormatedArrayFields(fileArr, plateThicknessIndex);
        // console.log(inputFromFileObj)
        setInputs(inputFromFileObj)
        setAllSelected({
          plate_thickness: false,
          bolt_diameter: false,
          bolt_grade: false,
        })
      }

      reader.readAsText(file)
    })
    
    parentRef.current.removeChild(element)
  }


  const downloadInput = () => {
    let content
    if (conn_map[selectedOption] == 'Column Flange-Beam Web' || conn_map[selectedOption] == 'Column Web-Beam Web') {
      content = `Bolt.Bolt_Hole_Type: ${inputs.bolt_hole_type}\nBolt.Diameter: \n${formatArrayForText(allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter)}\nBolt.Grade: \n${formatArrayForText(allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade)}\nBolt.Slip_Factor: ${inputs.bolt_slip_factor}\nBolt.TensionType: ${inputs.bolt_tension_type}\nBolt.Type: ${inputs.bolt_type.replaceAll("_", " ")}\nConnectivity: ${conn_map[selectedOption]}\nConnector.Material: ${inputs.connector_material}\nDesign.Design_Method: ${inputs.design_method}\nDetailing.Corrosive_Influences: ${inputs.detailing_corr_status}\nDetailing.Edge_type: ${inputs.detailing_edge_type}\nDetailing.Gap: ${inputs.detailing_gap}\nLoad.Axial: ${inputs.load_axial || ''}\nLoad.Shear: ${inputs.load_shear || ''}\nMaterial: ${inputs.connector_material}\nMember.Supported_Section.Designation: ${inputs.beam_section}\nMember.Supported_Section.Material: ${inputs.supported_material}\nMember.Supporting_Section.Designation: ${inputs.column_section}\nMember.Supporting_Section.Material: ${inputs.supporting_material}\nModule: Fin Plate Connection\nWeld.Fab: ${inputs.weld_fab}\nWeld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\nConnector.Plate.Thickness_List: \n${formatArrayForText(allSelected.plate_thickness ? thicknessList : inputs.plate_thickness)}\n`

    }
    else{
      content = `Bolt.Bolt_Hole_Type: ${inputs.bolt_hole_type}\nBolt.Diameter: \n${formatArrayForText(allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter)}\nBolt.Grade: \n${formatArrayForText(allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade)}\nBolt.Slip_Factor: ${inputs.bolt_slip_factor}\nBolt.TensionType: ${inputs.bolt_tension_type}\nBolt.Type: ${inputs.bolt_type.replaceAll("_", " ")}\nConnectivity: ${conn_map[selectedOption]}\nConnector.Material: ${inputs.connector_material}\nDesign.Design_Method: ${inputs.design_method}\nDetailing.Corrosive_Influences: ${inputs.detailing_corr_status}\nDetailing.Edge_type: ${inputs.detailing_edge_type}\nDetailing.Gap: ${inputs.detailing_gap}\nLoad.Axial: ${inputs.load_axial || ''}\nLoad.Shear: ${inputs.load_shear || ''}\nMaterial: ${inputs.connector_material}\nMember.Supported_Section.Designation: ${inputs.secondary_beam}\nMember.Supported_Section.Material: ${inputs.supported_material}\nMember.Supporting_Section.Designation: ${inputs.primary_beam}\nMember.Supporting_Section.Material: ${inputs.supporting_material}\nModule: Fin Plate Connection\nWeld.Fab: ${inputs.weld_fab}\nWeld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\nConnector.Plate.Thickness_List: \n${formatArrayForText(allSelected.plate_thickness ? thicknessList : inputs.plate_thickness)}\n`

    }

    let element = document.createElement('a')
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'input_osdag.osi');
    element.style.display = 'none'
    parentRef.current.appendChild(element)
    element.click();
    parentRef.current.removeChild(element)

    // an API call, send the .osi file in the backend 

  }

  const saveLogMessages = () => {
    if(!logs){
      alert("No logs to save.");
      return;
    }

    let logsArr = []
    let flag = false;

    for(const log of logs){
      if(log.msg === "=== End Of Design ==="){
        flag = true; continue;
      }

      logsArr.push(`${log.type}: ${log.msg}`)
    }
    if(flag) logsArr.push(`INFO: === End Of Design ===`)

    const content = logsArr.join('\n')
    let element = document.createElement('a')
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'logs_osdag.osi');
    element.style.display = 'none'
    parentRef.current.appendChild(element)
    element.click();
    parentRef.current.removeChild(element)
  }

  const saveInput = () => {
    console.log('inside save input')
    let content
    if (conn_map[selectedOption] == 'Column Flange-Beam Web' || conn_map[selectedOption] == 'Column Web-Beam Web') {
      content = `Bolt.Bolt_Hole_Type: ${inputs.bolt_hole_type}\nBolt.Diameter: \n${formatArrayForText(allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter)}\nBolt.Grade: \n${formatArrayForText(allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade)}\nBolt.Slip_Factor: ${inputs.bolt_slip_factor}\nBolt.TensionType: ${inputs.bolt_tension_type}\nBolt.Type: ${inputs.bolt_type.replaceAll("_", " ")}\nConnectivity: ${conn_map[selectedOption]}\nConnector.Material: ${inputs.connector_material}\nDesign.Design_Method: ${inputs.design_method}\nDetailing.Corrosive_Influences: ${inputs.detailing_corr_status}\nDetailing.Edge_type: ${inputs.detailing_edge_type}\nDetailing.Gap: ${inputs.detailing_gap}\nLoad.Axial: ${inputs.load_axial || ''}\nLoad.Shear: ${inputs.load_shear || ''}\nMaterial: ${inputs.connector_material}\nMember.Supported_Section.Designation: ${inputs.beam_section}\nMember.Supported_Section.Material: ${inputs.supported_material}\nMember.Supporting_Section.Designation: ${inputs.column_section}\nMember.Supporting_Section.Material: ${inputs.supporting_material}\nModule: Fin Plate Connection\nWeld.Fab: ${inputs.weld_fab}\nWeld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\nConnector.Plate.Thickness_List: \n${formatArrayForText(allSelected.plate_thickness ? thicknessList : inputs.plate_thickness)}\n`

    }
    else{
      content = `Bolt.Bolt_Hole_Type: ${inputs.bolt_hole_type}\nBolt.Diameter: \n${formatArrayForText(allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter)}\nBolt.Grade: \n${formatArrayForText(allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade)}\nBolt.Slip_Factor: ${inputs.bolt_slip_factor}\nBolt.TensionType: ${inputs.bolt_tension_type}\nBolt.Type: ${inputs.bolt_type.replaceAll("_", " ")}\nConnectivity: ${conn_map[selectedOption]}\nConnector.Material: ${inputs.connector_material}\nDesign.Design_Method: ${inputs.design_method}\nDetailing.Corrosive_Influences: ${inputs.detailing_corr_status}\nDetailing.Edge_type: ${inputs.detailing_edge_type}\nDetailing.Gap: ${inputs.detailing_gap}\nLoad.Axial: ${inputs.load_axial || ''}\nLoad.Shear: ${inputs.load_shear || ''}\nMaterial: ${inputs.connector_material}\nMember.Supported_Section.Designation: ${inputs.secondary_beam}\nMember.Supported_Section.Material: ${inputs.supported_material}\nMember.Supporting_Section.Designation: ${inputs.primary_beam}\nMember.Supporting_Section.Material: ${inputs.supporting_material}\nModule: Fin Plate Connection\nWeld.Fab: ${inputs.weld_fab}\nWeld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\nConnector.Plate.Thickness_List: \n${formatArrayForText(allSelected.plate_thickness ? thicknessList : inputs.plate_thickness)}\n`

    }

    if(localStorage.getItem('userType')=='guest'){
      alert('Cannot save, user is not loggedin in')
    }else if(localStorage.getItem('userType')=='user'){
      // send the content to the Server 
      SaveInputValueFile(content).then((response) => {
        console.log('response in dropdown : ' , response)
        setDisplaySaveInputPopup(response.saveInputStatus)
        setSaveInputFileName(response.saveInputFileName)
      })
    }else{
      console.log('userType not matched')
    }
  }


  const handleClick = (option) => {
    switch (option.name) {
      case `Load Input`:
        loadInput();
        break;

      case `Download Input`:
        downloadInput();
        break;
      
      case 'Save Input' : 
        saveInput();
        break;

      case `Save Log Messages`: 
        saveLogMessages();
        break;

      case `Create Design Report`: 
        setCreateDesignReportBool(true);
        break;

      case `Save 3D Model`: console.log(`Save 3D model val ${option.name}`);
        break;

      case `Save Cad Image`: console.log(`Save Cad image val ${option.name}`);
        break;

      case `Save Front View`: console.log(`Save Front View val ${option.name}`);
        break;

      case `Save Top View`: console.log(`Save Top View val ${option.name}`);
        break;

      case `Save Side View`: console.log(`Save Side View val ${option.name}`);
        break;

      case `Quit`: console.log(`Quit val ${option.name}`);
        break;
      // File End
      // Edit Start
      case `Design Preferences`:
        setDesignPrefModalStatus(true);
        break;
      // Edit End
      // Graphics Start
      case `Zoom In`: console.log(`Zoom In val ${option.name}`);
        break;

      case `Zoom Out`: console.log(`Zoom Out val ${option.name}`);
        break;

      case `Pan`: console.log(`Pan val ${option.name}`);
        break;

      case `Rotate 3D Model`: console.log(`Rotate 3D Model val ${option.name}`);
        break;

      case `Model`: console.log(`Model val ${option.name}`);
        break;

      case `Beam`: console.log(`Beam val ${option.name}`);
        break;

      case `Column`: console.log(`Column val ${option.name}`);
        break;

      case `FinePlate`: console.log(`FinePlate val ${option.name}`);
      // Graphics End

      case `Downloads`: console.log(`Downloads val ${option.name}`);
        break;

      case `Reset`: console.log(`Reset val ${option.name}`);
        break;
      // Database End
      // Help Start
      case `Video Tutorials`: console.log(`Video Tutorials val ${option.name}`);
        break;

      case `Design Examples`: console.log(`Design Examples val ${option.name}`);
        break;

      case `Ask us a question`: console.log(`Ask us a question val ${option.name}`);
        break;

      case `About Osdag`: console.log(`About Osdag val ${option.name}`);
        break;
      // Help End

      default: console.log(`Default Val: ${option.name}`);
        break;
    }

  };

  // UTILITY FUNCTIONS
  const formatArrayForText = (arr) => {
    let text = "";
    for(let i=0; i<arr.length; i++){
      if(i !== arr.length-1) text += `- '${arr[i]}'\n`
      else text += `- '${arr[i]}'`
    }
    return text;
  }

  const getFormatedArrayFields = (arr, index) => {
    let res = []
    for(let i=index+1; i<arr.length; i++){
      if(!arr[i].includes("-")) break;
      res.push(arr[i].split(" ")[1].split("'")[1])
    }
    return res;
  }



  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (parentRef.current && !parentRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
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
            <div className="dropdown-items" key={index} onClick={() => handleClick(option)}>
              {option.name}
              {option.shortcut && <span className="shortcut">{option.shortcut}</span>}
            </div>
          ))}
        </div>
      )}

    </div>
    
      </>
  );
}

export default DropdownMenu