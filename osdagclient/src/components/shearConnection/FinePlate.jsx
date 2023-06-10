
import '../../App.css'
import img1 from '../../assets/ShearConnection/sc_fin_plate.png'
import { useEffect, useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import {Select,Input} from 'antd'
import { Select, Input, Modal, Checkbox } from 'antd';

import CFBW from '../../assets/ShearConnection/sc_fin_plate/fin_cf_bw.png'
import CWBW from '../../assets/ShearConnection/sc_fin_plate/fin_cw_bw.png'
import BB from '../../assets/ShearConnection/sc_fin_plate/fin_beam_beam.png'
import ErrorImg from '../../assets/notSelected.png'

const { Option } = Select;

function FinePlate() {

  const [selectedOption, setSelectedOption] = useState("Column-Flange-Beam-Web");
  const [imageSource, setImageSource] = useState("")
  const [connectivity, setConnectivity] = useState();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [checkboxLabels, setCheckboxLabels] = useState([]);

  const [selectItemspropertyClassList, setSelectItemspropertyClassList] = useState([]);
  const [isModalpropertyClassListOpen, setModalpropertyClassListOpen] = useState(false);
  const [checkboxLabelspropertyClassList, setCheckboxLabelspropertyClassList] = useState([]);

  const handleSelectChangePropertyClass = (value) => {
    if (value === 'Customized') {
      setModalpropertyClassListOpen(true);
    } else {
      setModalpropertyClassListOpen(false);
    }
  };

  const handleCheckboxChangePropertyClass = (label) => (event) => {
    if (event.target.checked) {
      setSelectItemspropertyClassList([...selectItemspropertyClassList, label]);
    } else {
      setSelectItemspropertyClassList(selectItemspropertyClassList.filter((item) => item !== label));
    }
  };

  const handleSelectAllChangePropertyClass = (event) => {
    if (event.target.checked) {
      const allLabels = checkboxLabelspropertyClassList;
      setSelectItemspropertyClassList(allLabels);
    } else {
      setSelectItemspropertyClassList([]);
    }
  };

  useEffect(() => {

    const fetchBoltData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/populate?moduleName=Fin-Plate-Connection&boltDiameter=Customized');
        const data = await response.json();
        setCheckboxLabels(data.boltList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchBoltData();

    const fetchClassListData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/populate?moduleName=Fin-Plate-Connection&propertyClass=Customized');
        const data = await response.json();
        setCheckboxLabelspropertyClassList(data.propertyClassList.map(String));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchClassListData();
  }, []);


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

  useEffect(() => {

    if (!selectedOption) return;

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

    if (selectedOption === 'Column-Flange-Beam-Web') {
      setImageSource(CFBW)
    } else if (selectedOption === 'Column-Web-Beam-Web') {
      setImageSource(CWBW);
    } else if (selectedOption === 'Beam-Beam') {
      setImageSource(BB);
    } else if (selectedOption === '') {
      setImageSource(ErrorImg);
    }

  }, [selectedOption]);

  const handleSelectChange = (value) => {
    setSelectedOption(value);
  };

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

                <div><Select style={{ width: '100%' }}
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
                          <></>
                        )}
                      </Select>
                    </div>
                  </>
                )}
                <div><h4>Material:</h4></div>
                <div><Select style={{ width: '100%' }}>
                  {connectivity ? connectivity.materialList.map((column, index) => (
                    <Option key={index} value={column}>{column}</Option>
                  )) : null}
                </Select>
                </div>
              </div>
              {/* Section End */}
              {/* Section Start  */}
              <h3>Factored Loads</h3>
              <div className='component-grid    '>
                <div><h4>Shear Force(kN) :</h4></div>
                <div><Input type="text" name="ShearForce" onInput={(event) => { event.target.value = event.target.value.replace(/[^0-9.]/g, '') }} pattern="\d*" /></div>
                <div><h4>Axial Force(kN) :</h4></div>
                <div><Input type="text" name="AxialForce" onInput={(event) => { event.target.value = event.target.value.replace(/[^0-9.]/g, '') }} pattern="\d*" /></div>
              </div>
              {/* Section End */}
              {/* Section Start */}
              <h3>Bolt</h3>
              <div className='component-grid    '>
                <div>
                  <h4>Diameter(mm):</h4>
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
                  <div style={{ height: '200px', overflowY: 'scroll' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {checkboxLabels.map((label) => (
                        <Checkbox
                          key={label}
                          checked={selectedItems.includes(label)}
                          onChange={handleCheckboxChange(label)}
                        >
                          {label}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                </Modal>
                <div><h4>Type:</h4></div>
                <div><Select style={{ width: '100%' }}>
                  <Option value="Bearing_Bolt">Bearing Bolt</Option>
                  <Option value="Fraction_Grip_Bolt">Fraction Grip Bolt</Option>
                </Select>
                </div>
                <div><h4>Property Class:</h4></div>
                <div>
                  <Select style={{ width: '100%' }} onChange={handleSelectChangePropertyClass}>
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>
                <Modal
                  visible={isModalpropertyClassListOpen}
                  onCancel={() => setModalpropertyClassListOpen(false)}
                  footer={null}
                >
                  <Checkbox onChange={handleSelectAllChangePropertyClass}>Select All</Checkbox>
                  <div style={{ height: '200px', overflowY: 'scroll', display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      {checkboxLabelspropertyClassList.map((label) => (
                        <Checkbox
                          key={label}
                          checked={selectItemspropertyClassList.includes(label)}
                          onChange={handleCheckboxChangePropertyClass(label)}
                        >
                          {label}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                </Modal>
              </div>
              {/* Section End */}
              <h3>Plate</h3>
              <div className='component-grid    '>
                <div><h4>Thickness(mm)</h4></div>
                <div><Select style={{ width: '100%' }}>
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
            <br />
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
                    {section.components.map((component, index) => (
                      <div key={index}>
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
                      </div>
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

      </div>
    </>
  )
}

export default FinePlate