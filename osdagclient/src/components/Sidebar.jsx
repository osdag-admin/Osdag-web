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

  const isGuestOrnot = localStorage.getItem('userType')

  if (!initialRender) {
    getInitialData()
    initialRender = true;
  }

 

  function handleSelectChange(event) {
    const selectedOptionValue = event.target.value;
    if (selectedOptionValue === "1") {
      window.open("https://osdag.fossee.in/resources/videos", "_blank");
    }
    else if (selectedOptionValue === "2") {
      window.open("https://www.youtube.com/channel/UCnSZ7EjhDwNi3eCPcSKpgJg", "_blank")
    }
    else if (selectedOptionValue === "3") {
      window.open("https://static.fossee.in/html_page/", "_blank")
    }
    else if (selectedOptionValue === "4") {
      window.open("https://osdag.fossee.in/forum", "_blank")
    }
  }

  const navigate = useNavigate();
  return (
    <>
      <div className={'sidebar'}>
        
      
        <div className="sidebar-container">
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

          {isGuestOrnot === 'guest' ? (
            <div className="sidebar-item">
              <button onClick={() => {     window.location.href = '/';}}>
                Login
              </button>
            </div>
          ) : (
            <div className="sidebar-item">
              <button
                onClick={() => {
                  navigate('/user');
                }}
              >
                My Account
              </button>
            </div>
          )}
        </div>
        <div className="sidebar-setting">
          <select onChange={handleSelectChange}>
            <option value={"1"}>Help</option>
            <option value={"2"}>Video Tutorials</option>
            <option value={"3"}>Design Examples</option>
            <option value={"4"}>Ask Us a Question</option>
          </select>
        </div>
      </div>
    </>
  )
}

export default Sidebar