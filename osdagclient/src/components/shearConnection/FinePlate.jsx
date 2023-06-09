
import '../../App.css'
import img1 from '../../assets/ShearConnection/sc_fin_plate.png'
import { useEffect, useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import {Select,Input} from 'antd'
import {Select,Input , Button, Modal, Checkbox } from 'antd';

import CFBW from '../../assets/ShearConnection/sc_fin_plate/fin_cf_bw.png'
import CWBW from '../../assets/ShearConnection/sc_fin_plate/fin_cw_bw.png'
import BB from '../../assets/ShearConnection/sc_fin_plate/fin_beam_beam.png'
import ErrorImg from '../../assets/notSelected.png'

const { Option } = Select;

function FinePlate() {

  const [selectedOption, setSelectedOption] = useState();
  const [connectivity, setConnectivity] = useState();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSelectChangeBoltBeam = (value) => {
    if (value === 'Customized') {
      setModalOpen(true);
    } else {
      setModalOpen(false);
    }
  };

  const handleCheckboxChange = (label) => (event) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, label]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== label));
    }
  };

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      const allLabels = checkboxLabels;
      setSelectedItems(allLabels);
    } else {
      setSelectedItems([]);
    }
  };

  const checkboxLabels = ['Label 1', 'Label 2', 'Label 3']; // Placeholder array

  useEffect(() => {
    const fetchData = async () => {
      try {
    const response = await fetch(`http://127.0.0.1:8000/populate?moduleName=Fin-Plate-Connection&connectivity=${selectedOption}`);
        const jsonData = await response.json();
        setConnectivity(jsonData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedOption]);
  console.log("Data"+JSON.stringify(connectivity, null, 2));
  
  const handleSelectChange = (value) => {
    setSelectedOption(value);
  };

  let imageSource = '';
  if (selectedOption === 'Column-Flange-Beam-Web') {
    imageSource = CFBW;
  } else if (selectedOption === 'Column-Web-Beam-Web') {
    imageSource = CWBW;
  } else if (selectedOption === 'Beam-Beam') {
    imageSource = BB;
  }else if (selectedOption === '') {
    imageSource = ErrorImg;
  }

  const logData = [
    {
      "logID": 401,
      "log": "This is log entry 1."
    },
    {
      "logID": 202,
      "log": "This is log entry 2."
    },
    {
      "logID": 301,
      "log": "This is log entry 3."
    },
    {
      "logID": 404,
      "log": "This is log entry 4."
    },
    {
      "logID": 504,
      "log": "This is log entry 5."
    }
  ];
 

  const Connectivity = [
    {
      "connID": "Column-Flange-Beam-Web",
      "Data": "Column-Flange-Beam-Web"
    },
    {
      "connID": "Column-Web-Beam-Web",
      "Data": "Column-Web-Beam-Web"
    },
    {
      "connID": "Beam-Beam",
      "Data": "Beam-Beam"
    }
  ];

  const MenuItems = [
    {
      label: "File",
    },
    {
      label: "Edit",
    },
    {
      label: "Graphics",
    },
    {
      label: "Database",
    },
    {
      label: "Help",
    },
  ];

  const data = {
    "mainTitle": "Output Dock",
    "sections": [
      {
        "title": "Bolt",
        "components": [
          { "label": "Diameter (mm)", "inputType": "text" },
          { "label": "Property Class", "inputType": "text" },
          { "label": "Shear Capacity (kN)", "inputType": "text" },
          { "label": "Capacity (kN)", "inputType": "text" },
          { "label": "Bolt Force (kN)", "inputType": "text" },
          { "label": "Bolt Columns (nos)", "inputType": "text" },
          { "label": "Bolt Rows (nos)", "inputType": "text" },
          { "label": "Spacing", "inputType": "button" }
        ]
      },
      {
        "title": "Plate",
        "components": [
          { "label": "Thickness (mm)", "inputType": "text" },
          { "label": "Height (mm)", "inputType": "text" },
          { "label": "Length (mm)", "inputType": "text" },
          { "label": "Capacity", "inputType": "button" }
        ]
      },
      {
        "title": "Section Details",
        "components": [
          { "label": "Capacity", "inputType": "button" }
        ]
      },
      {
        "title": "Weld",
        "components": [
          { "label": "Size (mm)", "inputType": "text" },
          { "label": "Strength (N/mm2)", "inputType": "text" },
          { "label": "Stress (N/mm)", "inputType": "text" }
        ]
      }
    ]
  };

  
  return (

    <>
    <div>
      <div className='module_nav'>

      {MenuItems.map((item, index) => (
        <div key={index}>{item.label}</div>
      ))}
      </div>
    
    {/* Main Body of code  */}
    <div className='superMainBody'>
      {/* Left */}
      <div>
        <h5>Input Dock</h5>
      <div className='subMainBody scroll-data'> 
      {/* Section 1 Start */}
          <h3>Connecting Members</h3>       
          <div className='component-grid'>
            <div><h4>Connectivity</h4></div>
            
            <div><Select style={ {width:'100%'}} 
                  onChange={handleSelectChange}
                  value={selectedOption}
                  >   
                  {Connectivity.map((item) => (
                  <Option key={item.connID} value={item.connID}>{item.Data}</Option>   
                  ))}   
                </Select>
            </div>
            
            <div>{/*Blank*/}</div>
            
            <div>
          <img src={imageSource} alt="Component" height='100px' width='100px' />
            </div>
            
            {selectedOption === 'Beam-Beam' ? (
        <>
          <div>
            <h4>Primary Beam:</h4>
          </div>
          <div>
            <Select style={{ width: '100%' }}>
              {connectivity && connectivity.beamList ? (
                connectivity.beamList.map((column, index) => (
                  <Option key={index} value={column}>
                    {column}
                  </Option>
                ))
              ) : (
                <Option value="">No data available</Option>
              )}
            </Select>
          </div>

          <div>
            <h4>Secondary Beam:</h4>
          </div>
          <div>
            <Select style={{ width: '100%' }}>
              {connectivity && connectivity.beamList ? (
                connectivity.beamList.map((column, index) => (
                  <Option key={index} value={column}>
                    {column}
                  </Option>
                ))
              ) : (
                <Option value="">No data available</Option>
              )}
            </Select>
          </div>
        </>
      ) : (
        <>
          <div>
            <h4>Column Section:</h4>
          </div>
          <div>
            <Select style={{ width: '100%' }}>
              {connectivity && connectivity.columnList ? (
                connectivity.columnList.map((column, index) => (
                  <Option key={index} value={column}>
                    {column}
                  </Option>
                ))
              ) : (
                <></>
              )}
            </Select>
          </div>

          <div>
        <h4>Beam Section:</h4>
      </div>
      <div>
            <Select style={{ width: '100%' }}>
              {connectivity && connectivity.beamList ? (
                connectivity.beamList.map((column, index) => (
                  <Option key={index} value={column}>
                    {column}
                  </Option>
                ))
              ) : (
                <Option value="">No data available</Option>
              )}
            </Select>
          </div>
        </>
      )}
            <div><h4>Material:</h4></div>
            <div><Select style={ {width:'100%'}}>
                      {connectivity ? connectivity.materialList.map((column, index) => (
                  <Option key={index} value={column}>{column}</Option>   
                  )): null}
                </Select>
            </div>
          </div>
          {/* Section End */}
          {/* Section Start  */}
          <h3>Factored Loads</h3>
          <div className='component-grid    '> 
              <div><h4>Shear Force(kN) :</h4></div>
              <div><Input type="text" name="ShearForce" onInput={()=>{event.target.value = event.target.value.replace(/[^0-9.]/g, '')}} pattern="\d*"/></div>
              <div><h4>Axial Force(kN) :</h4></div>
              <div><Input type="text" name="AxialForce" onInput={()=>{event.target.value = event.target.value.replace(/[^0-9.]/g, '')}}  pattern="\d*"/></div>
          </div>
          {/* Section End */}
          {/* Section Start */}
          <h3>Bolt</h3>
          <div className='component-grid    '> 
          <div>
        <h4>Beam Section:</h4>
      </div>
      <div>
        <Select style={{ width: '100%' }} onChange={handleSelectChangeBoltBeam}>
          <Option value="Customized">Customized</Option>
          <Option value="All">All</Option>
        </Select>
      </div>
      <Modal
        visible={isModalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Checkbox onChange={handleSelectAllChange}>Select All</Checkbox>
        {checkboxLabels.map((index,label) => (
          <Checkbox
            key={label}
            checked={selectedItems.includes(label)}
            onChange={handleCheckboxChange(label)}
          >
            {label}
          </Checkbox>
        ))}
      </Modal>
            
            <div><h4>Type:</h4></div>
            <div><Select style={ {width:'100%'}}>
                  <Option value="Bearing_Bolt">Bearing Bolt</Option>
                  <Option value="Fraction_Grip_Bolt">Fraction Grip Bolt</Option>   
                 </Select>
            </div>
            <div><h4>Property Class:</h4></div>
            <div><Select style={ {width:'100%'}}>
                  <Option value="Customized">Customized</Option>
                  <Option value="All">All</Option>   
                 </Select>
            </div>
          </div>
          {/* Section End */}
          <h3>Plate</h3>
          <div className='component-grid    '> 
          <div><h4>Thickness(mm)</h4></div>
            <div><Select style={ {width:'100%'}}>
                  <Option value="Customized">Customized</Option>
                  <Option value="All">All</Option>   
                 </Select>
            </div>
            </div>
          
      </div>
  <div className='inputdock-btn'>
            <Input type="button" value="Reset" />
            <Input type="button" value="Design" />
          </div>
</div>              
      {/* Middle */}
      <div className='superMainBody_mid'>
        <img src={img1} alt="Demo" height='300px' width='300px' /> 
        <br/>
        <div>
        <ul>
            <select name="Cars" size="5" >  
                  {logData.map((item) => (
                    <option key={item.logID} value={item.logID}> LOG ID : {item.logID}{" :  _"}
                      LOG_Name: {item.log}  </option>   
                  ))}
            </select>
        </ul>
        </div>
      </div>

      {/* Right */}
      <div>
      <h5>{data.mainTitle}</h5>
      <div className='subMainBody scroll-data'>
        {data.sections.map((section) => (
          <div key={section.title}>
            <h3>{section.title}</h3>
            <div className='component-grid'>
              {section.components.map((component) => (
              <>
                <div key={component.label}>
                  <h4>{component.label}</h4> </div>
                  <div>
                  {component.inputType === "button" ? (
                    <Input
                      type={component.inputType}
                      name={`${section.title.replace(/[^a-zA-Z0-9]/g, "_")}_${component.label.replace(/[^a-zA-Z0-9]/g, "_")}`}
                      value={component.label}
                      disabled
                    />
                  ) : (
                    <Input
                      type={component.inputType}
                      name={`${section.title.replace(/[^a-zA-Z0-9]/g, "_")}_${component.label.replace(/[^a-zA-Z0-9]/g, "_")}`}
                      disabled
                    />
                  )}
                </div>
              </>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className='outputdock-btn'>
            <Input type="button" value="Create Design Report" />
            <Input type="button" value="Save Output" />
          </div>
    </div>
    </div>

    {/* <ToastContainer /> */}
    </div>
    </>
  )
}

export default FinePlate

// Old Code 
// <div>
// <h5>Output Dock</h5>
// <div className='subMainBody scroll-data'> 
// {/* Section 1 Start */}
//   <h3>Bolt</h3>       
//   <div className='component-grid'> 
//       <div><h4>Diameter (mm)</h4></div>
//       <div><Input type="text" name="bolt_Diameter"/></div>
//       <div><h4>Property Class</h4></div>
//       <div><Input type="text" name="bolt_Property_Class"/></div>
//       <div><h4>Shear Capacity (kN)</h4></div>
//       <div><Input type="text" name="bolt_Shear_Capacity"/></div>
//       <div><h4>Capacity (kN)</h4></div>
//       <div><Input type="text" name="bolt_Capacity"/></div>
//       <div><h4>Bolt Force (kN)</h4></div>
//       <div><Input type="text" name="bolt_Bolt_Force"/></div>
//       <div><h4>Bolt Columns (nos)</h4></div>
//       <div><Input type="text" name="boly_Bolt_Columns"/></div>
//       <div><h4>Bolt Rows (nos)</h4></div>
//       <div><Input type="text" name="bolt_Bolt_Rows"/></div>
//       <div><h4>Spacing</h4></div>
//       <div><Input type="button" name="bolt_Spacing"  value="Spacing Details"/></div>
//   </div>
//   {/* Section End */}
//   {/* Section 2 Start */}
//   <h3>Plate</h3>       
//   <div className='component-grid    '> 
//       <div><h4>Thickness (mm)</h4></div>
//       <div><Input type="text" name="plate_Thickness"/></div>
//       <div><h4>Hight (mm)</h4></div>
//       <div><Input type="text" name="plate_Hight"/></div>
//       <div><h4>Length (mm)</h4></div>
//       <div><Input type="text" name="plate_Length"/></div>
//       <div><h4>Capacity</h4></div>
//       <div><Input type="button" name="plate_Capacity" value="Spacing Details"/></div>
//   </div>
//   {/* Section End */}
//   {/* Section 3 Start */}
//   <h3>Section Details</h3>       
//   <div className='component-grid    '> 
//       <div><h4>Capacity</h4></div>
//       <div><Input type="button" name="plate_Capacity" value="Spacing Details"/></div>
//   </div>
//   {/* Section End */}
//   {/* Section 4 Start */}
//   <h3>Weld</h3>       
//   <div className='component-grid    '> 
//       <div><h4>Size (mm)</h4></div>
//       <div><Input type="text" name="fileName"/></div>
//       <div><h4>Strength (N/mm2)</h4></div>
//       <div><Input type="text" name="fileName"/></div>
//       <div><h4>Stress (N/mm)</h4></div>
//       <div><Input type="text" name="fileName"/></div>
//   </div>
//   {/* Section End */}
// </div>
//   <div className='outputdock-btn'>
//     <Input type="button" value="Create Design Report" />
//     <Input type="button" value="Save Output" />
//   </div>
// </div>
