/* eslint-disable no-unused-vars */
import "../../App.css";
import { Suspense, useContext, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Select, Input, Modal, Button, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import CFBW from "../../assets/ShearConnection/sc_fin_plate/fin_cf_bw.png";
import CWBW from "../../assets/ShearConnection/sc_fin_plate/fin_cw_bw.png";
import BB from "../../assets/ShearConnection/sc_fin_plate/fin_beam_beam.png";
import ErrorImg from "../../assets/notSelected.png";
// import OutputDock from '../OutputDock';
import SeatedAngleOutputDock from "../SeatedAngleOutputDock";
import Logs from "../Logs";
import Model from "./threerender";
import { Canvas } from "@react-three/fiber";
import { ModuleContext } from "../../context/ModuleState";
import { Viewer } from "@react-pdf-viewer/core";
import { Transfer } from "antd";
// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Html } from "@react-three/drei";

// import assets
import cad_background from "../../assets/cad_empty_image.png";
import DesignPrefSections from "../DesignPrefSections";
import CustomSectionModal from "../CustomSectionModal";

// drop down
import DropdownMenu from "../DropdownMenu";
import ScreenshotCapture from "../ScreenShotCapture";

const { Option } = Select;

const conn_map = {
  "Column Flange-Beam-Web": "Column Flange-Beam Web",
  "Column Web-Beam-Web": "Column Web-Beam Web",
  "Beam-Beam": "Beam-Beam",
};

const MenuItems = [
  {
    label: "File",
    dropdown: [
      { name: "Load Input", shortcut: "Ctrl+L" },
      { name: "Save Input", shortcut: "Alt+N" },
      { name: "Download Input", shortcut: "Alt+D"},
      { name: "Save Log Messages", shortcut: "Alt+M" },
      { name: "Create Design Report", shortcut: "Alt+C" },
      { name: "Save 3D Model", shortcut: "Alt+3" },
      { name: "Save Cad Image", shortcut: "Alt+1" }
    ],
  },
  {
    label: "Edit",
    dropdown: [{ name: "Design Preferences", shortcut: "Alt+P" }],
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
      { name: "Seated Angle" },
      { name: "Change Background" },
    ],
  },
  {
    label: "Database",
    dropdown: [
      { name: "Downloads", options: ["Column", "Beam", "Angle", "Channel"] },
      { name: "Reset" },
    ],
  },
  {
    label: "Help",
    dropdown: [
      { name: "Video Tutorials" },
      { name: "Design Examples" },
      { name: "Ask us a question" },
      { name: "About Osdag" },
    ],
  },
];

