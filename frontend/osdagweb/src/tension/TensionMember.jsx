import React from 'react';
import "./TensionMember.css";
import Sidebar from "../components/sidebar/Sidebar";
import { Link } from 'react-router-dom';

//the tension member page with cards for Bolted to End Gusset and Welded To End Gusset
function TensionMember() {
  return (

    //main sidebar and navbar for navigating to other connection subpage
    <div className="modules">
      <Sidebar />
      <div className="center">
        <div className="module_option">
          <h1>Bolted to End Gusset</h1>
          <div className="module_option_formatting">
            <input
              type="radio"
              name="module_select"
              id="fin_plate_connection"
              required
            />
            <img src="./bolted_ten.png" alt="" />

            <Link to="/bolted-ten"> {/* Add the route for the desired page */}
                <button className="design-button"> Start</button>
              </Link>
          </div>
        </div>
        <div className="module_option">
          <h1>Welded to End Gusset</h1>
          <div className="module_option_formatting">
            <input
              type="radio"
              name="module_select"
              id="fin_plate_connection"
              required
            />
            <img src="./welded_ten.png" alt="" />

            <Link to="/bolted-ten"> {/* Add the route for the desired page */}
                <button className="design-button">Start</button>
              </Link>
              
          </div>
        </div>
      </div>
    </div>
  );
}

export default TensionMember;
