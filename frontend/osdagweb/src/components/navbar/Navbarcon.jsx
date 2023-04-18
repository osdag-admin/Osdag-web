import React from 'react';
import "./Navbar.css";

//A navigation bar that is visible on the /connection page
function Navbarcon() {
  return (
    <nav className="navbar">
      
      <ul className="navbar-links">
        <li><a href="/connection">Shear Connection</a></li>
        <li><a href="/momentconnection">Moment Connection</a></li>
        <li><a href="/baseplate">Base Plate</a></li>
        <li><a href="/trussconnection">Truss Connection</a></li>
      </ul>
    </nav>
  )
}

export default Navbarcon;

