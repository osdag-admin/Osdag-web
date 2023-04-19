import React from 'react';
import "./BasePlate.css";
import Sidebar from "../components/sidebar/Sidebar";
import Navbarcon from "../components/navbar/Navbarcon";
import { Link } from 'react-router-dom';


//the base plate page containing the card for Base Plate
function Connection() {
  return (

    //main sidebar and navbar for navigating to other connection subpages
    <div className="modules">
    <Sidebar />

    <div className="content-container">
    <Navbarcon />
    
    <div className="module_options_container">
        <div className="module_option">
          <h1>Base Plate</h1>
          <div className="module_option_formatting">
            <input
              type="radio"
              name="module_select"
              id="fin_plate_connection"
              required
            />
            <img src="./BasePlate.jpeg" alt="" />
          </div>
        </div>

        
        </div>

        <Link to="/finplate"> {/* Add the route for the desired page */}
                <button className="start-button">Start</button>
        </Link>
        </div>
     
    </div>
  );
}

export default Connection;