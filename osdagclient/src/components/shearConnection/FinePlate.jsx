
import '../../App.css'
import { useContext, useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Select, Input, Modal, Button, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom'
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
import { Tube } from '@react-three/drei';
import DesignPrefSections from '../DesignPrefSections';
import CustomSectionModal from '../CustomSectionModal';

// drop down 
import DropdownMenu from '../DropdownMenu';

// crypto packages
import {decode as base64_decode, encode as base64_encode} from 'base-64';
import { UserContext } from '../../context/UserState';


const { Option } = Select;

const conn_map = {
  "Column Flange-Beam-Web": "Column Flange-Beam Web",
  "Column Web-Beam-Web": "Column Web-Beam Web",
  "Beam-Beam": "Beam-Beam"
}



const MenuItems = [
  {
    label: "File",
    dropdown: [
      { name: "Load Input", shortcut: "Ctrl+L" },
      { name: "Download Input", shortcut: "Ctrl+D" },
      { name: "Save Input" , shortcut : "Alt+N"},
      { name: "Save Log Messages", shortcut: "Alt+M" },
      { name: "Create Design Report", shortcut: "Alt+C" },
      { name: "Save 3D Model", shortcut: "Alt+3" },
      { name: "Save Cad Image", shortcut: "Alt+1" },
      { name: "Save Front View", shortcut: "Alt+Shift+F" },
      { name: "Save Top View", shortcut: "Alt+Shift+T" },
      { name: "Save Side View", shortcut: "Alt+Shift+S" },
      { name: "Quit", shortcut: "Shift+Q" }
    ]
  },
  {
    label: "Edit",
    dropdown: [
      { name: "Design Preferences", shortcut: "Alt+P" }
    ]
  },
  {
    label: "Graphics",
    dropdown: [
      { name: "Zoom In", shortcut: "Ctrl+I" },
      { name: "Zoom Out", shortcut: "Ctrl+O" },
      { name: "Pan", shortcut: "Ctrl+P" },
      { name: "Rotate 3D Model", shortcut: "Ctrl+R" },
      { name: "Model" },
      { name: "Beam" },
      { name: "Column" },
      { name: "FinePlate" },
      { name: "Change Background" }
    ]
  },
  {
    label: "Database",
    dropdown: [
      { name: "Downloads", options: ["Column", "Beam", "Angle", "Channel"] },
      { name: "Reset" }
    ]
  },
  {
    label: "Help",
    dropdown: [
      { name: "Video Tutorials" },
      { name: "Design Examples" },
      { name: "Ask us a question" },
      { name: "About Osdag" }
    ]
  }
];
// End 
// Key event 
// const KeyPressListener = () => {
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       // Check for key combinations
//       if (event.altKey && event.key === 'p') {

//         console.log('Alt + P pressed');
//       } 
//       if (event.altKey && event.key === 'q') {

//         console.log('Alt + q pressed');
//       } 

//       // Listen for individual key presses
//       switch (event.key) {
//         case 'Enter':
//           console.log('Enter key pressed');
//           break;
//         case 'Escape':
//           console.log('Escape key pressed');
//           break;
//         default:
//           break;
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);

//   }, []);
// };
// end

