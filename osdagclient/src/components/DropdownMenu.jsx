import React from 'react'
import { useContext, useRef, useState } from 'react';
import { ModuleContext } from '../context/ModuleState';

const conn_map = {
  "Column Flange-Beam-Web": "Column Flange-Beam Web",
  "Column Web-Beam-Web": "Column Web-Beam Web",
  "Beam-Beam": "Beam-Beam"
}

function DropdownMenu({ label, dropdown, setDesignPrefModalStatus, inputs, allSelected, selectedOption }) {

  const { boltDiameterList, propertyClassList, thicknessList } = useContext(ModuleContext)

  const [isOpen, setIsOpen] = useState(false);
  const parentRef = useRef(null)

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const loadInput = () => {
    console.log('load input called')
  }

  const formatArrayForText = (arr) => {
    let text = "";
    for(let i=0; i<arr.length; i++){
      if(i !== arr.length-1) text += `- '${arr[i]}'\n`
      else text += `- '${arr[i]}'`
    }
    return text;
  }

  const saveInput = () => {
    let content
    if (conn_map[selectedOption] == 'Column Flange-Beam Web' || conn_map[selectedOption] == 'Column Web-Beam Web') {
      content = `Bolt.Bolt_Hole_Type: ${inputs.bolt_hole_type}\nBolt.Diameter: \n${formatArrayForText(allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter)}\nBolt.Grade: \n${formatArrayForText(allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade)}\nBolt.Slip_Factor: ${inputs.bolt_slip_factor}\nBolt.TensionType: ${inputs.bolt_tension_type}\nBolt.Type: ${inputs.bolt_type.replaceAll("_", " ")}\nConnectivity: ${conn_map[selectedOption]}\nConnector.Material: ${inputs.connector_material}\nDesign.Design_Method: ${inputs.design_method}\nDetailing.Corrosive_Influences: ${inputs.detailing_corr_status}\nDetailing.Edge_type: ${inputs.detailing_edge_type}\nDetailing.Gap: ${inputs.detailing_gap}\nLoad.Axial: ${inputs.load_axial || ''}\nLoad.Shear: ${inputs.load_shear || ''}\nMaterial: ${inputs.connector_material}\nMember.Supported_Section.Designation: ${inputs.beam_section}\nMember.Supported_Section.Material: ${inputs.supported_material}\nMember.Supporting_Section.Designation: ${inputs.column_section}\nMember.Supporting_Section.Material: ${inputs.supporting_material}\nModule: Fin Plate Connection\nWeld.Fab: ${inputs.weld_fab}\nWeld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\nConnector.Plate.Thickness_List: \n${formatArrayForText(allSelected.plate_thickness ? thicknessList : inputs.plate_thickness)}\n`
    }
    else{
      content = `Bolt.Bolt_Hole_Type: ${inputs.bolt_hole_type}\nBolt.Diameter: \n${formatArrayForText(allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter)}\nBolt.Grade: \n${formatArrayForText(allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade)}\nBolt.Slip_Factor: ${inputs.bolt_slip_factor}\nBolt.TensionType: ${inputs.bolt_tension_type}\nBolt.Type: ${inputs.bolt_type.replaceAll("_", " ")}\nConnectivity: ${conn_map[selectedOption]}\nConnector.Material: ${inputs.connector_material}\nDesign.Design_Method: ${inputs.design_method}\nDetailing.Corrosive_Influences: ${inputs.detailing_corr_status}\nDetailing.Edge_type: ${inputs.detailing_edge_type}\nDetailing.Gap: ${inputs.detailing_gap}\nLoad.Axial: ${inputs.load_axial || ''}\nLoad.Shear: ${inputs.load_shear || ''}\nMaterial: ${inputs.connector_material}\nMember.Supported_Section.Designation: ${inputs.secondary_beam}\nMember.Supported_Section.Material: ${inputs.supported_material}\nMember.Supporting_Section.Designation: ${inputs.primary_beam}\nMember.Supporting_Section.Material: ${inputs.supporting_material}\nModule: Fin Plate Connection\nWeld.Fab: ${inputs.weld_fab}\nWeld.Material_Grade_OverWrite: ${inputs.weld_material_grade}\nConnector.Plate.Thickness_List: \n${formatArrayForText(allSelected.plate_thickness ? thicknessList : inputs.plate_thickness)}\n`

    }

    let element = document.createElement('a')
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'untitled.osi');
    element.style.display = 'none'
    parentRef.current.appendChild(element)
    element.click();
    parentRef.current.removeChild(element)
  }

  const handleClick = (option) => {
    // Handle specific code for the clicked option here
    // console.log(`Clicked option: ${option.name}`);
    switch (option.name) {
      case `Load Input`:
        loadInput();
        break;

      case `Save Input`:
        saveInput();
        break;

      case `Save Log Messages`: console.log(`Save log val ${option.name}`);
        break;

      case `Create Design Report`: console.log(`Create report val ${option.name}`);
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
        console.log(`Design Preferences ${option.name}`);
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


  return (
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
  );
}

export default DropdownMenu