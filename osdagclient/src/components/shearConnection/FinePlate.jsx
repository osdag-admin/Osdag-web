
import '../../App.css'
import img1 from '../../assets/ShearConnection/sc_fin_plate.png'
import { useContext, useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
// import {Select,Input} from 'antd'
import { Select, Input, Modal, Checkbox, Button, Upload, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import CFBW from '../../assets/ShearConnection/sc_fin_plate/fin_cf_bw.png'
import CWBW from '../../assets/ShearConnection/sc_fin_plate/fin_cw_bw.png'
import BB from '../../assets/ShearConnection/sc_fin_plate/fin_beam_beam.png'
import ErrorImg from '../../assets/notSelected.png'
import OutputDock from '../OutputDock';
import Logs from '../Logs';
import Model from './threerender'
import { Canvas } from '@react-three/fiber'
import { ModuleContext } from '../../context/ModuleState';
import { Viewer } from '@react-pdf-viewer/core';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';


const { Option } = Select;

const conn_map = {
  "Column Flange-Beam-Web": "Column Flange-Beam Web",
  "Column Web-Beam-Web": "Column Web-Beam Web",
  "Beam-Beam": "Beam-Beam"
}


function FinePlate() {

  const [selectedOption, setSelectedOption] = useState("Column Flange-Beam-Web");
  const [imageSource, setImageSource] = useState("")
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [output, setOutput] = useState(null)
  const [logs, setLogs] = useState(null)
  const [displayOutput, setDisplayOutput] = useState()

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

  const { connectivityList, beamList, columnList, materialList, boltDiameterList, thicknessList, propertyClassList, designLogs, designData, displayPDF, report_id, renderCadModel, createSession, createDesign, createDesignReport, saveCSV, blobUrl } = useContext(ModuleContext)

  const [selectItemspropertyClassList, setSelectItemspropertyClassList] = useState([]);
  const [isModalpropertyClassListOpen, setModalpropertyClassListOpen] = useState(false);
  const [plateThicknessModal, setPlateThicknessModal] = useState(false)
  const [selectedThickness, setSelectedThickness] = useState([])
  const [allSelected, setAllSelected] = useState({
    plate_thickness: false,
    bolt_diameter: false,
    bolt_grade: false,
  })

  const [renderBoolean, setRenderBoolean] = useState(false)


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
    if (displayOutput) {
      try {
        setLogs(designLogs)
      } catch (error) {
        console.log(error)
        setOutput(null)
      }
    }
  }, [designLogs])

  useEffect(() => {
    if (displayOutput) {
      try {
        const formatedOutput = {}

        for (const [key, value] of Object.entries(designData)) {

          const newKey = key.split('.')[0]
          const label = value.label
          const val = value.value

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
  }, [designData])


  const handleSubmit = async () => {
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
  // Create design report ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const [CreateDesignReportBool, setCreateDesignReportBool] = useState(false);
  // const [companyName, setCompanyName] = useState('');
  // // const [companyLogo, setCompanyLogo] = useState(null);
  // const [groupTeamName, setGroupTeamName] = useState('');
  // const [designer, setDesigner] = useState('');
  // const [projectTitle, setProjectTitle] = useState('');
  const [designReportInputs, setDesignReportInputs] = useState({
    companyName: 'Your company',
    groupTeamName: 'Your team',
    designer: 'You',
    projectTitle: '',
    subtitle: '',
    jobNumber: '1',
    client: 'Someone else',
    additionalComments: 'No comments',
  })



  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (file) => {
    setSelectedFile(file);
  };

  const handleUseProfile = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const contents = event.target.result;
        const lines = contents.split('\n');

        lines.forEach((line) => {
          const [field, value] = line.split(':');
          const trimmedField = field.trim();
          const trimmedValue = value.trim();

          if (trimmedField === 'CompanyName') {
            setCompanyName(trimmedValue);
          } else if (trimmedField === 'Designer') {
            setDesigner(trimmedValue);
          } else if (trimmedField === 'Group/TeamName') {
            setGroupTeamName(trimmedValue);
          }
        });
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSaveProfile = () => {
    const profileSummary = `CompanyLogo: C:/Users/SURAJ/Pictures/codeup.png
  CompanyName: ${companyName}
  Designer: ${designer}
  Group/TeamName: ${groupTeamName}`;

    const blob = new Blob([profileSummary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${companyName}.txt`;

    link.style.display = "none";
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateDesignReport = () => {
    setCreateDesignReportBool(true);
  };

  // const createDesignReportHandler = () => {
  //   console.log('inside createDesignReport Handler')
  //   createDesignReport({})
  // }

  useEffect(() => {
    if (renderCadModel) {
      console.log('renderCadModel is true')
      setRenderBoolean(true)
    } else if (!renderCadModel) {
      console.log('renderCadModel is false')
      setRenderBoolean(false)
    }
  }, [renderCadModel])
  const handleCancel = () => {
    setCreateDesignReportBool(false);
  };
  const convertToCSV = (data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const csvData = keys.map((key, index) => {
      const escapedValue = values[index].toString().replace(/"/g, '\\"');
      return `"${key}","${escapedValue}"`;
    });




    return csvData.join('\n');
  };

  const handleOk = () => {
    // Handle OK button logic
    console.log(designReportInputs)
    createDesignReport(designReportInputs)
    handleCancelProfile()
  };

  const handleCancelProfile = () => {
    // Handle Cancel button logic
    setDesignReportInputs({
      companyName: 'Your company',
      groupTeamName: 'Your team',
      designer: 'You',
      projectTitle: '',
      subtitle: '',
      jobNumber: '1',
      client: 'Someone else',
      additionalComments: 'No comments',
    })
    setCreateDesignReportBool(false);
  };


  const saveOutput = () => {
    let data = {}

    if (selectedOption === 'Column Flange-Beam-Web' || selectedOption === 'Column Web-Beam-Web') {
      data = {
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
      data = {
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

    Object.keys(output).map((key, index) => {
      Object.values(output[key]).map((elm, index1) => {
        data[key + '.' + elm.label.split(' ').join('_')] = elm.val
      })
    })

    data = convertToCSV(data)
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'output.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  {connectivityList.map((item, index) => (
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
                        {beamList.map((item, index) => (
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
                          beamList.map((item, index) => (
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
            {renderBoolean ?
              <div style={{ width: '400px', height: '400px' }}>
                <Canvas gl={{ antialias: true }} camera={{ aspect: 1 }}>
                  <Model />
                </Canvas>
              </div> :
              <img src={img1} alt="Demo" height='400px' width='400px' />}
            <br />
            <div>
              <Logs logs={logs} />
            </div>

          </div>
          {/* Right */}
          <div>
            {<OutputDock output={output} />}
            <div className='outputdock-btn'>
              <Input type="button" value="Create Design Report" onClick={handleCreateDesignReport} />
              <Input type="button" value="Save Output" onClick={saveOutput} />

              <Modal
                open={CreateDesignReportBool}
                onCancel={handleCancel}
                footer={null}
                style={{ border: '1px solid #ccc' }}
                bodyStyle={{ padding: '20px' }}
              >
                <div>
                  <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Company Name:</label>
                    </Col>
                    <Col span={15}>
                      <Input id="companyName" value={designReportInputs.companyName} onChange={(e) => setDesignReportInputs({ ...designReportInputs, companyName: e.target.value })} />
                    </Col>
                  </Row>
                  {/* <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Company Logo:</label>
                    </Col>
                    <Col span={15}>
                      <Upload beforeUpload={handleFileChange} showUploadList={false}>
                        <Button icon={<UploadOutlined />}>Select File</Button>
                      </Upload>
                    </Col>
                  </Row> */}
                  <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Group/Team Name:</label>
                    </Col>
                    <Col span={15}>
                      <Input id="groupTeamName" value={designReportInputs.groupTeamName} onChange={(e) => setDesignReportInputs({ ...designReportInputs, groupTeamName: e.target.value })} />
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Designer:</label>
                    </Col>
                    <Col span={15}>
                      <Input id="designer" value={designReportInputs.designer} onChange={(e) => setDesignReportInputs({ ...designReportInputs, designer: e.target.value })} />
                    </Col>
                  </Row>
                  {/* <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
                    <Upload beforeUpload={handleFileChange} showUploadList={false}>
                      <Button onClick={handleUseProfile} icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                    <Button type="button" onClick={handleSaveProfile}>Save Profile</Button>
                  </div> */}
                  <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Project Title:</label>
                    </Col>
                    <Col span={15}>
                      <Input value={designReportInputs.projectTitle} onChange={(e) => setDesignReportInputs({ ...designReportInputs, projectTitle: e.target.value })} />
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Subtitle:</label>
                    </Col>
                    <Col span={15}>
                      <Input value={designReportInputs.subtitle} onChange={(e) => setDesignReportInputs({ ...designReportInputs, subtitle: e.target.value })} />
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Job Number:</label>
                    </Col>
                    <Col span={15}>
                      <Input value={designReportInputs.jobNumber} onChange={e => setDesignReportInputs({ ...designReportInputs, jobNumber: e.target.value })} />
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Client:</label>
                    </Col>
                    <Col span={15}>
                      <Input value={designReportInputs.client} onChange={e => setDesignReportInputs({ ...designReportInputs, client: e.target.value })} />
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Additional Comments:</label>
                    </Col>
                    <Col span={15}>
                      <Input.TextArea value={designReportInputs.additionalComments} onChange={e => setDesignReportInputs({ ...designReportInputs, additionalComments: e.target.value })} />
                    </Col>
                  </Row>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button type="button" onClick={handleOk}>OK</Button>
                    <Button type="button" onClick={handleCancelProfile}>Cancel</Button>
                  </div>
                </div>
              </Modal>


            </div>
          </div>
        </div>
      </div>

      {displayPDF ?
        <div style={{
          border: '1px solid rgba(0, 0, 0, 0.3)',
          height: '750px',
          position: 'absolute'
        }}>
          <Viewer fileUrl={`http://localhost:5173/00335c94-1b3f-47f1-959e-6b96475dfd38`} />
        </div>
        : <br />}
    </>
  )
}

export default FinePlate