import React from 'react';

const MainNavBar = () => {
    return (
        <nav className="main-navbar">
            <div className="nav-brand">OSDAG</div>

            <div className="nav-menu">
                <div className="nav-item">
                    <button className="nav-button">File</button>
                    <div className="dropdown-content">
                        <a href="#load-input">Load Input</a>
                        <a href="#save-input">Save Input</a>
                        <a href="#save-log">Save Log Messages</a>
                    </div>
                </div>

                <div className="nav-item">
                    <button className="nav-button">Edit</button>
                    <div className="dropdown-content">
                        <a href="#design-preferences">Design Preferences</a>
                    </div>
                </div>

                <div className="nav-item">
                    <button className="nav-button">Graphics</button>
                    <div className="dropdown-content">
                        <a href="#zoom-in">Zoom In</a>
                        <a href="#zoom-out">Zoom Out</a>
                        <a href="#pan">Pan</a>
                        <a href="#rotate">Rotate</a>
                        <div className="dropdown-divider"></div>
                        <a href="#front-view">Front View</a>
                        <a href="#top-view">Top View</a>
                        <a href="#side-view">Side View</a>
                        <div className="dropdown-divider"></div>
                        <a href="#model">Model</a>
                        <a href="#member">Member</a>
                        <a href="#plate">Plate</a>
                        <a href="#endplate">End Plate</a>
                    </div>
                </div>

                <div className="nav-item">
                    <button className="nav-button">Database</button>
                    <div className="dropdown-content">
                        <a href="#download-column">Download Column</a>
                        <a href="#download-beam">Download Beam</a>
                        <a href="#download-angle">Download Angle</a>
                        <a href="#download-channel">Download Channel</a>
                    </div>
                </div>

                <div className="nav-item">
                    <button className="nav-button">Help</button>
                    <div className="dropdown-content">
                        <a href="#video-tutorial">Video Tutorial</a>
                        <a href="#design-examples">Design Examples</a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default MainNavBar;

