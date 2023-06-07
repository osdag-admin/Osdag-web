import '../App.css'
import Osdag_logo from "../assets/logo-osdag.png"
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

// importing thunks 
import { getModules } from '../features/thunks/ModuleThunk'

// redux imports 
import { useDispatch, useSelector } from 'react-redux'

let renderedOnce = false

function Sidebar() {

  // using useSelecter to obtain the 'data' from the moduleSlice 
  const data = useSelector((state) => state.module.data)

  const dispatch = useDispatch()

  // dispatching the getModules thunk here 
  if (renderedOnce == false) {
    // console.log('dispatching')
    dispatch(getModules({}))
    renderedOnce = true
  }

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
    <div className='sidebar'>
      <div className="sidebar-container">
        <div className="sidebar-item-logo">
          <center> <img src={Osdag_logo} alt="Logo" height="50px" onClick={() => navigate("/")} /></center>
        </div>
        {
          data && data.data && data.data.map((item, index) => {
            return (
              <>
                <div key={item.id} className="sidebar-item" >
                  <button onClick={() => {
                    navigate(`design-type/${item.name.toLowerCase().replaceAll("_", "-")}`)
                  }}>{item.name.toUpperCase().replaceAll("_", " ")}</button>
                </div>
              </>
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
  )
}

export default Sidebar