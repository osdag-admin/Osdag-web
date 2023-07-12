
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
import { Transfer } from 'antd';
// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';

// import assets 
import cad_background from '../../assets/cad_empty_image.png'



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
  const [boltDiameterSelect , setBoltDiameterSelect] = useState("All")
  const [thicknessSelect , setThicknessSelect] = useState("All")
  const [propertyClassSelect , setPropertyClassSelect] = useState("All")

  const { connectivityList, beamList, columnList, materialList, boltDiameterList, thicknessList, propertyClassList, designLogs, designData, displayPDF, report_id, renderCadModel, createSession, createDesign, createDesignReport, saveCSV, blobUrl } = useContext(ModuleContext)

  const [inputs, setInputs] = useState({
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    load_shear: "70",
    load_axial: "30",
    module: "Fin Plate Connection",
    plate_thickness: [],
    beam_section: "MB 300",
    column_section: "HB 150",
    primary_beam: "JB 200",
    secondary_beam: "JB 150",
  })



  // console.log("All inputs:", JSON.stringify(inputs));
  const [selectItemspropertyClassList, setSelectItemspropertyClassList] = useState([]);
  const [isModalpropertyClassListOpen, setModalpropertyClassListOpen] = useState(false);
  const [plateThicknessModal, setPlateThicknessModal] = useState(false)
  const [selectedThickness, setSelectedThickness] = useState([])
  const [allSelected, setAllSelected] = useState({
    plate_thickness: true,
    bolt_diameter: true,
    bolt_grade: true,
  })

  const [renderBoolean, setRenderBoolean] = useState(false)


  useEffect(() => {
    createSession()
  }, [])


  const handleSelectChangePropertyClass = (value) => {
    if (value === 'Customized') {
      setInputs({...inputs , bolt_grade : []})
      setPropertyClassSelect("Customized")
      setAllSelected({ ...allSelected, bolt_grade: false })
      setModalpropertyClassListOpen(true);
    } else {
      setPropertyClassSelect("All")
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
      setInputs({...inputs , bolt_diameter : []})
      setBoltDiameterSelect("Customized")
      setAllSelected({ ...allSelected, bolt_diameter: false });
      setModalOpen(true);
    } else {
      setBoltDiameterSelect("All")
      setAllSelected({ ...allSelected, bolt_diameter: true });
      setModalOpen(false);
    }
  };
  const handleAllSelectPT = (value) => {
    if (value === 'Customized') {
      setInputs({...inputs , plate_thickness : []})
      setThicknessSelect("Customized")
      setAllSelected({ ...allSelected, plate_thickness: false });
      setPlateThicknessModal(true);
    } else {
      setThicknessSelect("All")
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

    if (selectedOption === 'Column Flange-Beam-Web') {
      setImageSource(CFBW)
    } else if (selectedOption === 'Column Web-Beam-Web') {
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
      if (!inputs.beam_section || !inputs.column_section || (inputs.beam_section==='Select Section') || (inputs.column_section==='Select Section')) {
        alert("Please input all the fields");
        return;
      }
      param = {
        "Bolt.Bolt_Hole_Type": "Standard",
        "Bolt.Diameter": allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade,
        "Bolt.Slip_Factor": "0.3",
        "Bolt.TensionType": "Pretensioned",
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        "Connectivity": conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": "Limit State Design",
        "Detailing.Corrosive_Influences": "No",
        "Detailing.Edge_type": "Rolled",
        "Detailing.Gap": "15",
        "Load.Axial": inputs.load_axial || '',
        "Load.Shear": inputs.load_shear || '',
        "Material": inputs.connector_material,
        "Member.Supported_Section.Designation": inputs.beam_section,
        "Member.Supported_Section.Material": inputs.connector_material,
        "Member.Supporting_Section.Designation": inputs.column_section,
        "Member.Supporting_Section.Material": inputs.connector_material,
        "Module": "Fin Plate Connection",
        "Weld.Fab": "Shop Weld",
        "Weld.Material_Grade_OverWrite": "410",
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
      }
    }
    else {
      if (!inputs.primary_beam || !inputs.secondary_beam ) {
        alert("Please input all the fields");
        return;
      }
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
        "Load.Axial": inputs.load_axial || '',
        "Load.Shear": inputs.load_shear || '',
        "Material": "E 300 (Fe 440)",
        "Member.Supported_Section.Designation": inputs.secondary_beam,
        "Member.Supported_Section.Material": "E 300 (Fe 440)",
        "Member.Supporting_Section.Designation": inputs.primary_beam,
        "Member.Supporting_Section.Material": "E 300 (Fe 440)",
        "Module": "Fin Plate Connection",
        "Weld.Fab": "Shop Weld",
        "Weld.Material_Grade_OverWrite": "440",
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
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
      setRenderBoolean(true)
    } else if (!renderCadModel) {
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
    if (!output) {
      alert('Please submit the design first.')
      return;
    }
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
      if (!inputs.beam_section || !inputs.column_section || !output) {
        alert('Please submit the design first.')
        return;
      }
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
        "Load.Axial": inputs.load_axial || '',
        "Load.Shear": inputs.load_shear || '',
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
      if (!inputs.primary_beam || !inputs.secondary_beam || !output) {
        alert('Please submit the design first.')
        return;
      }
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
        "Load.Axial": inputs.load_axial || '',
        "Load.Shear": inputs.load_shear || '',
        "Material": "E 300 (Fe 440)",
        "Member.Supported_Section.Designation": inputs.secondary_beam,
        "Member.Supported_Section.Material": "E 300 (Fe 440)",
        "Member.Supporting_Section.Designation": inputs.primary_beam,
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

  // Spacing model
  const [spacingModel, setSpacingModel] = useState(true);

	const handleDialogSpacing = (value) => {

		alert("ji")

	  if (value === 'Spacing') {
		setSpacingModel(true);
	  } else {
		setSpacingModel(false);
	  }
	};

  const handleReset = () => {
    /*
    bolt_diameter: boltDiameterList,
    bolt_grade: propertyClassList,
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    load_shear: "70",
    load_axial: "30",
    module: "Fin Plate Connection",
    plate_thickness: thicknessList,
    beam_section: "MB 300",
    column_section: "HB 150",
    primary_beam: "JB 200",
    secondary_beam: "JB 150",
    */
   /*
   plate_thickness: true,
    bolt_diameter: true,
    bolt_grade: true,
    */
   if(conn_map[selectedOption]=='Column Flange-Beam Web' || conn_map[selectedOption]=='Column Web-Beam Web'){
    // resetting the inputs
    setInputs({
      bolt_diameter: boltDiameterList,
      bolt_grade: propertyClassList,
      bolt_type: "Bearing Bolt",
      connector_material: inputs.connector_material,
      load_shear: "",
      load_axial: "",
      module: "Fin Plate Connection",
      plate_thickness: thicknessList,
      beam_section: "Select Section",
      column_section: "Select Section",
    })
    
   }else if(conn_map[selectedOption]=='Beam-Beam'){
    setInputs({
      bolt_diameter: boltDiameterList,
      bolt_grade: propertyClassList,
      bolt_type: "Bearing Bolt",
      connector_material: inputs.connector_material,
      load_shear: "",
      load_axial: "",
      module: "Fin Plate Connection",
      plate_thickness: thicknessList,
      primary_beam: "JB 200",
      secondary_beam: "JB 150",
    })
   }

   // reset setAllSelected
   setAllSelected({
    plate_thickness: true,
    bolt_diameter: true,
    bolt_grade: true,
  })

  setBoltDiameterSelect("All")
  setPropertyClassSelect("All")
  setThicknessSelect("All")
  handleAllSelectPT("All") // for thickness
  handleSelectChangePropertyClass("All")  // for property Class
  handleSelectChangeBoltBeam("All") // for bolt diameter

  // reset CAD model 
  setRenderBoolean(false)

  // reset Output values dock
  setOutput(null)

  }


  // Diameter mm 
  //  const [selectedItems, setSelectedItems] = useState([]);
const [selectedDiameterNewItems, setSelectedDiameterNewItems] = useState([]);

  const handleTransferChange = (nextTargetKeys) => {
    setSelectedDiameterNewItems(nextTargetKeys);
    setInputs({...inputs, bolt_diameter: nextTargetKeys})
    // setInputs({...inputs, bolt_diameter: nextTargetKeys})
    console.log("This is Diameter"+ nextTargetKeys);
  };
  // 
  // propertyClassList
  const [selectedpropertyClassListItems, setSelectedpropertyClassListItems] = useState([]);

  const handleTransferChangeInPropertyClassList = (nextTargetKeys) => {
    setSelectedDiameterNewItems(nextTargetKeys);
    setInputs({...inputs, bolt_grade: nextTargetKeys})
    console.log("This is Property class"+ nextTargetKeys);
  };
  // 
  // plate_thickness
  const [selectedPlateThicknessItems, setSelectedPlateThicknessItems] = useState([]);

  const handleTransferChangeInPlateThickness = (nextTargetKeys) => {
    setSelectedDiameterNewItems(nextTargetKeys);
    setInputs({...inputs, plate_thickness: nextTargetKeys})
    console.log("This is Plate thickness :"+ nextTargetKeys);
  };
  // 

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
                      <h4>Primary Beam*</h4>
                    </div>
                    <div>
                      <Select style={{ width: '100%' }}
                        value={inputs.primary_beam || beamList[2]}
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
                      <h4>Secondary Beam*</h4>
                    </div>
                    <div>
                      <Select style={{ width: '100%' }}
                        value={inputs.secondary_beam || beamList[0]}
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
                      <h4>Column Section*</h4>
                    </div>
                    <div>
                      <Select style={{ width: '100%' }}
                        value={inputs.column_section || columnList[0]}
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
                      <h4>Beam Section*</h4>
                    </div>
                    <div>
                      <Select style={{ width: '100%' }}
                        value={inputs.beam_section || beamList[28]}
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
                <div><h4>Material</h4></div>
                <div>
                  <Select style={{ width: '100%' }}
                    value={inputs.connector_material || materialList[0]}
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
                <div><h4>Shear Force(kN)</h4></div>
                <div>
                  <Input
                    type="text"
                    name="ShearForce"
                    onInput={(event) => { event.target.value = event.target.value.replace(/[^0-9.]/g, '') }} pattern="\d*"
                    value={inputs.load_shear } 
                    onChange={(event) => setInputs({ ...inputs, load_shear: event.target.value })}
                  />
                </div>
                <div><h4>Axial Force(kN)</h4></div>
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
                  <h4>Diameter(mm)</h4>
                </div>
                <div>
                  <Select
                    style={{ width: '100%' }}
                    onSelect={handleSelectChangeBoltBeam}
                    value = {boltDiameterSelect}
                  >
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>
{/* Diameter(mm) Pop up  */}
                <Modal
                  open={isModalOpen}
                  onCancel={() => setModalOpen(false)}
                  footer={null}
                  width={700}
                  height={700}
                >
                  {/* <Checkbox onChange={handleSelectAllChange}>Select All</Checkbox>
                  <div style={{ height: '500px', overflowY: 'scroll' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {boltDiameterList
                        .sort((a, b) => Number(a) - Number(b))
                        .map((label) => (
                        <Checkbox
                          key={label}
                          checked={selectedItems.includes(label)}
                          onChange={handleCheckboxChange(label)}
                        >
                          {label}
                        </Checkbox>
                      ))}
                    </div>
                    <Input type="button" value="Submit" onClick={() => setModalOpen(false)}/>
                  </div> */}
      <div>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: '20px' }}>
          <h3> Select Diameter</h3>
          <Transfer
      dataSource={boltDiameterList
        .sort((a, b) => Number(a) - Number(b))
        .map((label) => ({
          key: label,
          label: <h5>{label}</h5>,
        }))
      }
      targetKeys={selectedDiameterNewItems}
      onChange={handleTransferChange}
      render={(item) => item.label}
      titles={['Available', 'Selected']}
      showSearch
      listStyle={{ height: 600 , width: 300 }}
    />
        </div>
      </div>
    </div>
                </Modal>


                <div><h4>Type</h4></div>
                <div>
                  <Select style={{ width: '100%' }}
                    value={inputs.bolt_type}
                    onSelect={(value) => setInputs({ ...inputs, bolt_type: value })}
                    
                  >
                    <Option value="Bearing_Bolt">Bearing Bolt</Option>
                    <Option value="Friction_Grip_Bolt">Friction Grip Bolt</Option>
                  </Select>
                </div>
                <div><h4>Property Class</h4></div>
                <div>
                  <Select style={{ width: '100%' }} onSelect={handleSelectChangePropertyClass} value = {propertyClassSelect}>
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>
                <Modal
                  open={isModalpropertyClassListOpen}
                  onCancel={() => setModalpropertyClassListOpen(false)}
                  footer={null}
                  width={700}
                  height={700}
                >
                  {/* <Checkbox onChange={handleSelectAllChangePropertyClass}>Select All</Checkbox>
                  <div style={{ height: '400px', overflowY: 'scroll',alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',gap:'10px', marginTop:'10px',marginBottom:'10px' }}>
                      {propertyClassList
                        .sort((a, b) => Number(a) - Number(b))
                        .map((label) => (
                          <Checkbox
                            key={label}
                            checked={selectItemspropertyClassList.includes(label)}
                            onChange={handleCheckboxChangePropertyClass(label)}
                          >
                            {label}
                          </Checkbox>
                      ))}
                    </div>
                    <Input type="button" value="Submit" onClick={() => setModalpropertyClassListOpen(false)}/>
                  </div> */}

                    <div>
                      <div style={{ display: 'flex' }}>
                        <div style={{ marginRight: '20px' }}>
                          <h3> Select Property class</h3>
                          <Transfer
                      dataSource={propertyClassList
                        .sort((a, b) => Number(a) - Number(b))
                        .map((label) => ({
                          key: label,
                          label: <h5>{label}</h5>,
                        }))
                      }
                      targetKeys={selectedDiameterNewItems}
                      onChange={handleTransferChangeInPropertyClassList}
                      render={(item) => item.label}
                      titles={['Available', 'Selected']}
                      showSearch
                      listStyle={{ height: 600 , width: 300 }}
                    />
                        </div>
                      </div>
                    </div>
                </Modal>
              </div>
              {/* Section End */}
              <h3>Plate</h3>
              <div className='component-grid    '>
                <div><h4>Thickness(mm)</h4></div>
                <div>
                  <Select style={{ width: '100%' }} onSelect={handleAllSelectPT} value = {thicknessSelect}>
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>
                <Modal
                  open={plateThicknessModal}
                  onCancel={() => setPlateThicknessModal(false)}
                  footer={null}
                  width={700}
                  height={700}
                >
                  {/* <Checkbox onChange={handleAllSelectCheckboxThickness}>Select All</Checkbox>
                  <div style={{ height: '550px', overflowY: 'scroll' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {thicknessList
                        .sort((a, b) => Number(a) - Number(b))
                        .map((label) => (
                          <Checkbox
                            key={label}
                            checked={selectedThickness.includes(label)}
                            onChange={handlePlateThicknessChange(label)}
                          >
                            {label}
                          </Checkbox>
                      ))}
                    </div>
                    <Input type="button" value="Submit" onClick={() => setPlateThicknessModal(false)}/>
                  </div> */}
                   <div>
                      <div style={{ display: 'flex' }}>
                        <div style={{ marginRight: '20px' }}>
                          <h3> Select Property class</h3>
                          <Transfer
                      dataSource={propertyClassList
                        .sort((a, b) => Number(a) - Number(b))
                        .map((label) => ({
                          key: label,
                          label: <h5>{label}</h5>,
                        }))
                      }
                      targetKeys={selectedDiameterNewItems}
                      onChange={handleTransferChangeInPlateThickness}
                      render={(item) => item.label}
                      titles={['Available', 'Selected']}
                      showSearch
                      listStyle={{ height: 600 , width: 300 }}
                    />
                        </div>
                      </div>
                    </div>
                </Modal>
              </div>
            </div>
            <div className='inputdock-btn'>
              <Input type="button" value="Reset" onClick ={() => handleReset()}/>
              <Input type="button" value="Design" onClick={() => handleSubmit()} />
            </div>
          </div>
          {/* Middle */}
          <div className='superMainBody_mid'>
            {renderBoolean ?
              <div style={{ maxwidth: '740px', height: '600px', border: '1px solid black' , backgroundImage : `url(${cad_background})`}}>
              <Canvas gl={{ antialias: true }} camera={{ aspect: 1, fov: 1500, position: [10, 10, 10] }} >
                <Model />
              </Canvas>
            </div> :
             <>
             <div style={{ maxwidth: '740px', height: '600px', border: '1px solid black' }}>
              { <img src={cad_background} alt="Demo" height='100%' width='100%' /> }
              </div>
             </> 
              }
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