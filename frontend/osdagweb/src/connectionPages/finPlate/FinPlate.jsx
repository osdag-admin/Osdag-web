import React, { useState } from "react";
import "./Finplate.css";
import NavigationBar from "../../components/NavigationBar/NavigationBar";

function FinPlate() {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  // eslint-disable-next-line
  const [output, setOutput] = useState("");

  const handleInput1Change = (e) => {
    setInput1(e.target.value);
  };

  const handleInput2Change = (e) => {
    setInput2(e.target.value);
  };

 
  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform calculations or other operations based on input values
    // Set the output value using setOutput()
  };

  return (
    <div>
      <NavigationBar />
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* First Section */}
      <div style={{ flex: 1, padding: 20, marginLeft: 20 }}>
        <h5>Connecting Members</h5>

        <div className="dropdowns">
          <label htmlFor="dropdown1">Connectivity: </label>
          <select id="dropdown1">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        <div className="dropdowns">
          <label htmlFor="dropdown1">Primary Beam: </label>
          <select id="dropdown1">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        <div className="dropdowns">
          <label htmlFor="dropdown1">Secondary Beam: </label>
          <select id="dropdown1">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        <div className="dropdowns">
          <label htmlFor="dropdown1">Material: </label>
          <select id="dropdown1">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        <h5>Factored Loads</h5>

        <div className="input-box">
          <label htmlFor="input1">Input 1:</label>
          <input
            type="text"
            id="input1"
            value={input1}
            className="textbox"
            onChange={handleInput1Change}
          />
        </div>
        <div className="input-box">
          <label htmlFor="input2">Input 2:</label>
          <input
            type="text"
            id="input2"
            value={input2}
            className="textbox"
            onChange={handleInput2Change}
          />
        </div>

        <h5>Bolts</h5>

        <div className="dropdowns">
          <label htmlFor="dropdown1">Diameter </label>
          <select id="dropdown1">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        <div className="dropdowns">
          <label htmlFor="dropdown1">Type </label>
          <select id="dropdown1">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        <div className="dropdowns">
          <label htmlFor="dropdown1">Property Class </label>
          <select id="dropdown1">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        <h5>Plate</h5>

        <div className="dropdowns">
          <label htmlFor="dropdown1">Thickness</label>
          <select id="dropdown1">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        <button className="input-buttons" onClick={handleSubmit}>
          Reset
        </button>
        <button className="input-buttons" onClick={handleSubmit}>
          Design
        </button>
      </div>

      {/* Second Section */}
      <div style={{ flex: 1, padding: 10 }}>
        <h2>Graphics</h2>
        <div className="graphic-box"
          style={{
            width: 550,
            height: 400,
            backgroundColor: "gray",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {/* Render graphics here */}
        </div>
      </div>

      {/* Third Section */}
      <div style={{ flex: 1, padding: 20, marginLeft: 100 }}>
        <h5>Bolt</h5>
        <div className="output-box">
          <label htmlFor="output1">Diameter</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output2">Property Class</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output3">Shear Capacity</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output4">Bearing Capacity</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output5">Capacity</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output1">Bolt Force</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output2">Bolt Columns</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output3">Bolt Rows</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output4">Spacing</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>

        <h5>Plate</h5>
        <div className="output-box">
          <label htmlFor="output2">Thickness</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output3">Height</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output4">Length</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output4">Capacity</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>

        <h5>Section Details</h5>
        <div className="output-box">
          <label htmlFor="output4">Capacity</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>

        <h5>Weld</h5>
        <div className="output-box">
          <label htmlFor="output3">Size</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output4">Strength</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>
        <div className="output-box">
          <label htmlFor="output4">Stress</label>
          <input type="text" id="output2" value={output} readOnly />
        </div>

        <button className="input-buttons" onClick={handleSubmit}>
          Create Design Report
        </button>
        <button className="input-buttons" onClick={handleSubmit}>
          Save Output
        </button>


        



      </div>
    </div>
    </div>
  );
}

export default FinPlate;