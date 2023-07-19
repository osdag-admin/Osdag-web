import React from 'react'
import { useContext, useEffect, useState } from 'react';

function DropdownMenu({ label, dropdown, setDesignPrefModalStatus }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
      setIsOpen(!isOpen);
    };
  
    const handleClick = (option) => {
      // Handle specific code for the clicked option here
      // console.log(`Clicked option: ${option.name}`);
      switch (option.name) {
        case `Load`: console.log(`Load val: ${option.name}`);
          break;
  
        case `Save Input`: console.log(`Save val ${option.name}`);
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
      <div className="dropdown">
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