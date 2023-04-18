import React from 'react'
import "./homepage.css"
import Sidebar from "../components/sidebar/Sidebar"


//the home page
function Homepage() {
  return (
    
    <div className="mainDiv">
    <Sidebar />
      <div className="content">
        <img src="./osdag_header.png" alt="hi" className="osdagHeader" />
        <div className="bottom_row"> 
            <img src="./iitb_logo.png" alt="" className="iitbLogo" />
            <img src="./fossee_logo.png" alt="" className="fossee_logo" />
        </div>
        </div>
    </div>
    
  )
}

export default Homepage;
