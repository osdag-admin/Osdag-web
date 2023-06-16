
import '../../App.css'
import img1 from '../../assets/ShearConnection/sc_fin_plate.png'
import { useContext, useEffect, useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import {Select,Input} from 'antd'
import { Select, Input, Modal, Checkbox } from 'antd';

import CFBW from '../../assets/ShearConnection/sc_fin_plate/fin_cf_bw.png'
import CWBW from '../../assets/ShearConnection/sc_fin_plate/fin_cw_bw.png'
import BB from '../../assets/ShearConnection/sc_fin_plate/fin_beam_beam.png'
import ErrorImg from '../../assets/notSelected.png'
import OutputDock from '../OutputDock';
import Logs from '../Logs';
import Model from './threerender'

// importing Module Context 
import { ModuleContext } from '../../context/ModuleState';

const { Option } = Select;


function FinePlate() {

  const [selectedOption, setSelectedOption] = useState("Column Flange-Beam-Web");
  const [imageSource, setImageSource] = useState("")
  // const [connectivity, setConnectivity] = useState();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  // const [checkboxLabels, setCheckboxLabels] = useState([]);
  const [output, setOutput] = useState(null)
  const [logs, setLogs] = useState(null)
  const [displayOutput , setDisplayOutput] = useState(false)

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

  const {connectivityList , beamList , columnList , materialList  , boltDiameterList , thicknessList , propertyClassList, designLogs , designData , createSession , createDesign } = useContext(ModuleContext)

  const [selectItemspropertyClassList, setSelectItemspropertyClassList] = useState([]);
  const [isModalpropertyClassListOpen, setModalpropertyClassListOpen] = useState(false);
  // const [checkboxLabelspropertyClassList, setCheckboxLabelspropertyClassList] = useState([]);
  // const [thicknessLabels, setThicknessLabels] = useState([])
  const [plateThicknessModal, setPlateThicknessModal] = useState(false)
  const [selectedThickness, setSelectedThickness] = useState([])
  const [allSelected, setAllSelected] = useState({
    plate_thickness: false,
    bolt_diameter: false,
    bolt_grade: false,
  })


  useEffect(() => {
    createSession()
  }, [])


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
      console.log('selectedThickenssList : ', selectedThickness)
    } else {
      setInputs({ ...inputs, plate_thickness: inputs.plate_thickness.filter((item) => item !== label) })
      setSelectedThickness(selectedThickness.filter((item) => item !== label))
      console.log('selectedThickness : ', selectedThickness)
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
      const allLabels = propertyClassList;
      setInputs({ ...inputs, bolt_grade: allLabels });
      setSelectItemspropertyClassList(allLabels);
    } else {
      setInputs({ ...inputs, bolt_grade: [] });
      setSelectItemspropertyClassList([]);
    }
  };

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
      const allLabels = boltDiameterList;
      setSelectedItems(allLabels);
    } else {
      setSelectedItems([]);
    }
  };
  const handleAllSelectCheckboxThickness = (event) => {
    if (event.target.checked) {
      setInputs({ ...inputs, plate_thickness: thicknessList });
      setSelectedThickness(thicknessList);
    } else {
      setSelectedThickness([]);
      setInputs({ ...inputs, plate_thickness: [] });
    }
  };

  useEffect(() => {

    if (!selectedOption) return;

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

  useEffect(() => {
    if(displayOutput){
      try{
        setLogs(designLogs)
      }catch(error){
        console.log(error)
          setOutput(null)
      }
    }
  } , [designLogs])

  useEffect(() => {
      if(displayOutput){
          try{
            const formatedOutput = {}

          for (const [key, value] of Object.entries(designData)) {

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

          setOutput(formatedOutput)
        } catch (error) {
          console.log(error)
          setOutput(null)
        }
      }
  } , [designData])

  
  const handleSubmit = async () => {
    // console.log('Submit button clicked');
    // console.log(inputs);
    // console.log(allSelected)

    const conn_map = {
      "Column Flange-Beam-Web": "Column Flange-Beam Web",
      "Column Web-Beam-Web": "Column Web-Beam Web",
      "Beam-Beam": "Beam-Beam"
    }


    console.log('selectedOption : ' , selectedOption)

    // the mapping of API fields is not clear, so I have used dummy values for some fields.
    let param = {}
    if (selectedOption === 'Column Flange-Beam-Web' || selectedOption === 'Column Web-Beam-Web') {
      param = {
        "Bolt.Bolt_Hole_Type": "Standard",
        "Bolt.Diameter": allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade,
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
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
      }
    }
    else {
      param = {
        "Bolt.Bolt_Hole_Type": "Standard",
        "Bolt.Diameter": allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade,
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
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessList : inputs.plate_thickness,
        "out_titles_status": ["1", "1", "1", "1"]
      }
    }

    createDesign(param)
    setDisplayOutput(true)
    
    /*
    try {
      // creaing teh design
      createDesign(param)
      // setLogs(designLogs)
      const formatedOutput = {}

      for (const [key, value] of Object.entries(designData)) {

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

      setOutput(formatedOutput)
    } catch (error) {
      console.log(error)
      setOutput(null)
    }
    */
    
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
                  onSelect={handleSelectChange}
                  value={selectedOption}
                >
                  {connectivityList.map((item , index) => (
                    <Option key={index} value={item}>{item}</Option>
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
                        {beamList.map((index, item) => (
                          <Option key={index} value={item}>
                            {item}
                          </Option>
                        ))}
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
                        {
                          beamList.map((index, item) => (
                            <Option key={index} value={item}>
                              {item}
                            </Option>
                          ))
                        }
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
                        {
                          columnList.map((item, index) => (
                            <Option key={index} value={item}>
                              {item}
                            </Option>
                          ))
                        }
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
                        {beamList.map((item, index) => (
                          <Option key={index} value={item}>
                            {item}
                          </Option>
                        ))
                        }
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
                    {materialList.map((item, index) => (
                      <Option key={index} value={item}>{item}</Option>
                    ))}
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
                      {boltDiameterList.map((label) => (
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
                      {propertyClassList.map((label) => (
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
                      {thicknessList.map((label) => (
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
            {/* <img src={img1} alt="Demo" height='400px' width='400px' />
            <br /> */}
            <Canvas>
            <Model />
            </Canvas>
            <div>
              <Logs logs={logs} />
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