import React, { useState } from 'react';
import './NavigationBar.css';

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
            <a className='navbar-link' href="/" onClick={handleFileClick}>
              File
            </a>
            {fileDropdown && (
              <ul className='navbar-dropdown'>
                <li className='navbar-dropdown-item'>New</li>
                <li className='navbar-dropdown-item'>Open</li>
                <li className='navbar-dropdown-item'>Save</li>
              </ul>
            )}
          </li>
          <li className='navbar-item'>
            <a className='navbar-link' href="/" onClick={handleEditClick}>
              Edit
            </a>
            {editDropdown && (
              <ul className='navbar-dropdown'>
                <li className='navbar-dropdown-item'>Cut</li>
                <li className='navbar-dropdown-item'>Copy</li>
                <li className='navbar-dropdown-item'>Paste</li>
              </ul>
            )}
          </li>
          <li className='navbar-item'>
            <a className='navbar-link' href="/" onClick={handleGraphicsClick}>
              Graphics
            </a>
            {graphicsDropdown && (
              <ul className='navbar-dropdown'>
                <li className='navbar-dropdown-item'>Line</li>
                <li className='navbar-dropdown-item'>Bar</li>
                <li className='navbar-dropdown-item'>Pie</li>
              </ul>
            )}
          </li>
          <li className='navbar-item'>
            <a className='navbar-link' href="/" onClick={handleDatabaseClick}>
              Database
            </a>
            {databaseDropdown && (
              <ul className='navbar-dropdown'>
                <li className='navbar-dropdown-item'>Add Record</li>
                <li className='navbar-dropdown-item'>Delete Record</li>
                <li className='navbar-dropdown-item'>Search Record</li>
              </ul>
            )}
          </li>
          <li className='navbar-item'>
            <a className='navbar-link' href="/" onClick={handleHelpClick}>
              Help
            </a>
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
