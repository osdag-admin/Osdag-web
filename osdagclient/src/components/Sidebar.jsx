import '../App.css'
import Osdag_logo from "../assets/logo-osdag.png"
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { GlobalContext } from '../context/GlobalState'
import { useContext } from 'react'

let initialRender = false;

function Sidebar() {

  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const { data, getInitialData } = useContext(GlobalContext)

  if (!initialRender) {
    getInitialData()
    initialRender = true;
  }

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  function handleSelectChange(event) {
    const selectedOptionValue = event.target.value;
    if (selectedOptionValue === "1") {
      window.location.href = "https://osdag.fossee.in/resources/videos";
    }
    else if (selectedOptionValue === "2") {
      window.location.href = "https://www.youtube.com/channel/UCnSZ7EjhDwNi3eCPcSKpgJg";
    }
    else if (selectedOptionValue === "3") {
      window.location.href = "file:///D:/Osdag_windows_installer_v2021.02.a.a12f/Osdag_windows_installer_v2021.02.a.a12f/Osdag/ResourceFiles/html_page/_build/html/index.html";
    }
    else if (selectedOptionValue === "4") {
      window.location.href = "https://osdag.fossee.in/forum";
    }
  }

  const navigate = useNavigate();
  return (
    <>
      <div className={`sidebar ${isSidebarVisible ? '' : 'hidden'}`}>
        <svg onClick={toggleSidebar}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="20px"
          height="20px"
          className='hamburger'
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>

        <div className="sidebar-container">

          <div className="sidebar-item-logo">
            <center> <img src={Osdag_logo} alt="Logo" height="50px" onClick={() => navigate("/")} /></center>
          </div>
          {
            data && data.data && data.data.map((item) => {
              return (
                <div key={item.id} className="sidebar-item" >
                  <button onClick={() => {
                    navigate(`design-type/${item.name.toLowerCase().replaceAll("_", "-")}`)
                  }}>{item.name.toUpperCase().replaceAll("_", " ")}</button>
                </div>
              )
            })
          }
        </div>
        <div className="sidebar-setting">
          <select onChange={handleSelectChange}>
            <option value={"1"}>Help</option>
            <option value={"2"}>Video Tutorials</option>
            <option value={"3"}>Design Examples</option>
            <option value={"4"}>Ask Us a Question</option>
            <option value={"5"}>Check for Update</option>
          </select>
        </div>
      </div>
    </>
  )
}

export default Sidebar