function SeatedAngle() {
  const [selectedOption, setSelectedOption] = useState(
    "Column Flange-Beam-Web"
  );
  const [imageSource, setImageSource] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [output, setOutput] = useState(null);
  const [logs, setLogs] = useState(null);
  const [displayOutput, setDisplayOutput] = useState();
  const [boltDiameterSelect, setBoltDiameterSelect] = useState("All");
  const [propertyClassSelect, setPropertyClassSelect] = useState("All");
  const [designPrefModalStatus, setDesignPrefModalStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [displaySaveInputPopup, setDisplaySaveInputPopup] = useState(false);
  const [saveInputFileName, setSaveInputFileName] = useState("");
  const {
    connectivityList,
    angleList,
    topAngleList,
    beamList,
    columnList,
    materialList,
    boltDiameterList,
    propertyClassList,
    designLogs,
    designData,
    displayPDF,
    renderCadModel,
    cadModelPaths,
    createSession,
    createDesign,
    createDesignReport,
    getDesingPrefData,
    deleteSession,
  } = useContext(ModuleContext);
  const [angleModal, setAngleModal] = useState(false);
  const [connectorAngleSelect, setAngleSelect] = useState("All");

  const [topModal, setTopModal] = useState(false);
  const [connectorTopSelect, setTopSelect] = useState("All");

  if (displaySaveInputPopup)
    [setTimeout(() => setDisplaySaveInputPopup(false), 4000)];

  const [inputs, setInputs] = useState({
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    load_shear: "70",
    module: "Seated Angle Connection",
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
    bolt_tension_type: "Pre-tensioned",
    angle_list: [],
    topangle_list: [],
  });

  const [isModalpropertyClassListOpen, setModalpropertyClassListOpen] =
    useState(false);
  const [allSelected, setAllSelected] = useState({
    bolt_diameter: true,
    bolt_grade: true,
    angle_list: true,
    topangle_list: true
  });

  const [renderBoolean, setRenderBoolean] = useState(false);
  const [modelKey, setModelKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState("Model");
  const options = ["Model", "Beam", "Column", "SeatAngle"];
  const [screenshotTrigger, setScreenshotTrigger] = useState(false);
  const triggerScreenshotCapture = () => {
    setScreenshotTrigger(true);
  };

  useEffect(() => {
    createSession("Seated Angle Connection");
  }, []);

  useEffect(() => {
    return () => {
      if (location.pathname != "/design/connections/seated_angle") {
        deleteSession("Seated Angle Connection");
      }
    };
  }, []);

  const handleSelectChangePropertyClass = (value) => {
    if (value === "Customized") {
      // check, if the bolt_grade already has a value, then set it to that value
      // else, set it to an empty list
      if (inputs.bolt_grade.length != 0) {
        setInputs({ ...inputs, bolt_grade: inputs.bolt_grade });
      } else {
        // if the length is 0 , then set it to an empty array
        setInputs({ ...inputs, bolt_grade: [] });
      }
      setPropertyClassSelect("Customized");
      setAllSelected({ ...allSelected, bolt_grade: false });
      setModalpropertyClassListOpen(true);
    } else {
      setPropertyClassSelect("All");
      setAllSelected({ ...allSelected, bolt_grade: true });
      setModalpropertyClassListOpen(false);
    }
  };
  const handleAllSelectAngle = (value) => {
    if (value === "Customized") {
      if (inputs.angle_list.length != 0) {
        setInputs({ ...inputs, angle_list: inputs.angle_list });
      } else {
        // if the length is 0 , then set it to an empty array
        setInputs({ ...inputs, angle_list: [] });
      }
      setAngleSelect("Customized");
      setAllSelected({ ...allSelected, angle_list: false });
      setAngleModal(true);
    } else {
      setAngleSelect("All");
      setAllSelected({ ...allSelected, angle_list: true });
      setAngleModal(false);
    }
  };

  const handleAllSelectTopAngle = (value) => {
    if (value === "Customized") {
      if (inputs.angle_list.length != 0) {
        setInputs({ ...inputs, angle_list: inputs.angle_list });
      } else {
        // if the length is 0 , then set it to an empty array
        setInputs({ ...inputs, angle_list: [] });
      }
      setTopSelect("Customized");
      setAllSelected({ ...allSelected, angle_list: false });
      setTopModal(true);
    } else {
      setTopSelect("All");
      setAllSelected({ ...allSelected, angle_list: true });
      setTopModal(false);
    }
  };

  const handleSelectChangeBoltBeam = (value) => {
    if (value === "Customized") {
      // check, if the bolt_diameter already has a value, then set it to that value
      // else, set it to an empty list
      if (inputs.bolt_diameter.length != 0) {
        setInputs({ ...inputs, bolt_diameter: inputs.bolt_diameter });
      } else {
        // if the length is 0 , then set it to an empty array
        setInputs({ ...inputs, bolt_diameter: [] });
      }
      setBoltDiameterSelect("Customized");
      setAllSelected({ ...allSelected, bolt_diameter: false });
      setModalOpen(true);
    } else {
      setBoltDiameterSelect("All");
      setAllSelected({ ...allSelected, bolt_diameter: true });
      setModalOpen(false);
    }
  };

  useEffect(() => {
    if (!selectedOption) return;

    if (selectedOption === "Column Flange-Beam-Web") {
      setImageSource(CFBW);
    } else if (selectedOption === "Column Web-Beam-Web") {
      setImageSource(CWBW);
    } else if (selectedOption === "Beam-Beam") {
      setImageSource(BB);
    } else if (selectedOption === "") {
      setImageSource(ErrorImg);
    }
  }, [selectedOption]);

  const handleSelectChange = (value) => {
    setOutput(null);
    setSelectedOption(value);
  };

  useEffect(() => {
    if (displayOutput) {
      try {
        setLogs(designLogs);
      } catch (error) {
        console.log(error);
        setOutput(null);
      }
    }
  }, [designLogs]);

  useEffect(() => {
    if (displayOutput) {
      try {
        const formatedOutput = {};

        for (const [key, value] of Object.entries(designData)) {
          const newKey = key;
          const label = value.label;
          const val = value.value;

          if (val !== undefined && val !== null) {
            formatedOutput[newKey] = { label, val };
          }
        }

        setOutput(formatedOutput);
        console.log("formated Output", formatedOutput);
      } catch (error) {
        console.log(error);
        setOutput(null);
      }
    }
  }, [designData]);

  const handleSubmit = async () => {
    let param = {};
    console.log(allSelected, boltDiameterList);
    if (
      selectedOption === "Column Flange-Beam-Web" ||
      selectedOption === "Column Web-Beam-Web"
    ) {
      if (
        !inputs.beam_section ||
        !inputs.column_section ||
        inputs.beam_section === "Select Section" ||
        inputs.column_section === "Select Section"
      ) {
        alert("Please input all the fields");
        return;
      }
      param = {
        "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
        "Bolt.Diameter": allSelected.bolt_diameter
          ? boltDiameterList
          : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade
          ? propertyClassList
          : inputs.bolt_grade,
        "Bolt.Slip_Factor": inputs.bolt_slip_factor,
        "Bolt.TensionType": inputs.bolt_tension_type,
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        Connectivity: conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": inputs.design_method,
        "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
        "Detailing.Edge_type": inputs.detailing_edge_type,
        "Detailing.Gap": inputs.detailing_gap,
        "Load.Shear": inputs.load_shear || "",
        Material: inputs.connector_material,
        "Member.Supported_Section.Designation": inputs.beam_section,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Designation": inputs.column_section,
        "Member.Supporting_Section.Material": inputs.supporting_material,
        Module: "Seated Angle Connection",
        "Weld.Fab": inputs.weld_fab,
        "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
        "Connector.Angle_List":
          connectorAngleSelect == "All" ? angleList : inputs.angle_list,
        "Connector.Top_Angle":
          connectorTopSelect == "All" ? topAngleList : inputs.topangle_list,
      };
    }
    // else {
    //   if (!inputs.primary_beam || !inputs.secondary_beam) {
    //     alert("Please input all the fields");
    //     return;
    //   }
    //   param = {
    //     "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
    //     "Bolt.Diameter": allSelected.bolt_diameter
    //       ? boltDiameterList
    //       : inputs.bolt_diameter,
    //     "Bolt.Grade": allSelected.bolt_grade
    //       ? propertyClassList
    //       : inputs.bolt_grade,
    //     "Bolt.Slip_Factor": inputs.bolt_slip_factor,
    //     "Bolt.TensionType": inputs.bolt_tension_type,
    //     "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
    //     Connectivity: conn_map[selectedOption],
    //     "Connector.Material": inputs.connector_material,
    //     "Design.Design_Method": inputs.design_method,
    //     "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
    //     "Detailing.Edge_type": inputs.detailing_edge_type,
    //     "Detailing.Gap": inputs.detailing_gap,
    //     "Load.Shear": inputs.load_shear || "",
    //     Material: "E 300 (Fe 440)",
    //     "Member.Supported_Section.Designation": inputs.secondary_beam,
    //     "Member.Supported_Section.Material": inputs.supported_material,
    //     "Member.Supporting_Section.Designation": inputs.primary_beam,
    //     "Member.Supporting_Section.Material": inputs.supporting_material,
    //     Module: "Seated Angle Connection",
    //     "Weld.Fab": inputs.weld_fab,
    //     "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
    //     "Connector.Angle_List":
    //       connectorAngleSelect == "All" ? angleList : inputs.angle_list,
    //     "Connector.Top_Angle":
    //       connectorTopSelect == "All" ? topAngleList : inputs.topangle_list,
    //   };
    // }

    console.log("Final Params: ", param);

    try {
      await createDesign(param, "Seated-Angle-Connection");
    } catch (error) {
      console.error("API Error:", error);
    }
    setDisplayOutput(true);

    setLoading(true);
    setModelKey((prev) => prev + 1); //Forces model to reload
  };
  // Create design report ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const [CreateDesignReportBool, setCreateDesignReportBool] = useState(false);
  const [designReportInputs, setDesignReportInputs] = useState({
    companyName: "Your company",
    groupTeamName: "Your team",
    designer: "You",
    projectTitle: "",
    subtitle: "",
    jobNumber: "1",
    client: "Someone else",
    additionalComments: "No comments",
    companyLogo: null,
    companyLogoName: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (file) => {
    setSelectedFile(file);
  };

  const handleUseProfile = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const contents = event.target.result;
        const lines = contents.split("\n");

        lines.forEach((line) => {
          const [field, value] = line.split(":");
          const trimmedField = field.trim();
          const trimmedValue = value.trim();

          if (trimmedField === "CompanyName") {
            setCompanyName(trimmedValue);
          } else if (trimmedField === "Designer") {
            setDesigner(trimmedValue);
          } else if (trimmedField === "Group/TeamName") {
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

    const blob = new Blob([profileSummary], {
      type: "text/plain;charset=utf-8",
    });
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
    if (renderCadModel && cadModelPaths) {
      console.log("Received raw .obj data:", cadModelPaths);
      setRenderBoolean(true);
      setLoading(false);
    } else {
      setRenderBoolean(false);
    }
  }, [renderCadModel, cadModelPaths]);

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

    return csvData.join("\n");
  };

  const handleOk = () => {
    // Handle OK button logic
    if (!output) {
      alert("Please submit the design first.");
      return;
    }
    console.log("designreportInputs : ", designReportInputs);
    createDesignReport(designReportInputs);
    handleCancelProfile();
  };

  const handleCancelProfile = () => {
    // Handle Cancel button logic
    setDesignReportInputs({
      companyName: "Your company",
      groupTeamName: "Your team",
      designer: "You",
      projectTitle: "",
      subtitle: "",
      jobNumber: "1",
      client: "Someone else",
      additionalComments: "No comments",
      companyLogo: null,
      companyLogoName: "",
    });
    setCreateDesignReportBool(false);
  };

  const saveOutput = () => {
    let data = {};

    if (
      selectedOption === "Column Flange-Beam-Web" ||
      selectedOption === "Column Web-Beam-Web"
    ) {
      if (!inputs.beam_section || !inputs.column_section || !output) {
        alert("Please submit the design first.");
        return;
      }
      data = {
        "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
        "Bolt.Diameter": allSelected.bolt_diameter
          ? boltDiameterList
          : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade
          ? propertyClassList
          : inputs.bolt_grade,
        "Bolt.Slip_Factor": inputs.bolt_slip_factor,
        "Bolt.TensionType": inputs.bolt_tension_type,
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        Connectivity: conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": inputs.design_method,
        "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
        "Detailing.Edge_type": inputs.detailing_edge_type,
        "Detailing.Gap": inputs.detailing_gap,
        "Load.Shear": inputs.load_shear || "",
        Material: "E 250 (Fe 410 W)A",
        "Member.Supported_Section.Designation": inputs.beam_section,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Designation": inputs.column_section,
        "Member.Supporting_Section.Material": inputs.supporting_material,
        Module: "Seated Angle Connection",
        "Weld.Fab": inputs.weld_fab,
        "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
        "Connector.Angle_List":
          connectorAngleSelect == "All" ? angleList : inputs.angle_list,
        "Connector.Top_Angle":
          connectorTopSelect == "All" ? topAngleList : inputs.topangle_list,
      };
    } else {
      if (!inputs.primary_beam || !inputs.secondary_beam || !output) {
        alert("Please submit the design first.");
        return;
      }
      data = {
        "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
        "Bolt.Diameter": allSelected.bolt_diameter
          ? boltDiameterList
          : inputs.bolt_diameter,
        "Bolt.Grade": allSelected.bolt_grade
          ? propertyClassList
          : inputs.bolt_grade,
        "Bolt.Slip_Factor": inputs.bolt_slip_factor,
        "Bolt.TensionType": inputs.bolt_tension_type,
        "Bolt.Type": inputs.bolt_type.replaceAll("_", " "),
        Connectivity: conn_map[selectedOption],
        "Connector.Material": inputs.connector_material,
        "Design.Design_Method": inputs.design_method,
        "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
        "Detailing.Edge_type": inputs.detailing_edge_type,
        "Detailing.Gap": inputs.detailing_gap,
        "Load.Shear": inputs.load_shear || "",
        Material: "E 300 (Fe 440)",
        "Member.Supported_Section.Designation": inputs.secondary_beam,
        "Member.Supported_Section.Material": inputs.supported_material,
        "Member.Supporting_Section.Designation": inputs.primary_beam,
        "Member.Supporting_Section.Material": inputs.supporting_material,
        Module: "Seated Angle Connection",
        "Weld.Fab": inputs.weld_fab,
        "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
        "Connector.Angle_List":
          connectorAngleSelect == "All" ? angleList : inputs.angle_list,
        "Connector.Top_Angle":
          connectorTopSelect == "All" ? topAngleList : inputs.topangle_list,
      };
    }

    for (const key in output) {
      if (output.hasOwnProperty(key)) {
        const { label, val } = output[key];
        if (label && val !== undefined && val !== null) {
          const safeLabel = label.replace(/\s+/g, "_");
          data[`${key}.${safeLabel}`] = val;
        }
      }
    }

    data = convertToCSV(data);
    const csvContent =
      "data:text/csv;charset=utf-8," + encodeURIComponent(data);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "output.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Spacing model
  const [spacingModel, setSpacingModel] = useState(true);

  const handleDialogSpacing = (value) => {
    alert("ji");

    if (value === "Spacing") {
      setSpacingModel(true);
    } else {
      setSpacingModel(false);
    }
  };

  const handleReset = () => {
    if (
      conn_map[selectedOption] == "Column Flange-Beam Web" ||
      conn_map[selectedOption] == "Column Web-Beam Web"
    ) {
      // resetting the inputs
      setInputs({
        bolt_diameter: inputs.bolt_diameter,
        bolt_grade: inputs.bolt_grade,
        bolt_type: "Bearing Bolt",
        connector_material: inputs.connector_material,
        load_shear: "",
        module: "Seated Angle Connection",
        beam_section: "Select Section",
        column_section: "Select Section",
      });
    } else if (conn_map[selectedOption] == "Beam-Beam") {
      setInputs({
        bolt_diameter: inputs.bolt_diameter,
        bolt_grade: inputs.bolt_grade,
        bolt_type: "Bearing Bolt",
        connector_material: inputs.connector_material,
        load_shear: "",
        module: "Seated Angle Connection",
        primary_beam: "JB 200",
        secondary_beam: "JB 150",
      });
    }

    // reset setAllSelected
    setAllSelected({
      bolt_diameter: true,
      bolt_grade: true,
    });

    setBoltDiameterSelect("All");
    setPropertyClassSelect("All");
    handleSelectChangePropertyClass("All"); // for property Class
    handleSelectChangeBoltBeam("All"); // for bolt diameter

    // reset CAD model
    setRenderBoolean(false);

    // reset Output values dock
    setOutput(null);
  };

  // Diameter mm
  //  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDiameterNewItems, setSelectedDiameterNewItems] = useState([]);

  //for seated angle list
  const [selectedAngleListItems, setselectedAngleListItems] = useState([]);

  //for top angle list
  const [selectedTopAngleItems, setselectedTopAngleItems] = useState([]);

  const handleTransferChangeInAngleList = (nextTargetKeys) => {
    setselectedAngleListItems(nextTargetKeys);
    setInputs({ ...inputs, angle_list: nextTargetKeys });
  };

  const handleTransferChangeInTopAngle = (nextTargetKeys) => {
    setselectedTopAngleItems(nextTargetKeys);
    setInputs({ ...inputs, topangle_list: nextTargetKeys });
  };

  const handleTransferChange = (nextTargetKeys) => {
    setSelectedDiameterNewItems(nextTargetKeys);
    setInputs({ ...inputs, bolt_diameter: nextTargetKeys });
  };
  //
  // propertyClassList
  const [selectedpropertyClassListItems, setSelectedpropertyClassListItems] =
    useState([]);

  const handleTransferChangeInPropertyClassList = (nextTargetKeys) => {
    setSelectedpropertyClassListItems(nextTargetKeys);
    setInputs({ ...inputs, bolt_grade: nextTargetKeys });
  };
  //

  // Get local Stored Items

  // const storedCompanyLogo = JSON.parse(localStorage.getItem('companyLogo'));
  // const storedCompanyLogoName = localStorage.getItem('companyLogoName');
  // Image file changehandler
  const handleImageFileChange = (event) => {
    // get the selected file from the event
    const imageFile = event.target.files[0];
    let imageFileName = event.target.files[0].name;

    // Add local storage code
    // localStorage.setItem('companyLogo',imageFile);
    // localStorage.setItem('companyLogoName', imageFileName);

    setDesignReportInputs({
      ...designReportInputs,
      companyLogo: imageFile,
      companyLogoName: imageFileName,
    });
  };

  // menu actions
  useEffect(() => {
    const designPrefHandler = (e) => {
      if (e.altKey && e.key == "p") {
        setDesignPrefModalStatus(true);
      }
    };

    window.addEventListener("keydown", designPrefHandler);
    return () => {
      setDesignPrefModalStatus(false);
      window.removeEventListener("keydown", designPrefHandler);
    };
  }, []);

  const [isDesignPreferencesModelOpen, setDesignPreferencesModel] =
    useState(false);

  const closeDesignPreferencesModel = () => {
    setDesignPreferencesModel(false);
  };

  useEffect(() => {
    if (
      conn_map[selectedOption] == "Column Flange-Beam Web" ||
      conn_map[selectedOption] == "Column Web-Beam Web"
    ) {
      if (inputs.column_section != "" && inputs.beam_section != "") {
        getDesingPrefData({
          supported_section: inputs.beam_section,
          supporting_section: inputs.column_section,
          connectivity: conn_map[selectedOption].split(" ").join("-"),
        });
      }
    } else if (conn_map[selectedOption] == "Beam-Beam") {
      getDesingPrefData({
        supported_section: inputs.secondary_beam,
        supporting_section: inputs.primary_beam,
        connectivity: conn_map[selectedOption],
      });
    }
  }, [
    inputs.column_section,
    inputs.beam_section,
    inputs.primary_beam,
    inputs.secondary_beam,
    selectedOption,
  ]);

  const obtainStoredCompanyLogoImages = () => {
    console.log("obtain stored company logo images");

    // obtaining the companyLogo
    if (
      localStorage.getItem("companyLogo") &&
      localStorage.getItem("companyLogoName")
    ) {
      let storedCompanyLogo = localStorage.getItem("companyLogo");
      storedCompanyLogo = JSON.parse(storedCompanyLogo);
      // stored CompanyLogo is an array, it comtains the actual file
      // the file is encoded. decode it as given below
      // let companyLogo = base64_decode(storedCompanyLogo[0])

      let storedCompanyLogoName = localStorage.getItem("companyLogoName");
      storedCompanyLogoName = JSON.parse(storedCompanyLogoName);
      // stored companylogoName is an array, it contains the name of the files
      // the fileNaeme is encoded. decode it as given belows
      // let companyLogoName = base64_decode(storedCompanyLogoName[0])

      // an image consists of 2 parts, the companyLogo and the companyLogoName
      // so the 0th index image will be formed by ( storedCompanyLogo[0] and storedCompanyLogoName[0] )
      // the 1st index image will be formed by ( storedCompanyLogo[1] and storedCompanyLogoName[1] )
    }
  };

  // console.log(angleList);
  // console.log("topAngleList:", topAngleList);
  const navigate = useNavigate();
  return (
    <>
      <div className="module_base">
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
              triggerScreenshotCapture={triggerScreenshotCapture}
            />
          ))}

          {displaySaveInputPopup && (
            <span id="save-input-style" style={{ marginTop: "18px" }}>
              <strong>
                Saved input file as &quot; {saveInputFileName} &quot;
              </strong>
            </span>
          )}

          <div className="element">
            <div
              className="home-btn"
              onClick={() => {
                navigate("/home");
              }}
            >
              Home
            </div>
          </div>
        </div>
        {/* <KeyPressListener /> */}

        {/* Main Body of code  */}
        <div className="superMainBody">
          {/* Left */}
          <div className="InputDock">
            <p>Input Dock</p>
            <div className="subMainBody scroll-data">
              {/* Section 1 Start */}
              <h3>Connecting Members</h3>
              <div className="component-grid">
                <div className="component-grid-align">
                  <h4>Connectivity</h4>
                  <Select onSelect={handleSelectChange} value={selectedOption}>
                    {connectivityList.map((item, index) => (
                      <Option key={index} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="connectionimg">
                  <img
                    src={imageSource}
                    alt="Component"
                    height="100px"
                    width="100px"
                  />
                </div>

                {selectedOption === "Beam-Beam" ? (
                  <>
                    <div className="component-grid-align">
                      <h4>Primary Beam*</h4>
                      <Select
                        value={inputs.primary_beam || beamList[2]}
                        onSelect={(value) =>
                          setInputs({ ...inputs, primary_beam: value })
                        }
                      >
                        {beamList.map((item, index) => (
                          <Option key={index} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div className="component-grid-align">
                      <h4>Secondary Beam*</h4>
                      <Select
                        value={inputs.secondary_beam || beamList[0]}
                        onSelect={(value) =>
                          setInputs({ ...inputs, secondary_beam: value })
                        }
                      >
                        {beamList.map((item, index) => (
                          <Option key={index} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="component-grid-align">
                      <h4>Column Section*</h4>
                      <Select
                        value={inputs.column_section || columnList[0]}
                        onSelect={(value) =>
                          setInputs({ ...inputs, column_section: value })
                        }
                      >
                        {columnList.map((item, index) => (
                          <Option key={index} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div className="component-grid-align">
                      <h4>Beam Section*</h4>
                      <Select
                        value={inputs.beam_section || beamList[28]}
                        onSelect={(value) =>
                          setInputs({ ...inputs, beam_section: value })
                        }
                      >
                        {beamList.map((item, index) => (
                          <Option key={index} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </>
                )}

                <div className="component-grid-align">
                  <h4>Material</h4>
                  <Select
                    value={inputs.connector_material || materialList[0].Grade}
                    onSelect={(value) => {
                      if (value == -1) {
                        setShowModal(true);
                        return;
                      }
                      const material = materialList.find(
                        (item) => item.id === value
                      );
                      console.log(material);
                      setInputs({
                        ...inputs,
                        connector_material: material.Grade,
                      });
                    }}
                  >
                    {materialList.map((item, index) => (
                      <Option key={index} value={item.id}>
                        {item.Grade}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              {/* Section End */}
              {/* Section Start  */}
              <h3>Factored Loads</h3>
              <div className="component-grid">
                <div className="component-grid-align">
                  <h4>Shear Force(kN)</h4>
                  <Input
                    type="text"
                    name="ShearForce"
                    onInput={(event) => {
                      event.target.value = event.target.value.replace(
                        /[^0-9.]/g,
                        ""
                      );
                    }}
                    pattern="\d*"
                    value={inputs.load_shear}
                    onChange={(event) =>
                      setInputs({ ...inputs, load_shear: event.target.value })
                    }
                  />
                </div>
              </div>
              {/* Section End */}
              {/* Section Start */}
              <h3>Bolt</h3>
              <div className="component-grid">
                <div className="component-grid-align">
                  <h4>Diameter(mm)</h4>
                  <Select
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
                  width={500}
                  height={500}
                >
                  <div className="popUp">
                    <h3>Customized</h3>
                    <Transfer
                      dataSource={boltDiameterList
                        .sort((a, b) => Number(a) - Number(b))
                        .map((label) => ({
                          key: label,
                          label: <h5>{label}</h5>,
                        }))}
                      targetKeys={selectedDiameterNewItems}
                      onChange={handleTransferChange}
                      render={(item) => item.label}
                      titles={["Available", "Selected"]}
                      showSearch
                      listStyle={{ height: 400, width: 300 }}
                    />
                  </div>
                </Modal>

                <div className="component-grid-align">
                  <h4>Type</h4>
                  <Select
                    value={inputs.bolt_type}
                    onSelect={(value) =>
                      setInputs({ ...inputs, bolt_type: value })
                    }
                  >
                    <Option value="Bearing_Bolt">Bearing Bolt</Option>
                    <Option value="Friction_Grip_Bolt">
                      Friction Grip Bolt
                    </Option>
                  </Select>
                </div>

                <div className="component-grid-align">
                  <h4>Property Class</h4>
                  <Select
                    onSelect={handleSelectChangePropertyClass}
                    value={propertyClassSelect}
                  >
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>

                <Modal
                  open={isModalpropertyClassListOpen}
                  onCancel={() => setModalpropertyClassListOpen(false)}
                  footer={null}
                  width={500}
                  height={500}
                >
                  <div className="popUp">
                    <h3>Customized</h3>
                    <Transfer
                      dataSource={propertyClassList
                        .sort((a, b) => Number(a) - Number(b))
                        .map((label) => ({
                          key: label,
                          label: <h5>{label}</h5>,
                        }))}
                      targetKeys={selectedpropertyClassListItems}
                      onChange={handleTransferChangeInPropertyClassList}
                      render={(item) => item.label}
                      titles={["Available", "Selected"]}
                      showSearch
                      listStyle={{ height: 400, width: 300 }}
                    />
                  </div>
                </Modal>
              </div>
              {/* Section End */}
              <h3>Angle Section</h3>
              <div className="component-grid">
                <div className="component-grid-align">
                  <h4>Cleat section* </h4>
                  <Select
                    onSelect={handleAllSelectAngle}
                    value={connectorAngleSelect}
                  >
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>

                <Modal
                  open={angleModal}
                  onCancel={() => setAngleModal(false)}
                  footer={null}
                  width={500}
                  height={500}
                >
                  <div className="popUp">
                    <h3>Customized</h3>
                    <Transfer
                      dataSource={angleList
                        .sort((a, b) =>
                          a.toLowerCase().localeCompare(b.toLowerCase())
                        )
                        .map((label) => ({
                          key: label,
                          label: <h5>{label}</h5>,
                        }))}
                      targetKeys={selectedAngleListItems}
                      onChange={handleTransferChangeInAngleList}
                      render={(item) => item.label}
                      titles={["Available", "Selected"]}
                      showSearch
                      listStyle={{ height: 400, width: 300 }}
                    />
                  </div>
                </Modal>

                <div className="component-grid-align">
                  <h4>Top section* </h4>
                  <Select
                    onSelect={handleAllSelectTopAngle}
                    value={connectorTopSelect}
                  >
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>

                <Modal
                  open={topModal}
                  onCancel={() => setTopModal(false)}
                  footer={null}
                  width={500}
                  height={500}
                >
                  <div className="popUp">
                    <h3>Customized</h3>
                    <Transfer
                      dataSource={topAngleList
                        .sort((a, b) =>
                          a.toLowerCase().localeCompare(b.toLowerCase())
                        )
                        .map((label) => ({
                          key: label,
                          label: <h5>{label}</h5>,
                        }))}
                      targetKeys={selectedTopAngleItems}
                      onChange={handleTransferChangeInTopAngle}
                      render={(item) => item.label}
                      titles={["Available", "Selected"]}
                      showSearch
                      listStyle={{ height: 400, width: 300 }}
                    />
                  </div>
                </Modal>
              </div>
            </div>
            <div className="inputdock-btn">
              <Input
                type="button"
                value="Reset"
                onClick={() => handleReset()}
              />
              <Input
                type="button"
                value="Design"
                onClick={() => handleSubmit()}
              />
            </div>
          </div>
          {/* Middle */}
          <div className="superMainBody_mid">
            <div className="options-container">
              {options.map((option) => (
                <div
                  key={option}
                  className="option-wrapper"
                  onClick={() => setSelectedView(option)}
                >
                  <div
                    className={`option-box ${
                      selectedView === option ? "selected" : ""
                    }`}
                  ></div>
                  <span className="option-label">{option}</span>
                </div>
              ))}
            </div>
            {loading ? (
              <div className="modelLoading">
                <p>Loading Model...</p>
              </div>
            ) : renderBoolean ? (
              <div
                className="cadModel"
              >
                <Canvas
                  gl={{ antialias: true }}
                  style={{ background: "#ADD8E6" }}
                  camera={{
                    position: [10, 0, 10],
                    fov: 50,
                    near: 0.1,
                    far: 1000,
                  }}
                >
                  <Suspense
                    fallback={
                      <Html>
                        <p>Loading 3D Model...</p>
                      </Html>
                    }
                  >
                    <Model
                      modelPaths={cadModelPaths}
                      selectedView={selectedView}
                      key={modelKey}
                    />
                    <ScreenshotCapture
                      screenshotTrigger={screenshotTrigger}
                      setScreenshotTrigger={setScreenshotTrigger}
                      selectedView={selectedView}
                    />
                  </Suspense>
                </Canvas>
              </div>
            ) : (
              <div className="modelback"></div>
            )}
            <Logs logs={logs} />
          </div>
          {/* Right */}
          <div className="superMain_right">
            {<SeatedAngleOutputDock output={output} />}
            <div className="outputdock-btn">
              <Input
                type="button"
                value="Create Design Report"
                onClick={handleCreateDesignReport}
              />
              <Input type="button" value="Save Output" onClick={saveOutput} />

              <Modal
                open={CreateDesignReportBool}
                onCancel={handleCancel}
                footer={null}
                className="designModal"
              >
                <p>Design Report Summary</p>
                <div className="design-report-form">
                  <Row
                    gutter={[16, 16]}
                    align="middle"
                    style={{ marginBottom: "5px" }}
                  >
                    <Col span={6}>
                      <label>Company Name:</label>
                    </Col>
                    <Col span={18}>
                      <Input
                        id="companyName"
                        value={designReportInputs.companyName}
                        onChange={(e) =>
                          setDesignReportInputs({
                            ...designReportInputs,
                            companyName: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>
                  <Row
                    gutter={[16, 16]}
                    align="middle"
                    style={{ marginBottom: "5px" }}
                  >
                    <Col span={6}>
                      <label>Company Logo : </label>
                    </Col>
                    <Col span={18}>
                      <input
                        type="file"
                        accept="image/png , image/jpeg , image/jpg"
                        value={setDesignReportInputs.companyLogoName}
                        onChange={handleImageFileChange}
                      />
                    </Col>
                  </Row>
                  <Row
                    gutter={[16, 16]}
                    align="middle"
                    style={{ marginBottom: "5px" }}
                  >
                    <Col span={6}>
                      <label>Group/Team Name:</label>
                    </Col>
                    <Col span={18}>
                      <Input
                        id="groupTeamName"
                        value={designReportInputs.groupTeamName}
                        onChange={(e) =>
                          setDesignReportInputs({
                            ...designReportInputs,
                            groupTeamName: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>
                  <Row
                    gutter={[16, 16]}
                    align="middle"
                    style={{ marginBottom: "5px" }}
                  >
                    <Col span={6}>
                      <label>Designer:</label>
                    </Col>
                    <Col span={18}>
                      <Input
                        id="designer"
                        value={designReportInputs.designer}
                        onChange={(e) =>
                          setDesignReportInputs({
                            ...designReportInputs,
                            designer: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>
                  {/* <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
                    <Upload beforeUpload={handleFileChange} showUploadList={false}>
                      <Button onClick={handleUseProfile} icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                    <Button type="button" onClick={handleSaveProfile}>Save Profile</Button>
                  </div> */}
                  <Row
                    gutter={[16, 16]}
                    align="middle"
                    style={{ marginBottom: "5px" }}
                  >
                    <Col span={6}>
                      <label>Project Title:</label>
                    </Col>
                    <Col span={18}>
                      <Input
                        value={designReportInputs.projectTitle}
                        onChange={(e) =>
                          setDesignReportInputs({
                            ...designReportInputs,
                            projectTitle: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>
                  <Row
                    gutter={[16, 16]}
                    align="middle"
                    style={{ marginBottom: "5px" }}
                  >
                    <Col span={6}>
                      <label>Subtitle:</label>
                    </Col>
                    <Col span={18}>
                      <Input
                        value={designReportInputs.subtitle}
                        onChange={(e) =>
                          setDesignReportInputs({
                            ...designReportInputs,
                            subtitle: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>
                  <Row
                    gutter={[16, 16]}
                    align="middle"
                    style={{ marginBottom: "5px" }}
                  >
                    <Col span={6}>
                      <label>Job Number:</label>
                    </Col>
                    <Col span={18}>
                      <Input
                        value={designReportInputs.jobNumber}
                        onChange={(e) =>
                          setDesignReportInputs({
                            ...designReportInputs,
                            jobNumber: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>
                  <Row
                    gutter={[16, 16]}
                    align="middle"
                    style={{ marginBottom: "5px" }}
                  >
                    <Col span={6}>
                      <label>Client:</label>
                    </Col>
                    <Col span={18}>
                      <Input
                        value={designReportInputs.client}
                        onChange={(e) =>
                          setDesignReportInputs({
                            ...designReportInputs,
                            client: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>
                  <Row
                    gutter={[16, 16]}
                    align="middle"
                    style={{ marginBottom: "5px" }}
                  >
                    <Col span={6}>
                      <label>Additional Comments:</label>
                    </Col>
                    <Col span={18}>
                      <Input.TextArea
                        value={designReportInputs.additionalComments}
                        onChange={(e) =>
                          setDesignReportInputs({
                            ...designReportInputs,
                            additionalComments: e.target.value,
                          })
                        }
                        rows={10}
                      />
                    </Col>
                  </Row>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
                    <Button type="button" onClick={handleOk} className="btn">
                      OK
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelProfile}
                      className="btn"
                    >
                      Cancel
                    </Button>
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

      {displayPDF ? (
        <div
          style={{
            border: "1px solid rgba(0, 0, 0, 0.3)",
            height: "750px",
            position: "absolute",
          }}
        >
          <Viewer
            fileUrl={`http://localhost:5173/00335c94-1b3f-47f1-959e-6b96475dfd38`}
          />
        </div>
      ) : (
        <br />
      )}
    </>
  );
}

export default SeatedAngle;
