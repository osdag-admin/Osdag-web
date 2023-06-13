
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
import OutputDock from '../OutputDock';

const { Option } = Select;

function FinePlate() {

  const [selectedOption, setSelectedOption] = useState("Column-Flange-Beam-Web");
  const [imageSource, setImageSource] = useState("")
  const [connectivity, setConnectivity] = useState();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [checkboxLabels, setCheckboxLabels] = useState([]);
  const [output, setOutput] = useState(null)
  const [outputFields, setOutputFields] = useState(null)

  const [inputs, setInputs] = useState({
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "",
    connector_material: "",
    load_shear: "",
    load_axial: "",
    module: "Fin Plate Connection",
    plate_thickness: [],
    beam_section: "",
    column_section: "",
    primary_beam: "",
    secondary_beam: "",
  })

  const [selectItemspropertyClassList, setSelectItemspropertyClassList] = useState([]);
  const [isModalpropertyClassListOpen, setModalpropertyClassListOpen] = useState(false);
  const [checkboxLabelspropertyClassList, setCheckboxLabelspropertyClassList] = useState([]);
  const [thicknessLabels, setThicknessLabels] = useState([])
  const [plateThicknessModal, setPlateThicknessModal] = useState(false)
  const [selectedThickness, setSelectedThickness] = useState([])
  const [allSelected, setAllSelected] = useState({
    plate_thickness: false,
    bolt_diameter: false,
    bolt_grade: false,
  })

  const handleSelectChangePropertyClass = (value) => {
    if (value === 'Customized') {
      setAllSelected({ ...allSelected, bolt_grade: false })
      setModalpropertyClassListOpen(true);
    } else {
      setAllSelected({ ...allSelected, bolt_grade: true })
      setModalpropertyClassListOpen(false);
    }
  };

  const handlePlateThicknessChange = (label) => (e) => {
    if (e.target.checked) {
      setInputs({ ...inputs, plate_thickness: [...inputs.plate_thickness, label] })
      setSelectedThickness([...selectedThickness, label])
    } else {
      setInputs({ ...inputs, plate_thickness: inputs.plate_thickness.filter((item) => item !== label) })
      setSelectedThickness(selectedThickness.filter((item) => item !== label))
    }
  }

  const handleCheckboxChangePropertyClass = (label) => (event) => {
    if (event.target.checked) {
      setInputs({ ...inputs, bolt_grade: [...inputs.bolt_grade, label] })
      setSelectItemspropertyClassList([...selectItemspropertyClassList, label]);
    } else {
      setInputs({ ...inputs, bolt_grade: inputs.bolt_grade.filter((item) => item !== label) })
      setSelectItemspropertyClassList(selectItemspropertyClassList.filter((item) => item !== label));
    }
  };

  const handleSelectAllChangePropertyClass = (event) => {
    if (event.target.checked) {
      const allLabels = checkboxLabelspropertyClassList;
      setInputs({ ...inputs, bolt_grade: allLabels });
      setSelectItemspropertyClassList(allLabels);
    } else {
      setInputs({ ...inputs, bolt_grade: [] });
      setSelectItemspropertyClassList([]);
    }
  };

  useEffect(() => {

    const fetchThicknessData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/populate?moduleName=Fin-Plate-Connection&thickness=Customized');
        const data = await response.json();
        setThicknessLabels(data.thicknessList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchThicknessData();

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
      setAllSelected({ ...allSelected, bolt_diameter: false });
      setModalOpen(true);
    } else {
      setAllSelected({ ...allSelected, bolt_diameter: true });
      setModalOpen(false);
    }
  };
  const handleAllSelectPT = (value) => {
    if (value === 'Customized') {
      setAllSelected({ ...allSelected, plate_thickness: false });
      setPlateThicknessModal(true);
    } else {
      setAllSelected({ ...allSelected, plate_thickness: true });
      setPlateThicknessModal(false);
    }
  };

  const handleCheckboxChange = (label) => (event) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, label]);
      setInputs({ ...inputs, bolt_diameter: [...inputs.bolt_diameter, label] });
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== label));
      setInputs({ ...inputs, bolt_diameter: inputs.bolt_diameter.filter((item) => item !== label) });
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
  const handleAllSelectCheckboxThickness = (event) => {
    if (event.target.checked) {
      setInputs({ ...inputs, plate_thickness: thicknessLabels });
      setSelectedThickness(thicknessLabels);
    } else {
      setSelectedThickness([]);
      setInputs({ ...inputs, plate_thickness: [] });
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
    setOutput(null)
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

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    // console.log(inputs);
    // console.log(allSelected)

    const conn_map = {
      "Column-Flange-Beam-Web": "Flang-Beam Web",
      "Column-Web-Beam-Web": "Web-Beam Web",
      "Beam-Beam": "Beam-Beam"
    }

    // the mapping of API fields is not clear, so I have used dummy values for some fields.
    let param = {}
    if (selectedOption === 'Column-Flange-Beam-Web' || selectedOption === 'Column-Web-Beam-Web') {
      param = {
        "Bolt.Bolt_Hole_Type": "Standard",
        "Bolt.Diameter": allSelected.bolt_diameter ? checkboxLabels : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade ? checkboxLabelspropertyClassList : inputs.bolt_grade,
        "Bolt.Slip_Factor": "0.3",
        "Bolt.TensionType": "Pre-tensioned",
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        "Connectivity": conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": "Limit State Design",
        "Detailing.Corrosive_Influences": "No",
        "Detailing.Edge_type": "Rolled",
        "Detailing.Gap": "15",
        "Load.Axial": inputs.load_axial,
        "Load.Shear": inputs.load_shear,
        "Material": "E 250 (Fe 410 W)A",
        "Member.Supported_Section.Designation": inputs.beam_section,
        "Member.Supported_Section.Material": "E 250 (Fe 410 W)A",
        "Member.Supporting_Section.Designation": inputs.column_section,
        "Member.Supporting_Section.Material": "E 250 (Fe 410 W)A",
        "Module": "Fin Plate Connection",
        "Weld.Fab": "Shop Weld",
        "Weld.Material_Grade_OverWrite": "410",
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessLabels : inputs.plate_thickness
      }
    }
    else {
      param = {
        "Bolt.Bolt_Hole_Type": "Standard",
        "Bolt.Diameter": allSelected.bolt_diameter ? checkboxLabels : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade ? checkboxLabelspropertyClassList : inputs.bolt_grade,
        "Bolt.Slip_Factor": "0.48",
        "Bolt.TensionType": "Pre-tensioned",
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        "Connectivity": conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": "Limit State Design",
        "Detailing.Corrosive_Influences": "No",
        "Detailing.Edge_type": "Rolled, machine-flame cut, sawn and planed",
        "Detailing.Gap": "5",
        "Load.Axial": inputs.load_axial,
        "Load.Shear": inputs.load_shear,
        "Material": "E 300 (Fe 440)",
        "Member.Supported_Section.Designation": inputs.primary_beam,
        "Member.Supported_Section.Material": "E 300 (Fe 440)",
        "Member.Supporting_Section.Designation": inputs.secondary_beam,
        "Member.Supporting_Section.Material": "E 300 (Fe 440)",
        "Module": "Fin Plate Connection",
        "Weld.Fab": "Shop Weld",
        "Weld.Material_Grade_OverWrite": "440",
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessLabels : inputs.plate_thickness,
        "out_titles_status": ["1", "1", "1", "1"]
      }
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/calculate-output/fin-plate-connection', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(param)
      })
      const res = await response.json();
      console.log(res);

      const formatedOutput = {}

      for (const [key, value] of Object.entries(res.data)) {

        const newKey = key.split('.')[0]
        const label = value.label
        const val = value.value

        // console.log(newKey, label, val)
        if (val) {
          if (!formatedOutput[newKey])
            formatedOutput[newKey] = [{ label, val }]
          else
            formatedOutput[newKey].push({ label, val })
        }
      }

      console.log(formatedOutput)
      setOutput(formatedOutput)
    } catch (error) {
      console.log(error)
      setOutput(null)
    }
  }


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
                      <Select style={{ width: '100%' }}
                        value={inputs.primary_beam}
                        onSelect={(value) => setInputs({ ...inputs, primary_beam: value })}
                      >
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
                      <Select style={{ width: '100%' }}
                        value={inputs.secondary_beam}
                        onSelect={(value) => setInputs({ ...inputs, secondary_beam: value })}
                      >
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
                      <Select style={{ width: '100%' }}
                        value={inputs.column_section}
                        onSelect={(value) => setInputs({ ...inputs, column_section: value })}
                      >
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
                      <Select style={{ width: '100%' }}
                        value={inputs.beam_section}
                        onSelect={(value) => setInputs({ ...inputs, beam_section: value })}
                      >
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
                <div>
                  <Select style={{ width: '100%' }}
                    value={inputs.connector_material}
                    onSelect={(value) => setInputs({ ...inputs, connector_material: value })}
                  >
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
                <div>
                  <Input
                    type="text"
                    name="ShearForce"
                    onInput={(event) => { event.target.value = event.target.value.replace(/[^0-9.]/g, '') }} pattern="\d*"
                    value={inputs.load_shear}
                    onChange={(event) => setInputs({ ...inputs, load_shear: event.target.value })}
                  />
                </div>
                <div><h4>Axial Force(kN) :</h4></div>
                <div>
                  <Input
                    type="text"
                    name="AxialForce"
                    onInput={(event) => { event.target.value = event.target.value.replace(/[^0-9.]/g, '') }} pattern="\d*"
                    value={inputs.load_axial}
                    onChange={(event) => setInputs({ ...inputs, load_axial: event.target.value })}
                  />
                </div>
              </div>
              {/* Section End */}
              {/* Section Start */}
              <h3>Bolt</h3>
              <div className='component-grid    '>
                <div>
                  <h4>Diameter(mm):</h4>
                </div>
                <div>
                  <Select
                    style={{ width: '100%' }}
                    onSelect={handleSelectChangeBoltBeam}
                  >
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>
                <Modal
                  open={isModalOpen}
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
                <div>
                  <Select style={{ width: '100%' }}
                    value={inputs.bolt_type}
                    onSelect={(value) => setInputs({ ...inputs, bolt_type: value })}
                  >
                    <Option value="Bearing_Bolt">Bearing Bolt</Option>
                    <Option value="Friction_Grip_Bolt">Friction Grip Bolt</Option>
                  </Select>
                </div>
                <div><h4>Property Class:</h4></div>
                <div>
                  <Select style={{ width: '100%' }} onSelect={handleSelectChangePropertyClass}>
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>
                <Modal
                  open={isModalpropertyClassListOpen}
                  onCancel={() => setModalpropertyClassListOpen(false)}
                  footer={null}
                >
                  <Checkbox onChange={handleSelectAllChangePropertyClass}>Select All</Checkbox>
                  <div style={{ height: '200px', overflowY: 'scroll', display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      {checkboxLabelspropertyClassList.map((label, index) => (
                        <Checkbox
                          key={index}
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
                <div>
                  <Select style={{ width: '100%' }} onSelect={handleAllSelectPT}>
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>
                <Modal
                  open={plateThicknessModal}
                  onCancel={() => setPlateThicknessModal(false)}
                  footer={null}
                >
                  <Checkbox onChange={handleAllSelectCheckboxThickness}>Select All</Checkbox>
                  <div style={{ height: '200px', overflowY: 'scroll' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {thicknessLabels.map((label) => (
                        <Checkbox
                          key={label}
                          checked={selectedThickness.includes(label)}
                          onChange={handlePlateThicknessChange(label)}
                        >
                          {label}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                </Modal>
              </div>
            </div>
            <div className='inputdock-btn'>
              <Input type="button" value="Reset" />
              <Input type="button" value="Design" onClick={() => handleSubmit()} />
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
            {<OutputDock output={output} />}
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