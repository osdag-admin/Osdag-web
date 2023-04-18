import React, { useState } from 'react';
import './NavigationBar.css';

//a navigation bar that is visible on connection/finplate and on pages of other modules where the calculation is done
const NavigationBar = () => {
  const [fileDropdown, setFileDropdown] = useState(false);
  const [editDropdown, setEditDropdown] = useState(false);
  const [graphicsDropdown, setGraphicsDropdown] = useState(false);
  const [databaseDropdown, setDatabaseDropdown] = useState(false);
  const [helpDropdown, setHelpDropdown] = useState(false);

  const handleFileClick = () => {
    setFileDropdown(!fileDropdown);
  };

  const handleEditClick = () => {
    setEditDropdown(!editDropdown);
  };

  const handleGraphicsClick = () => {
    setGraphicsDropdown(!graphicsDropdown);
  };

  const handleDatabaseClick = () => {
    setDatabaseDropdown(!databaseDropdown);
  };

  const handleHelpClick = () => {
    setHelpDropdown(!helpDropdown);
  };

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <ul className='navbar-menu'>
          <li className='navbar-item'>
            <button href="#" onClick={handleFileClick}>
              File
            </button>
            {fileDropdown && (
              <ul className='navbar-dropdown'>
                <li className='navbar-dropdown-item'>New</li>
                <li className='navbar-dropdown-item'>Open</li>
                <li className='navbar-dropdown-item'>Save</li>
              </ul>
            )}
          </li>
          <li className='navbar-item'>
            <button className='navbar-link' onClick={handleEditClick}>
              Edit
            </button>
            {editDropdown && (
              <ul className='navbar-dropdown'>
                <li className='navbar-dropdown-item'>Cut</li>
                <li className='navbar-dropdown-item'>Copy</li>
                <li className='navbar-dropdown-item'>Paste</li>
              </ul>
            )}
          </li>
          <li className='navbar-item'>
            <button className='navbar-link' onClick={handleGraphicsClick}>
              Graphics
            </button>
            {graphicsDropdown && (
              <ul className='navbar-dropdown'>
                <li className='navbar-dropdown-item'>Line</li>
                <li className='navbar-dropdown-item'>Bar</li>
                <li className='navbar-dropdown-item'>Pie</li>
              </ul>
            )}
          </li>
          <li className='navbar-item'>
            <button className='navbar-link' href="/" onClick={handleDatabaseClick}>
              Database
            </button>
            {databaseDropdown && (
              <ul className='navbar-dropdown'>
                <li className='navbar-dropdown-item'>Add Record</li>
                <li className='navbar-dropdown-item'>Delete Record</li>
                <li className='navbar-dropdown-item'>Search Record</li>
              </ul>
            )}
          </li>
          <li className='navbar-item'>
            <button className='navbar-link' onClick={handleHelpClick}>
              Help
            </button>
            {helpDropdown && (
              <ul className='navbar-dropdown'>
                <li className='navbar-dropdown-item'>Documentation</li>
                <li className='navbar-dropdown-item'>Contact Support</li>
                <li className='navbar-dropdown-item'>About</li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavigationBar;
