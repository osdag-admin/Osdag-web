import React from 'react'
import "./sidebar.css"
import { useNavigate } from 'react-router-dom';

function Sidebar() {

  const navigate = useNavigate();

  function handleClick(route) {
    navigate(route);
  }

    return (
    <nav>
    <button className="conbutton" onClick={() => handleClick('/connection')}>Connection</button>

  <button className="navbutton" onClick={() => handleClick('/tension')}>Tension Member</button>
  <button className="navbutton" onClick={() => handleClick('/underdev')}>Compression Member</button>
  <button className="navbutton" onClick={() => handleClick('/underdev')}>Flexural Member</button>
  <button className="navbutton" onClick={() => handleClick('/underdev')}>Beam-Column</button>
  <button className="navbutton" onClick={() => handleClick('/underdev')}>Plate Girder</button>
  <button className="navbutton" onClick={() => handleClick('/underdev')}>Truss</button>
  <button className="navbutton" onClick={() => handleClick('/underdev')}>2D Frame</button>
  <button className="navbutton" onClick={() => handleClick('/underdev')}>3D Frame</button>
  <button className="navbutton" onClick={() => handleClick('/underdev')}>Group Design</button>
    </nav>
  )
}

export default Sidebar;