function FinePlate() {

  const [selectedOption, setSelectedOption] = useState("Column Flange-Beam-Web");
  const [imageSource, setImageSource] = useState("")
  const [isModalOpen, setModalOpen] = useState(false);
  const [output, setOutput] = useState(null)
  const [logs, setLogs] = useState(null)
  const [displayOutput, setDisplayOutput] = useState()
  const [boltDiameterSelect, setBoltDiameterSelect] = useState("All")
  const [thicknessSelect, setThicknessSelect] = useState("All")
  const [propertyClassSelect, setPropertyClassSelect] = useState("All")
  const [designPrefModalStatus, setDesignPrefModalStatus] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(false)
  const [displaySaveInputPopup , setDisplaySaveInputPopup] = useState(false)
  const [saveInputFileName , setSaveInputFileName] = useState("")
  const {connectivityList, beamList, columnList, materialList, boltDiameterList, thicknessList, propertyClassList, designLogs, designData, displayPDF, renderCadModel, createSession, createDesign, createDesignReport, getDesingPrefData } = useContext(ModuleContext)

  if(displaySaveInputPopup)[
    setTimeout(() => setDisplaySaveInputPopup(false) , 4000)
  ]

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
    supported_material: "E 165 (Fe 290)",
    supporting_material: "E 165 (Fe 290)",
    bolt_hole_type: "Standard",
    bolt_slip_factor: "0.3",
    weld_fab: "Shop Weld",
    weld_material_grade: "410",
    detailing_edge_type: "Rolled, machine-flame cut, sawn and planed",
    detailing_gap: "10",
    detailing_corr_status: "No",
    design_method: "Limit State Design",
    bolt_tension_type: "Pre-tensioned"
  })

  const [isModalpropertyClassListOpen, setModalpropertyClassListOpen] = useState(false);
  const [plateThicknessModal, setPlateThicknessModal] = useState(false)
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
      // check, if the bolt_grade already has a value, then set it to that value 
      // else, set it to an empty list 
      if (inputs.bolt_grade.length != 0) {
        setInputs({ ...inputs, bolt_grade: inputs.bolt_grade })
      } else {
        // if the length is 0 , then set it to an empty array 
        setInputs({ ...inputs, bolt_grade: [] })
      }
      setPropertyClassSelect("Customized")
      setAllSelected({ ...allSelected, bolt_grade: false })
      setModalpropertyClassListOpen(true);
    } else {
      setPropertyClassSelect("All")
      setAllSelected({ ...allSelected, bolt_grade: true })
      setModalpropertyClassListOpen(false);
    }
  };

  const handleSelectChangeBoltBeam = (value) => {
    if (value === 'Customized') {
      // check, if the bolt_diameter already has a value, then set it to that value 
      // else, set it to an empty list 
      if (inputs.bolt_diameter.length != 0) {
        setInputs({ ...inputs, bolt_diameter: inputs.bolt_diameter })
      } else {
        // if the length is 0 , then set it to an empty array 
        setInputs({ ...inputs, bolt_diameter: [] })
      }
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
      // check, if the plate_thickness already has a value, then set it to that value 
      // else, set it to an empty list 
      if (inputs.plate_thickness.length != 0) {
        setInputs({ ...inputs, plate_thickness: inputs.plate_thickness })
      } else {
        // if the length is 0 , then set it to an empty array 
        setInputs({ ...inputs, plate_thickness: [] })
      }
      setThicknessSelect("Customized")
      setAllSelected({ ...allSelected, plate_thickness: false });
      setPlateThicknessModal(true);
    } else {
      setThicknessSelect("All")
      setAllSelected({ ...allSelected, plate_thickness: true });
      setPlateThicknessModal(false);
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


  ;

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
    console.log(allSelected, boltDiameterList)
    if (selectedOption === 'Column Flange-Beam-Web' || selectedOption === 'Column Web-Beam-Web') {
      if (!inputs.beam_section || !inputs.column_section || (inputs.beam_section === 'Select Section') || (inputs.column_section === 'Select Section')) {
        alert("Please input all the fields");
        return;
      }
      param = {
        "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
        "Bolt.Diameter": allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade,
        "Bolt.Slip_Factor": inputs.bolt_slip_factor,
        "Bolt.TensionType": inputs.bolt_tension_type,
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        "Connectivity": conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": inputs.design_method,
        "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
        "Detailing.Edge_type": inputs.detailing_edge_type,
        "Detailing.Gap": inputs.detailing_gap,
        "Load.Axial": inputs.load_axial || '',
        "Load.Shear": inputs.load_shear || '',
        "Material": inputs.connector_material,
        "Member.Supported_Section.Designation": inputs.beam_section,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Designation": inputs.column_section,
        "Member.Supporting_Section.Material": inputs.supporting_material,
        "Module": "Fin Plate Connection",
        "Weld.Fab": inputs.weld_fab,
        "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
      }
    }
    else {
      if (!inputs.primary_beam || !inputs.secondary_beam) {
        alert("Please input all the fields");
        return;
      }
      param = {
        "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
        "Bolt.Diameter": allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade,
        "Bolt.Slip_Factor": inputs.bolt_slip_factor,
        "Bolt.TensionType": inputs.bolt_tension_type,
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        "Connectivity": conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": inputs.design_method,
        "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
        "Detailing.Edge_type": inputs.detailing_edge_type,
        "Detailing.Gap": inputs.detailing_gap,
        "Load.Axial": inputs.load_axial || '',
        "Load.Shear": inputs.load_shear || '',
        "Material": "E 300 (Fe 440)",
        "Member.Supported_Section.Designation": inputs.secondary_beam,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Designation": inputs.primary_beam,
        "Member.Supporting_Section.Material": inputs.supporting_material,
        "Module": "Fin Plate Connection",
        "Weld.Fab": inputs.weld_fab,
        "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
      }
    }
    createDesign(param)
    setDisplayOutput(true)
  }
  // Create design report ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const [CreateDesignReportBool, setCreateDesignReportBool] = useState(false);
  const [designReportInputs, setDesignReportInputs] = useState({
    companyName: 'Your company',
    groupTeamName: 'Your team',
    designer: 'You',
    projectTitle: '',
    subtitle: '',
    jobNumber: '1',
    client: 'Someone else',
    additionalComments: 'No comments',
    companyLogo: null,
    companyLogoName: ""
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
    console.log('designreportInputs : ', designReportInputs)
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
      companyLogo: null,
      companyLogoName: ""
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
        "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
        "Bolt.Diameter": allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade,
        "Bolt.Slip_Factor": inputs.bolt_slip_factor,
        "Bolt.TensionType": inputs.bolt_tension_type,
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        "Connectivity": conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": inputs.design_method,
        "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
        "Detailing.Edge_type": inputs.detailing_edge_type,
        "Detailing.Gap": inputs.detailing_gap,
        "Load.Axial": inputs.load_axial || '',
        "Load.Shear": inputs.load_shear || '',
        "Material": "E 250 (Fe 410 W)A",
        "Member.Supported_Section.Designation": inputs.beam_section,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Designation": inputs.column_section,
        "Member.Supporting_Section.Material": inputs.supporting_material,
        "Module": "Fin Plate Connection",
        "Weld.Fab": inputs.weld_fab,
        "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessList : inputs.plate_thickness
      }
    }
    else {
      if (!inputs.primary_beam || !inputs.secondary_beam || !output) {
        alert('Please submit the design first.')
        return;
      }
      data = {
        "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
        "Bolt.Diameter": allSelected.bolt_diameter ? boltDiameterList : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade ? propertyClassList : inputs.bolt_grade,
        "Bolt.Slip_Factor": inputs.bolt_slip_factor,
        "Bolt.TensionType": inputs.bolt_tension_type,
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        "Connectivity": conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": inputs.design_method,
        "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
        "Detailing.Edge_type": inputs.detailing_edge_type,
        "Detailing.Gap": inputs.detailing_gap,
        "Load.Axial": inputs.load_axial || '',
        "Load.Shear": inputs.load_shear || '',
        "Material": "E 300 (Fe 440)",
        "Member.Supported_Section.Designation": inputs.secondary_beam,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Designation": inputs.primary_beam,
        "Member.Supporting_Section.Material": inputs.supporting_material,
        "Module": "Fin Plate Connection",
        "Weld.Fab": inputs.weld_fab,
        "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
        "Connector.Plate.Thickness_List": allSelected.plate_thickness ? thicknessList : inputs.plate_thickness,
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
    if (conn_map[selectedOption] == 'Column Flange-Beam Web' || conn_map[selectedOption] == 'Column Web-Beam Web') {
      // resetting the inputs
      setInputs({
        bolt_diameter: inputs.bolt_diameter,
        bolt_grade: inputs.bolt_grade,
        bolt_type: "Bearing Bolt",
        connector_material: inputs.connector_material,
        load_shear: "",
        load_axial: "",
        module: "Fin Plate Connection",
        plate_thickness: inputs.plate_thickness,
        beam_section: "Select Section",
        column_section: "Select Section",
      })

    } else if (conn_map[selectedOption] == 'Beam-Beam') {
      setInputs({
        bolt_diameter: inputs.bolt_diameter,
        bolt_grade: inputs.bolt_grade,
        bolt_type: "Bearing Bolt",
        connector_material: inputs.connector_material,
        load_shear: "",
        load_axial: "",
        module: "Fin Plate Connection",
        plate_thickness: inputs.plate_thickness,
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
    setInputs({ ...inputs, bolt_diameter: nextTargetKeys })
  };
  // 
  // propertyClassList
  const [selectedpropertyClassListItems, setSelectedpropertyClassListItems] = useState([]);

  const handleTransferChangeInPropertyClassList = (nextTargetKeys) => {
    setSelectedpropertyClassListItems(nextTargetKeys);
    setInputs({ ...inputs, bolt_grade: nextTargetKeys })
  };
  // 
  // plate_thickness
  const [selectedPlateThicknessItems, setSelectedPlateThicknessItems] = useState([]);

  const handleTransferChangeInPlateThickness = (nextTargetKeys) => {
    setSelectedPlateThicknessItems(nextTargetKeys);
    setInputs({ ...inputs, plate_thickness: nextTargetKeys })
  };

  // Get local Stored Items

  // const storedCompanyLogo = JSON.parse(localStorage.getItem('companyLogo'));
  // const storedCompanyLogoName = localStorage.getItem('companyLogoName');
  // Image file changehandler 
  const handleImageFileChange = (event) => {

    // get the selected file from the event 
    const imageFile = event.target.files[0]
    let imageFileName = event.target.files[0].name

    // Add local storage code 
    // localStorage.setItem('companyLogo',imageFile);
    // localStorage.setItem('companyLogoName', imageFileName);

    setDesignReportInputs({ ...designReportInputs, companyLogo: imageFile, companyLogoName: imageFileName })
  }

  // menu actions 
  useEffect(() => {

    const designPrefHandler = (e) => {
      if (e.altKey && e.key == 'p') {
        setDesignPrefModalStatus(true)
      }
    }

    window.addEventListener('keydown', designPrefHandler)
    return () => {
      setDesignPrefModalStatus(false)
      window.removeEventListener('keydown', designPrefHandler)
    }
  }, [])

  const [isDesignPreferencesModelOpen, setDesignPreferencesModel] = useState(false);

  const closeDesignPreferencesModel = () => {
    setDesignPreferencesModel(false);
  };

  useEffect(() => {

    if (conn_map[selectedOption] == 'Column Flange-Beam Web' || conn_map[selectedOption] == 'Column Web-Beam Web') {
      if (inputs.column_section != "" && inputs.beam_section != "") {
        getDesingPrefData({
          supported_section: inputs.beam_section,
          supporting_section: inputs.column_section,
          connectivity: conn_map[selectedOption].split(' ').join('-')
        })
      }
    }
    else if (conn_map[selectedOption] == 'Beam-Beam') {
      getDesingPrefData({
        supported_section: inputs.secondary_beam,
        supporting_section: inputs.primary_beam,
        connectivity: conn_map[selectedOption]
      })
    }


  }, [inputs.column_section, inputs.beam_section, inputs.primary_beam, inputs.secondary_beam, selectedOption])


  const obtainStoredCompanyLogoImages = () => {
    console.log('obtain stored company logo images')

    // obtaining the companyLogo
    if(localStorage.getItem('companyLogo') && localStorage.getItem('companyLogoName')){
      let storedCompanyLogo = localStorage.getItem('companyLogo')
      storedCompanyLogo = JSON.parse(storedCompanyLogo)
      // stored CompanyLogo is an array, it comtains the actual file
      // the file is encoded. decode it as given below
      // let companyLogo = base64_decode(storedCompanyLogo[0])

      let storedCompanyLogoName = localStorage.getItem('companyLogoName')
      storedCompanyLogoName = JSON.parse(storedCompanyLogoName)
      // stored companylogoName is an array, it contains the name of the files 
      // the fileNaeme is encoded. decode it as given belows
      // let companyLogoName = base64_decode(storedCompanyLogoName[0])

      // an image consists of 2 parts, the companyLogo and the companyLogoName 
      // so the 0th index image will be formed by ( storedCompanyLogo[0] and storedCompanyLogoName[0] )
      // the 1st index image will be formed by ( storedCompanyLogo[1] and storedCompanyLogoName[1] )
    }
  }

  const navigate = useNavigate();
  return (
    <>
      <div style={{ width: '100%' }}>
        <div className="module_nav">
          {MenuItems.map((item, index) => (
            <DropdownMenu
              key={index}
              label={item.label}
              dropdown={item.dropdown}
              setDesignPrefModalStatus={setDesignPrefModalStatus}
              inputs={inputs}
              setInputs={setInputs}
              allSelected={allSelected}
              setAllSelected={setAllSelected}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              logs={logs}
              setCreateDesignReportBool={setCreateDesignReportBool}
              setDisplaySaveInputPopup={setDisplaySaveInputPopup}
              setSaveInputFileName={setSaveInputFileName}
            />
          ))}

          {displaySaveInputPopup && <span id="save-input-style" style={{'marginTop' : '18px'}}>
              <strong>Saved input file as &quot; {saveInputFileName} &quot;</strong>
          </span>}

        <h1 className="element">
              <Button
                onClick={() => {
                  navigate('/home');
                }}
                style={{ backgroundColor: 'black', color: 'white' }}
              >
                Home
              </Button>
        </h1>
          
        </div>
        {/* <KeyPressListener /> */}

        {/* Main Body of code  */}
        <div className='superMainBody'>
          {/* Left */}
          <div>
            <div className='component-grid'>
                  
            {/*<div><h4>Workspace Name :</h4></div>
                <div>
                  <Input
                    type="text"
                    name="workspacename"
                    // onChange={(event) => setInputs({ ...inputs, load_axial: event.target.value })}
                    />
                </div>
              */}
            </div>
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
                    value={inputs.connector_material || materialList[0].Grade}
                    onSelect={(value) => {
                      if (value == -1) {
                        setShowModal(true);
                        return;
                      }
                      const material = materialList.find(item => item.id === value)
                      console.log(material)
                      setInputs({ ...inputs, connector_material: material.Grade })
                    }}
                  >
                    {materialList.map((item, index) => (
                      <Option key={index} value={item.id}>{item.Grade}</Option>
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
                    value={inputs.load_shear}
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
                    value={boltDiameterSelect}
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
                  <div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ marginRight: '20px' }}>
                        <h3>Customized</h3>
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
                          listStyle={{ height: 600, width: 300 }}
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
                  <Select style={{ width: '100%' }} onSelect={handleSelectChangePropertyClass} value={propertyClassSelect}>
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
                  <div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ marginRight: '20px' }}>
                        <h3>Customized</h3>
                        <Transfer
                          dataSource={propertyClassList
                            .sort((a, b) => Number(a) - Number(b))
                            .map((label) => ({
                              key: label,
                              label: <h5>{label}</h5>,
                            }))
                          }
                          targetKeys={selectedpropertyClassListItems}
                          onChange={handleTransferChangeInPropertyClassList}
                          render={(item) => item.label}
                          titles={['Available', 'Selected']}
                          showSearch
                          listStyle={{ height: 600, width: 300 }}
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
                  <Select style={{ width: '100%' }} onSelect={handleAllSelectPT} value={thicknessSelect}>
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
                  <div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ marginRight: '20px' }}>
                        <h3>Customized</h3>
                        <Transfer
                          dataSource={propertyClassList
                            .sort((a, b) => Number(a) - Number(b))
                            .map((label) => ({
                              key: label,
                              label: <h5>{label}</h5>,
                            }))
                          }
                          targetKeys={selectedPlateThicknessItems}
                          onChange={handleTransferChangeInPlateThickness}
                          render={(item) => item.label}
                          titles={['Available', 'Selected']}
                          showSearch
                          listStyle={{ height: 600, width: 300 }}
                        />
                      </div>
                    </div>
                  </div>
                </Modal>
              </div>
            </div>
            <div className='inputdock-btn'>
              <Input type="button" value="Reset" onClick={() => handleReset()} />
              <Input type="button" value="Design" onClick={() => handleSubmit()} />
            </div>
          </div>
          {/* Middle */}
          <div className='superMainBody_mid'>
            {renderBoolean ?
              <div style={{ maxwidth: '740px', height: '600px', border: '1px solid black', backgroundImage: `url(${cad_background})` }}>
                <Canvas gl={{ antialias: true }} camera={{ aspect: 1, fov: 1500, position: [10, 10, 10] }} >
                  <Model />
                </Canvas>
              </div> :
              <>
                <div style={{ maxwidth: '740px', height: '600px', border: '1px solid black' }}>
                  {<img src={cad_background} alt="Demo" height='100%' width='100%' />}
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
                  <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '25px' }}>
                    <Col span={9}>
                      <label>Company Logo : </label>
                    </Col>
                    <Col span={15}>
                      <input type="file" accept="image/png , image/jpeg , image/jpg" value={setDesignReportInputs.companyLogoName} onChange={handleImageFileChange} />
                    </Col>
                  </Row>
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

              {/* Nav Bar Model list */}
              {designPrefModalStatus && (
                <Modal
                  open={designPrefModalStatus}
                  onCancel={() => setConfirmationModal(true)}
                  footer={null}
                  minWidth={1200}
                  width={1400}
                  maxHeight={1200}
                  maskClosable={false}
                >
                  <DesignPrefSections 
                    inputs={inputs} 
                    setInputs={setInputs} 
                    selectedOption={selectedOption} 
                    setDesignPrefModalStatus={setDesignPrefModalStatus} 
                    confirmationModal={confirmationModal}
                    setConfirmationModal={setConfirmationModal}
                  />
                </Modal>
              )}

              {/* Nav Bar Model List End */}

            </div>
          </div>
        </div>
      </div>

      <CustomSectionModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={setInputs}
        inputValues={inputs}
        type="connector"
      />

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