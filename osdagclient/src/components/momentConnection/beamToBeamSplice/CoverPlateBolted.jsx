/* eslint-disable no-unused-vars */
import "../../../App.css";
import { Suspense, useContext, useEffect, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Select, Input, Modal, Button, Row, Col, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import Logs from "../../Logs";
import Model from "./btobRender";

import { Canvas } from "@react-three/fiber";
import { ModuleContext } from "../../../context/ModuleState";
import { Viewer } from "@react-pdf-viewer/core";
import { Transfer } from "antd";
// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Html, PerspectiveCamera } from "@react-three/drei";
import useViewCamera from "./btobViewCamera";

// import assets
import DesignPrefSections from "../../DesignPrefSections";
import CustomSectionModal from "../../CustomSectionModal";

import CoverPlateBoltedOutputDock from "../../CoverPlateBoltedOutputDock";
import MomentDropdownMenu from "../../MomentDropDownMenu";
import ScreenshotCapture from "../../ScreenShotCapture";

const { Option } = Select;

const MenuItems = [
  {
    label: "File",
    dropdown: [
      { name: "Load Input", shortcut: "Ctrl+L" },
      { name: "Download Input", shortcut: "Ctrl+D" },
      { name: "Save Input", shortcut: "Alt+N" },
      { name: "Save Log Messages", shortcut: "Alt+M" },
      { name: "Create Design Report", shortcut: "Alt+C" },
      { name: "Save 3D Model", shortcut: "Alt+3" },
      { name: "Save Cad Image", shortcut: "Alt+1" },
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
      { name: "FinePlate" },
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

function CoverPlateBolted() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [output, setOutput] = useState(null);
  const [logs, setLogs] = useState(null);
  const [displayOutput, setDisplayOutput] = useState();
  const [boltDiameterSelect, setBoltDiameterSelect] = useState("All");
  const [flangeThicknessSelect, setFlangeThicknessSelect] = useState("All");
  const [webThicknessSelect, setWebThicknessSelect] = useState("All");
  const [propertyClassSelect, setPropertyClassSelect] = useState("All");
  const [designPrefModalStatus, setDesignPrefModalStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [displaySaveInputPopup, setDisplaySaveInputPopup] = useState(false);
  const [saveInputFileName, setSaveInputFileName] = useState("");
  const {
    beamList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    designLogs,
    designData,
    displayPDF,
    renderCadModel,
    cadModelPaths,
    createSession,
    createDesign,
    createDesignReport,
    getSupportedData,
    deleteSession,
    resetModuleState,
  } = useContext(ModuleContext);

  if (displaySaveInputPopup)
    [setTimeout(() => setDisplaySaveInputPopup(false), 4000)];

  const [renderBoolean, setRenderBoolean] = useState(false);
  const [modelKey, setModelKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState("Model");
  const options = ["Model", "Beam", "Connector"];
  const { position: cameraPos, fov } = useViewCamera(
    "CoverPlateBolted",
    selectedView
  );
  const cameraRef = useRef();
  const [screenshotTrigger, setScreenshotTrigger] = useState(false);
  const triggerScreenshotCapture = () => {
    setScreenshotTrigger(true);
  };

  // Add a comprehensive reset function that resets both local and context state
  const resetToDefaultState = () => {

    if (resetModuleState) {
      resetModuleState();
    }

    setRenderBoolean(false);
    setModelKey(0);
    setOutput(null);
    setLogs(null);
    setDisplayOutput(false);
    setLoading(false);

    setInputs({
      bolt_hole_type: "Standard",
      bolt_diameter: [],
      bolt_grade: [],
      bolt_slip_factor: "0.3",
      bolt_tension_type: "Pre-tensioned",
      bolt_type: "Bearing Bolt",
      flange_plate_preferences: "Outside",
      flange_plate_thickness: [],
      connector_material: "E 250 (Fe 410 W)A",
      web_plate_thickness: [],
      design_method: "Limit State Design",
      detailing_corr_status: "No",
      detailing_edge_type: "Sheared or hand flame cut",
      detailing_gap: "3",
      load_axial: "100",
      load_moment: "70",
      load_shear: "50",
      material: "E 250 (Fe 410 W)A",
      member_designation: "MB 300",
      member_material: "E 250 (Fe 410 W)A",
      module: "Beam-to-Beam Cover Plate Bolted Connection",
    });

    setBoltDiameterSelect("All");
    setFlangeThicknessSelect("All");
    setWebThicknessSelect("All");
    setPropertyClassSelect("All");
    setAllSelected({
      flange_plate_thickness: true,
      web_plate_thickness: true,
      bolt_diameter: true,
      bolt_grade: true,
    });

    setModalOpen(false);
    setModalpropertyClassListOpen(false);
    setFlangePlateThicknessModal(false);
    setWebPlateThicknessModal(false);
    setDesignPrefModalStatus(false);
    setShowModal(false);
    setConfirmationModal(false);
    setDisplaySaveInputPopup(false);
    setCreateDesignReportBool(false);

    setSelectedDiameterNewItems([]);
    setSelectedpropertyClassListItems([]);
    setSelectedFlangePlateThicknessItems([]);
    setSelectedWebPlateThicknessItems([]);

    setSelectedView("Model");
    setScreenshotTrigger(false);

  };

  //simple function to check unsaved work
  const hasUnsavedWork = () => {
    return !!(output || renderBoolean);
  };

  const [inputs, setInputs] = useState({
    bolt_hole_type: "Standard",
    bolt_diameter: [],
    bolt_grade: [],
    bolt_slip_factor: "0.3",
    bolt_tension_type: "Pre-tensioned",
    bolt_type: "Bearing Bolt",
    flange_plate_preferences: "Outside",
    flange_plate_thickness: [],
    connector_material: "E 250 (Fe 410 W)A",
    web_plate_thickness: [],
    design_method: "Limit State Design",
    detailing_corr_status: "No",
    detailing_edge_type: "Sheared or hand flame cut",
    detailing_gap: "3",
    load_axial: "100",
    load_moment: "70",
    load_shear: "50",
    material: "E 250 (Fe 410 W)A",
    member_designation: "MB 300",
    member_material: "E 250 (Fe 410 W)A",
    module: "Beam-to-Beam Cover Plate Bolted Connection",
  });

  //navigation and reseting
  const [confirmationType, setConfirmationType] = useState("reset");
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [navigationSource, setNavigationSource] = useState(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isLoadingModalVisible, setIsLoadingModalVisible] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");

  useEffect(() => {
    //Protect against browser refresh and direct URL changes
    const handleBeforeUnload = (event) => {
      if (hasUnsavedWork()) {
        const message =
          "You have unsaved design progress. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    //Protect against browser back button
    const handlePopState = (event) => {
      if (hasUnsavedWork() && !allowNavigation) {
        // Prevent back navigation by pushing current state back
        window.history.pushState(
          null,
          "",
          "/design/connections/beam-to-beam-splice/cover_plate_bolted"
        );

        // Show confirmation modal and mark as back navigation
        setConfirmationType("navigation");
        setNavigationSource("back");
        setShowResetConfirmation(true);

        console.log("BACK BUTTON: Prevented navigation due to unsaved work");
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [output, renderBoolean, allowNavigation]);

  // Separate useEffect to manage history state
  useEffect(() => {
    // Only add history entry when there's unsaved work
    if (hasUnsavedWork()) {
      window.history.pushState(null, "", window.location.pathname);
    }
  }, [output, renderBoolean]);

  const [isModalpropertyClassListOpen, setModalpropertyClassListOpen] =
    useState(false);
  const [flangePlateThicknessModal, setFlangePlateThicknessModal] =
    useState(false);
  const [webPlateThicknessModal, setWebPlateThicknessModal] = useState(false);
  const [allSelected, setAllSelected] = useState({
    flange_plate_thickness: true,
    web_plate_thickness: true,
    bolt_diameter: true,
    bolt_grade: true,
  });

  const [renderBoolean, setRenderBoolean] = useState(false);
  const [modelKey, setModelKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState("Model");
  const options = ["Model", "Beam", "Connector"];
  const { position: cameraPos, fov } = useViewCamera(
    "CoverPlateBolted",
    selectedView
  );
  const cameraRef = useRef();
  const [screenshotTrigger, setScreenshotTrigger] = useState(false);
  const triggerScreenshotCapture = () => {
    setScreenshotTrigger(true);
  };

  useEffect(() => {
    // Reset to default state when component mounts
    resetToDefaultState();

    // Small delay before new session
    setTimeout(() => {
      console.log("COVERPLATE: Creating new session");
      createSession("Cover Plate Bolted Connection");
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (
        window.location.pathname !==
        "/design/connections/beam-to-beam-splice/cover_plate_bolted"
      ) {
        // Only do cleanup if navigation is allowed or no unsaved work
        if (!hasUnsavedWork() || allowNavigation) {
          console.log("CLEANUP: Proceeding with session deletion");
          deleteSession("Cover Plate Bolted Connection");
          setTimeout(() => {
            resetToDefaultState();
          }, 50);
          setAllowNavigation(false);
        }
      }
    };
  }, [allowNavigation]);

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

  const handleAllSelectFlangePT = (value) => {
    if (value === "Customized") {
      // check, if the plate_thickness already has a value, then set it to that value
      // else, set it to an empty list
      if (inputs.flange_plate_thickness.length != 0) {
        setInputs({
          ...inputs,
          flange_plate_thickness: inputs.flange_plate_thickness,
        });
      } else {
        // if the length is 0 , then set it to an empty array
        setInputs({ ...inputs, flange_plate_thickness: [] });
      }
      setFlangeThicknessSelect("Customized");
      setAllSelected({ ...allSelected, flange_plate_thickness: false });
      setFlangePlateThicknessModal(true);
    } else {
      setFlangeThicknessSelect("All");
      setAllSelected({ ...allSelected, flange_plate_thickness: true });
      setFlangePlateThicknessModal(false);
    }
  };

  const handleAllSelectWebPT = (value) => {
    if (value === "Customized") {
      setInputs({
        ...inputs,
        web_plate_thickness:
          inputs.web_plate_thickness.length !== 0
            ? inputs.web_plate_thickness
            : [],
      });
      setWebThicknessSelect("Customized");
      setAllSelected({ ...allSelected, web_plate_thickness: false });
      setWebPlateThicknessModal(true);
    } else {
      setWebThicknessSelect("All");
      setAllSelected({ ...allSelected, web_plate_thickness: true });
      setWebPlateThicknessModal(false);
    }
  };

  const handleSelectChange = (value) => {
    setOutput(null);
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
        console.log(formatedOutput);
      } catch (error) {
        console.log(error);
        setOutput(null);
      }
    }
  }, [designData]);

  const handleSubmit = async () => {
    let param = {};
    console.log(allSelected);
    {
      if (
        !inputs.member_designation ||
        inputs.member_designation === "Select Section" ||
        inputs.load_shear === ""
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
        "Connector.Flange_Plate.Preferences": inputs.flange_plate_preferences,
        "Connector.Flange_Plate.Thickness_list":
          allSelected.flange_plate_thickness
            ? thicknessList
            : inputs.flange_plate_thickness,
        "Connector.Material": inputs.connector_material,
        "Connector.Web_Plate.Thickness_List": allSelected.web_plate_thickness
          ? thicknessList
          : inputs.web_plate_thickness,
        "Design.Design_Method": inputs.design_method,
        "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
        "Detailing.Edge_type": inputs.detailing_edge_type,
        "Detailing.Gap": inputs.detailing_gap,
        "Load.Axial": inputs.load_axial || "",
        "Load.Moment": inputs.load_moment || "",
        "Load.Shear": inputs.load_shear || "",
        Material: inputs.material,
        "Member.Designation": inputs.member_designation,
        "Member.Material": inputs.member_material,
        Module: "Beam-to-Beam Cover Plate Bolted Connection",
      };
      console.log(param);

      setIsLoadingModalVisible(true);
      setLoadingStage("Generating design calculations...");

      createDesign(param, "Cover-Plate-Bolted-Connection");
      setDisplayOutput(true);
      setModelKey((prev) => prev + 1); //Forces model to reload
    }
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

      // Hide loading modal when model is ready
      setTimeout(() => {
        setIsLoadingModalVisible(false);
        setLoadingStage("");
      }, 500);
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

    {
      if (
        !inputs.member_designation ||
        inputs.member_designation === "Select Section" ||
        inputs.load_shear === ""
      ) {
        alert("Please input all the fields");
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
        "Connector.Flange_Plate.Preferences": inputs.flange_plate_preferences,
        "Connector.Flange_Plate.Thickness_list":
          allSelected.flange_plate_thickness
            ? thicknessList
            : inputs.flange_plate_thickness,
        "Connector.Material": inputs.connector_material,
        "Connector.Web_Plate.Thickness_List": allSelected.web_plate_thickness
          ? thicknessList
          : inputs.web_plate_thickness,
        "Design.Design_Method": inputs.design_method,
        "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
        "Detailing.Edge_type": inputs.detailing_edge_type,
        "Detailing.Gap": inputs.detailing_gap,
        "Load.Axial": inputs.load_axial || "",
        "Load.Moment": inputs.load_moment || "",
        "Load.Shear": inputs.load_shear || "",
        Material: inputs.material,
        "Member.Designation": inputs.member_designation,
        "Member.Material": inputs.member_material,
        Module: "Beam-to-Beam Cover Plate Bolted Connection",
      };

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
    }
  };

  const handleReset = () => {
    setConfirmationType("reset");
    setShowResetConfirmation(true);
  };

  const handleHomeClick = () => {
    if (hasUnsavedWork()) {
      setConfirmationType("navigation");
      setNavigationSource("home"); //home navigation
      setShowResetConfirmation(true);
    } else {
      navigate("/home");
    }
  };

  const performReset = () => {
    if (confirmationType === "navigation") {
      console.log(`USER CONFIRMED NAVIGATION - source: ${navigationSource}`);

      // Set flag to allow navigation
      setAllowNavigation(true);

      // Close modal first
      setShowResetConfirmation(false);
      setConfirmationType("reset");

      // Small delay then navigate
      setTimeout(() => {
        // First cleanup the session and state
        deleteSession("Cover Plate Bolted Connection");
        resetToDefaultState();

        // Manual destinations
        if (navigationSource === "home") {
          console.log("Navigating to home");
          navigate("/home");
        } else if (navigationSource === "back") {
          console.log("Navigating to connections page");
          navigate("/design-type/connections");
        }

        setAllowNavigation(false);
        setNavigationSource(null);
      }, 100);
    } else {
      console.log("USER CONFIRMED RESET - starting targeted reset");
      resetToDefaultState();
      setShowResetConfirmation(false);
      setConfirmationType("reset");
      console.log("RESET: User confirmed - targeted reset completed");
    }
  };

  // Diameter mm
  //  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDiameterNewItems, setSelectedDiameterNewItems] = useState([]);

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
  //flange plate_thickness
  const [
    selectedFlangePlateThicknessItems,
    setSelectedFlangePlateThicknessItems,
  ] = useState([]);
  const handleTransferChangeInFlangePlateThickness = (nextTargetKeys) => {
    setSelectedFlangePlateThicknessItems(nextTargetKeys);
    setInputs({ ...inputs, flange_plate_thickness: nextTargetKeys });
  };

  //web plate_thickness
  const [selectedWebPlateThicknessItems, setSelectedWebPlateThicknessItems] =
    useState([]);
  const handleTransferChangeInWebPlateThickness = (nextTargetKeys) => {
    setSelectedWebPlateThicknessItems(nextTargetKeys);
    setInputs({ ...inputs, web_plate_thickness: nextTargetKeys });
  };

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
    getSupportedData({
      supported_section: inputs.member_designation,
    });
  }, [inputs.member_designation]);

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

  const navigate = useNavigate();
  return (
    <>
      <div className="module_base">
        <div className="module_nav">
          {MenuItems.map((item, index) => (
            <MomentDropdownMenu
              key={index}
              label={item.label}
              dropdown={item.dropdown}
              setDesignPrefModalStatus={setDesignPrefModalStatus}
              inputs={inputs}
              setInputs={setInputs}
              allSelected={allSelected}
              setAllSelected={setAllSelected}
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
            <div className="home-btn" onClick={handleHomeClick}>
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
                  <h4>Section Designation*</h4>
                  <Select
                    value={inputs.member_designation || beamList[2]}
                    onSelect={(value) =>
                      setInputs({ ...inputs, member_designation: value })
                    }
                  >
                    {beamList?.map((item, index) => (
                      <Option key={index} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="component-grid-align">
                  <h4>Material</h4>
                  <Select
                    value={inputs.material || materialList[0].Grade}
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
                        material: material.Grade,
                        connector_material: material.Grade,
                        member_material: material.Grade,
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

                <div className="component-grid-align">
                  <h4>Moment Force(kN)</h4>
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
                    value={inputs.load_moment}
                    onChange={(event) =>
                      setInputs({ ...inputs, load_moment: event.target.value })
                    }
                  />
                </div>

                <div className="component-grid-align">
                  <h4>Axial Force(kN)</h4>
                  <Input
                    type="text"
                    name="AxialForce"
                    onInput={(event) => {
                      event.target.value = event.target.value.replace(
                        /[^0-9.]/g,
                        ""
                      );
                    }}
                    pattern="\d*"
                    value={inputs.load_axial}
                    onChange={(event) =>
                      setInputs({ ...inputs, load_axial: event.target.value })
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
              <h3>Flange Splice Plate</h3>
              <div className="component-grid">
                <div className="component-grid-align">
                  <h4>Type</h4>
                  <Select
                    value={inputs.flange_plate_preferences}
                    onSelect={(value) =>
                      setInputs({ ...inputs, flange_plate_preferences: value })
                    }
                  >
                    <Option value="Outside">Outside</Option>
                    <Option value="Outside + Inside">Outside + Inside</Option>
                  </Select>
                </div>

                <div className="component-grid-align">
                  <h4>Thickness(mm)</h4>
                  <Select
                    onSelect={handleAllSelectFlangePT}
                    value={flangeThicknessSelect}
                  >
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>

                <Modal
                  open={flangePlateThicknessModal}
                  onCancel={() => setFlangePlateThicknessModal(false)}
                  footer={null}
                  width={500}
                  height={500}
                >
                  <div className="popUp">
                    <h3>Customized</h3>
                    <Transfer
                      dataSource={thicknessList
                        .sort((a, b) => Number(a) - Number(b))
                        .map((label) => ({
                          key: label,
                          label: <h5>{label}</h5>,
                        }))}
                      targetKeys={selectedFlangePlateThicknessItems}
                      onChange={handleTransferChangeInFlangePlateThickness}
                      render={(item) => item.label}
                      titles={["Available", "Selected"]}
                      showSearch
                      listStyle={{ height: 400, width: 300 }}
                    />
                  </div>
                </Modal>
              </div>

              <h3>Web Splice Plate</h3>
              <div className="component-grid">
                <div className="component-grid-align">
                  <h4>Thickness(mm)</h4>
                  <Select
                    onSelect={handleAllSelectWebPT}
                    value={webThicknessSelect}
                  >
                    <Option value="Customized">Customized</Option>
                    <Option value="All">All</Option>
                  </Select>
                </div>

                <Modal
                  open={webPlateThicknessModal}
                  onCancel={() => setWebPlateThicknessModal(false)}
                  footer={null}
                  width={500}
                  height={500}
                >
                  <div className="popUp">
                    <h3>Customized</h3>
                    <Transfer
                      dataSource={thicknessList
                        .sort((a, b) => Number(a) - Number(b))
                        .map((label) => ({
                          key: label,
                          label: <h5>{label}</h5>,
                        }))}
                      targetKeys={selectedWebPlateThicknessItems}
                      onChange={handleTransferChangeInWebPlateThickness}
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
              <div className="cadModel">
                <Canvas
                  gl={{ antialias: true, preserveDrawingBuffer: true }}
                  onCreated={({ gl }) => {
                    gl.setClearColor("#ADD8E6"); // set background inside WebGL itself, not just CSS
                  }}
                >
                  <PerspectiveCamera
                    ref={cameraRef}
                    makeDefault
                    position={cameraPos}
                    fov={fov}
                    near={0.1}
                    far={1000}
                  />
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
            {<CoverPlateBoltedOutputDock output={output} />}

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
                  <div
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    <Upload
                      beforeUpload={handleFileChange}
                      showUploadList={false}
                    >
                      <Button onClick={handleUseProfile}>Select File</Button>
                    </Upload>
                    <Button type="button" onClick={handleSaveProfile}>
                      Save Profile
                    </Button>
                  </div>
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
                    module="Cover Plate Bolted Connection"
                    inputs={inputs}
                    setInputs={setInputs}
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

      {/* <CustomSectionModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={setInputs}
        inputValues={inputs}
        type="connector"
      /> */}

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

      {/* Reset Confirmation Modal */}
      <Modal
        open={showResetConfirmation}
        title={
          <span>
            {confirmationType === "reset"
              ? "Confirm Reset"
              : "Unsaved Progress"}
          </span>
        }
        onCancel={() => {
          setShowResetConfirmation(false);
          setConfirmationType("reset");
        }}
        footer={[
          <Button key="cancel" onClick={() => setShowResetConfirmation(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            style={{ background: "rgb(135, 91, 91)", color: "white" }}
            onClick={performReset}
          >
            {confirmationType === "reset"
              ? "Yes, Reset Everything"
              : "Yes, Leave Page"}
          </Button>,
        ]}
        width={500}
      >
        <div>
          <p>
            {confirmationType === "reset"
              ? "Are you sure you want to reset all inputs and clear the current design?"
              : "You have unsaved design progress. Are you sure you want to leave?"}
          </p>
          <br />
          <p>
            <strong>This will lose all your current work.</strong>
          </p>
        </div>
      </Modal>

      {/* Loading Modal */}
      <Modal
        open={isLoadingModalVisible}
        footer={null}
        closable={false}
        maskClosable={false}
        centered
        width={400}
        className="loading-modal"
        styles={{
          body: {
            textAlign: "center",
            padding: "40px 20px",
          },
        }}
      >
        <div className="loading-content">
          <div
            style={{
              fontSize: "18px",
              marginBottom: "20px",
              fontWeight: "bold",
            }}
          >
            Processing Design
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div
              className="spinner"
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            ></div>
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>
            {loadingStage || "Please wait while we generate your results..."}
          </div>
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#999" }}>
            This may take a few moments
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CoverPlateBolted;
