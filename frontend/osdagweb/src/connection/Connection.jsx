import React from 'react';
import "./Connection.css";
import Sidebar from "../components/sidebar/Sidebar";
import Navbarcon from "../components/navbar/Navbarcon";
import { Link } from 'react-router-dom';


//the connection page
function Connection() {
  return (
    <div className="modules">
    <Sidebar />

    <div className="content-container">
    <Navbarcon />
    
    <div className="module_options_container">
        <div className="module_option">
          <h1>Fin Plate</h1>
          <div className="module_option_formatting">
            <input
              type="radio"
              name="module_select"
              id="fin_plate_connection"
              required
            />
            <img src="./fin_plate_connection.png" alt="" />
          </div>
        </div>

        <div className="module_option">
          <h1>Cleat Angle</h1>
          <div className="module_option_formatting">
            <input
              type="radio"
              name="module_select"
              id="fin_plate_connection"
              required
            />
            <img src="./cleatAngle.png" alt="" />
          </div>
        </div>

        <div className="module_option">
          <h1>End Plate</h1>
          <div className="module_option_formatting">
            <input
              type="radio"
              name="module_select"
              id="fin_plate_connection"
              required
            />
            <img src="./endplate.png" alt="" />
          </div>
        </div>

        <div className="module_option">
          <h1>Seated Angle</h1>
          <div className="module_option_formatting">
            <input
              type="radio"
              name="module_select"
              id="fin_plate_connection"
              required
            />
            <img src="./seatedAngle.png" alt="" />
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