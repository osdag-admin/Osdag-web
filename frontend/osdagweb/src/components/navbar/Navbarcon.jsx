import React from 'react';
import "./Navbar.css";

function Navbarcon() {
  return (
    <nav className="navbar">
      
      <ul className="navbar-links">
        <li><a href="/">Shear Connection</a></li>
        <li><a href="/about">Moment Connection</a></li>
        <li><a href="/contact">Base Plate</a></li>
        <li><a href="/contact">Truss Connection</a></li>
      </ul>
    </nav>
  )
}

export default Navbarcon;

