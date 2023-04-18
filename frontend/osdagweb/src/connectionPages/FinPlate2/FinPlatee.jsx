import React, { useState } from "react";
import "./FinPlatee.css";
import NavigationBar from "../../components/NavigationBar/NavigationBar";

function FinPlatee() {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [input4, setInput4] = useState("");
  const [input5, setInput5] = useState("");
  const [input6, setInput6] = useState("");
  const [input7, setInput7] = useState("");
  const [input8, setInput8] = useState("");
  const [input9, setInput9] = useState("");
  // eslint-disable-next-line
  const [output, setOutput] = useState("");

  const handleInput1Change = (e) => {
    setInput1(e.target.value);
  };

  const handleInput2Change = (e) => {
    setInput2(e.target.value);
  };

  const handleInput3Change = (e) => {
    setInput3(e.target.value);
  };

  const handleInput4Change = (e) => {
    setInput4(e.target.value);
  };

  const handleInput5Change = (e) => {
    setInput5(e.target.value);
  };

  const handleInput6Change = (e) => {
    setInput6(e.target.value);
  };

  const handleInput7Change = (e) => {
    setInput7(e.target.value);
  };

  const handleInput8Change = (e) => {
    setInput8(e.target.value);
  };

  const handleInput9Change = (e) => {
    setInput9(e.target.value);
  };

 
  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform calculations or other operations based on input values
    // Set the output value using setOutput()
  };

  const handleDesignButton= () => {
    // Retrieve the input values
    const input1 = document.getElementById('input1').value;
    const input2 = document.getElementById('input2').value;
    const input3 = document.getElementById('input3').value;
    const input4 = document.getElementById('input4').value;
    const input5 = document.getElementById('input5').value;
    const input6 = document.getElementById('input6').value;
    const input7 = document.getElementById('input7').value;
    const input8 = document.getElementById('input8').value;
    const input9 = document.getElementById('input9').value;

    // Send a POST request to the API endpoint
    fetch('/', {
      method: 'POST',
      body: new URLSearchParams({
        'input1': input1,
        'input2': input2,
        'input3': input3,
        'input4': input4,
        'input5': input5,
        'input6': input6,
        'input7': input7,
        'input8': input8,
        'input9': input9
      })
    })
    .then(response => response.json())
    .then(data => setOutput(data));
  }

  return (
    <div>
      <NavigationBar />
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* First Section */}
      <div style={{ flex: 1, padding: 20, marginLeft: 20 }}>
        <h5>Connecting Members</h5>

        
        

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

        <div className="input-box">
          <label htmlFor="input3">Input 3:</label>
          <input
            type="text"
            id="input3"
            value={input3}
            className="textbox"
            onChange={handleInput3Change}
          />
        </div>

        <h5>Factored Loads</h5>

        <div className="input-box">
          <label htmlFor="input4">Input 4:</label>
          <input
            type="text"
            id="input4"
            value={input4}
            className="textbox"
            onChange={handleInput4Change}
          />
        </div>
        <div className="input-box">
          <label htmlFor="input2">Input 5:</label>
          <input
            type="text"
            id="input5"
            value={input5}
            className="textbox"
            onChange={handleInput5Change}
          />
        </div>

        <h5>Bolts</h5>

        <div className="input-box">
          <label htmlFor="input2">Input 6:</label>
          <input
            type="text"
            id="input6"
            value={input6}
            className="textbox"
            onChange={handleInput6Change}
          />
        </div>

        <div className="input-box">
          <label htmlFor="input2">Input 7:</label>
          <input
            type="text"
            id="input7"
            value={input7}
            className="textbox"
            onChange={handleInput7Change}
          />
        </div>

        <div className="input-box">
          <label htmlFor="input2">Input 8:</label>
          <input
            type="text"
            id="input8"
            value={input8}
            className="textbox"
            onChange={handleInput8Change}
          />
        </div>

        <h5>Plate</h5>

        <div className="input-box">
          <label htmlFor="input2">Input 9:</label>
          <input
            type="text"
            id="input9"
            value={input9}
            className="textbox"
            onChange={handleInput9Change}
          />
        </div>

        <button className="input-buttons" onClick={handleSubmit}>
          Reset
        </button>
        <button className="input-buttons" onClick={handleDesignButton}>
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

export default FinPlatee;