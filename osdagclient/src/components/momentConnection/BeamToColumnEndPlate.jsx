import "../../App.css";
import { useContext, useEffect, useState, Suspense } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Select, Input, Modal, Button, Row, Col, Transfer } from "antd";
import { useNavigate } from "react-router-dom";
import BeamToColumnEndPlateOutputDock from "../BeamToColumnEndPlateOutputDock";
import Logs from "../Logs";
import Model from "../shearConnection/threerender";
import { Canvas } from "@react-three/fiber";
import { ModuleContext } from "../../context/ModuleState";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import cad_background from "../../assets/cad_empty_image.png";
import { Html } from "@react-three/drei";
import DesignPrefSections from "../DesignPrefSections";
import CustomSectionModal from "../CustomSectionModal";
import DropdownMenu from "../DropdownMenu";

const { Option } = Select;

const endPlateTypes = [
  "Extended One-Way",
  "Extended Both Ways",
  "Flushed - Reversible Moment",
];

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
      { name: "Save Front View", shortcut: "Alt+Shift+F" },
      { name: "Save Top View", shortcut: "Alt+Shift+T" },
      { name: "Save Side View", shortcut: "Alt+Shift+S" },
      { name: "Quit", shortcut: "Shift+Q" },
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
      { name: "EndPlate" },
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

function BeamToColumnEndPlate() {
  const [selectedOption, setSelectedOption] = useState(
    "Column-Flange-Beam-Web"
  );
  const [endPlateType, setEndPlateType] = useState("Flushed - Reversible");
  const [output, setOutput] = useState(null);
  const [logs, setLogs] = useState(null);
  const [displayOutput, setDisplayOutput] = useState(true); // Changed to true to always show the output dock
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState("Model");
  const [renderBoolean, setRenderBoolean] = useState(false);
  const [modelKey, setModelKey] = useState(0);
  const options = ["Model", "Beam", "Column", "Connector"];
  const [designPrefModalStatus, setDesignPrefModalStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [displaySaveInputPopup, setDisplaySaveInputPopup] = useState(false);
  const [saveInputFileName, setSaveInputFileName] = useState("");
  const [CreateDesignReportBool, setCreateDesignReportBool] = useState(false);
  const [outputDisabled, setOutputDisabled] = useState(true); // New state to track if output is disabled

  const {
    connectivityList,
    beamList,
    columnList,
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
    getDesingPrefData,
    deleteSession,
  } = useContext(ModuleContext);

  const [inputs, setInputs] = useState({
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 165 (Fe 290)",
    load_shear: "2",
    load_axial: "0",
    load_moment: "2",
    module: "Beam-to-Column End Plate Connection",
    plate_thickness: [],
    beam_section: "JB 150",
    column_section: "HB 150",
    supported_material: "E 165 (Fe 290)",
    supporting_material: "E 165 (Fe 290)",
    bolt_hole_type: "Standard",
    bolt_slip_factor: "0.3",
    weld_fab: "Shop Weld",
    weld_material_grade: "410",
    weld_type: "Groove Weld",
    detailing_edge_type: "Rolled, machine-flame cut, sawn and planed",
    detailing_gap: "10",
    detailing_corr_status: "No",
    design_method: "Limit State Design",
    bolt_tension_type: "Pre-tensioned",
  });

  const [allSelected, setAllSelected] = useState({
    plate_thickness: true,
    bolt_diameter: true,
    bolt_grade: true,
  });

  const [boltDiameterSelect, setBoltDiameterSelect] = useState("All");
  const [thicknessSelect, setThicknessSelect] = useState("All");
  const [propertyClassSelect, setPropertyClassSelect] = useState("All");
  const [selectedDiameterNewItems, setSelectedDiameterNewItems] = useState([]);
  const [selectedPropertyClassListItems, setSelectedPropertyClassListItems] =
    useState([]);
  const [selectedPlateThicknessItems, setSelectedPlateThicknessItems] =
    useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalPropertyClassListOpen, setModalPropertyClassListOpen] =
    useState(false);
  const [plateThicknessModal, setPlateThicknessModal] = useState(false);
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

  useEffect(() => {
    console.log("GETTING INPUT DATA");
    console.log(beamList);
    console.log(columnList);
    console.log(materialList);
  }, [ModuleContext]);

  if (displaySaveInputPopup)
    [setTimeout(() => setDisplaySaveInputPopup(false), 4000)];

  // Add handlers for bolt diameter selection
  const handleSelectChangeBoltBeam = (value) => {
    if (value === "Customized") {
      if (inputs.bolt_diameter.length !== 0) {
        setInputs({ ...inputs, bolt_diameter: inputs.bolt_diameter });
      } else {
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

  // Add handler for property class selection
  const handleSelectChangePropertyClass = (value) => {
    if (value === "Customized") {
      if (inputs.bolt_grade.length !== 0) {
        setInputs({ ...inputs, bolt_grade: inputs.bolt_grade });
      } else {
        setInputs({ ...inputs, bolt_grade: [] });
      }
      setPropertyClassSelect("Customized");
      setAllSelected({ ...allSelected, bolt_grade: false });
      setModalPropertyClassListOpen(true);
    } else {
      setPropertyClassSelect("All");
      setAllSelected({ ...allSelected, bolt_grade: true });
      setModalPropertyClassListOpen(false);
    }
  };

  // Add handler for plate thickness selection
  const handleAllSelectPT = (value) => {
    if (value === "Customized") {
      if (inputs.plate_thickness.length !== 0) {
        setInputs({ ...inputs, plate_thickness: inputs.plate_thickness });
      } else {
        setInputs({ ...inputs, plate_thickness: [] });
      }
      setThicknessSelect("Customized");
      setAllSelected({ ...allSelected, plate_thickness: false });
      setPlateThicknessModal(true);
    } else {
      setThicknessSelect("All");
      setAllSelected({ ...allSelected, plate_thickness: true });
      setPlateThicknessModal(false);
    }
  };

  // Add handlers for transfer components
  const handleTransferChange = (nextTargetKeys) => {
    setSelectedDiameterNewItems(nextTargetKeys);
    setInputs({ ...inputs, bolt_diameter: nextTargetKeys });
  };

  const handleTransferChangeInPropertyClassList = (nextTargetKeys) => {
    setSelectedPropertyClassListItems(nextTargetKeys);
    setInputs({ ...inputs, bolt_grade: nextTargetKeys });
  };

  const handleTransferChangeInPlateThickness = (nextTargetKeys) => {
    setSelectedPlateThicknessItems(nextTargetKeys);
    setInputs({ ...inputs, plate_thickness: nextTargetKeys });
  };

  // Add reset handler
  const handleReset = () => {
    setInputs({
      ...inputs,
      load_shear: "",
      load_axial: "",
      load_moment: "",
      beam_section: "MB 300",
      column_section: "HB 150",
      bolt_type: "Bearing Bolt",
    });

    setAllSelected({
      plate_thickness: true,
      bolt_diameter: true,
      bolt_grade: true,
    });

    setBoltDiameterSelect("All");
    setPropertyClassSelect("All");
    setThicknessSelect("All");
    setRenderBoolean(false);
    setOutput(null);
    setOutputDisabled(true); // Disable output after reset
  };

  // Add Create Design Report function
  const handleCreateDesignReport = () => {
    setCreateDesignReportBool(true);
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
    if (!output) {
      alert("Please submit the design first.");
      return;
    }
    createDesignReport(designReportInputs);
    handleCancelProfile();
  };

  const handleCancelProfile = () => {
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

  const handleCancel = () => {
    setCreateDesignReportBool(false);
  };

  const saveOutput = () => {
    if (!output) {
      alert("Please submit the design first.");
      return;
    }

    let data = {
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
      Connectivity: connectivityList,
      EndPlateType: endPlateType,
      "Connector.Material": inputs.connector_material,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Axial": inputs.load_axial || "",
      "Load.Shear": inputs.load_shear || "",
      "Load.Moment": inputs.load_moment || "",
      Material: inputs.connector_material,
      "Member.Supported_Section.Designation": inputs.beam_section,
      "Member.Supported_Section.Material": inputs.supported_material,
      "Member.Supporting_Section.Designation": inputs.column_section,
      "Member.Supporting_Section.Material": inputs.supporting_material,
      Module: "Beam-to-Column End Plate Connection",
      "Weld.Fab": inputs.weld_fab,
      "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
      "Weld.Type": inputs.weld_type,
      "Connector.Plate.Thickness_List": allSelected.plate_thickness
        ? thicknessList
        : inputs.plate_thickness,
    };

    Object.keys(output).map((key, index) => {
      Object.values(output[key]).map((elm, index1) => {
        data[key + "." + elm.label.split(" ").join("_")] = elm.val;
      });
    });

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
  // Add useEffect for output and logs
  useEffect(() => {
    if (displayOutput) {
      try {
        setLogs(designLogs);
        if (!designLogs) {
          throw new Error("No logs data");
        }
      } catch (error) {
        console.log(error);
        setLogs(null);
      }
    }
  }, [designLogs, displayOutput]);

  useEffect(() => {
    if (displayOutput) {
      try {
        const formatedOutput = {};

        if (!designData) {
          throw new Error("No design data");
        }

        for (const [key, value] of Object.entries(designData)) {
          const newKey = key.split(".")[0];
          const label = value.label;
          const val = value.value;

          if (val) {
            if (!formatedOutput[newKey])
              formatedOutput[newKey] = [{ label, val }];
            else formatedOutput[newKey].push({ label, val });
          }
        }
        setOutput(formatedOutput);
        console.log(formatedOutput);
      } catch (error) {
        console.log(error);
        setOutput(null);
      }
    }
  }, [designData, displayOutput]); // Initialize session and data fetching
  useEffect(() => {
    // Create session and fetch all required data
    createSession("Beam-to-Column End Plate Connection");
  }, []);

  useEffect(() => {
    return () => {
      if (location.pathname != "/design/connections/beam-to-column/end_plate") {
        deleteSession("Beam-to-Column End Plate Connection");
      }
    };
  }, []);

  useEffect(() => {
    if (renderCadModel && cadModelPaths) {
      console.log("Received raw .obj data:", cadModelPaths);
      setRenderBoolean(true);
      setLoading(false);
    } else {
      setRenderBoolean(false);
    }
  }, [renderCadModel, cadModelPaths]);

  useEffect(() => {
    getDesingPrefData({
      supported_section: inputs.beam_section,
      supporting_section: inputs.column_section,
      connectivity: selectedOption, // Updated to use selectedOption
    });
  }, [inputs.column_section, inputs.beam_section, selectedOption]); // Added selectedOption to dependency array

  // Design preferences key press handler
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

  const handleImageFileChange = (event) => {
    const imageFile = event.target.files[0];
    let imageFileName = event.target.files[0].name;

    setDesignReportInputs({
      ...designReportInputs,
      companyLogo: imageFile,
      companyLogoName: imageFileName,
    });
  };
  const handleSubmit = async () => {
    if (
      !inputs.beam_section ||
      inputs.beam_section === "Select Section" ||
      !inputs.column_section ||
      inputs.column_section === "Select Section" ||
      !inputs.load_shear ||
      !inputs.load_moment
    ) {
      alert("Please input all the required fields");
      return;
    }

    // Ensure consistent module name
    let moduleId = "Beam-to-Column End Plate Connection";
    let apiModuleId = "Beam-to-Column-End-Plate-Connection";

    let param = {
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
      Connectivity: selectedOption, // Updated to use selectedOption
      EndPlateType: endPlateType,
      "Connector.Material": inputs.connector_material,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Axial": inputs.load_axial || "",
      "Load.Shear": inputs.load_shear || "",
      "Load.Moment": inputs.load_moment || "",
      Material: inputs.connector_material,
      "Member.Supported_Section.Designation": inputs.beam_section,
      "Member.Supported_Section.Material": inputs.supported_material,
      "Member.Supporting_Section.Designation": inputs.column_section,
      "Member.Supporting_Section.Material": inputs.supporting_material,
      Module: moduleId,
      "Weld.Fab": inputs.weld_fab,
      "Weld.Material_Grade_OverWrite": inputs.weld_material_grade,
      "Weld.Type": inputs.weld_type,
      "Connector.Plate.Thickness_List": allSelected.plate_thickness
        ? thicknessList
        : inputs.plate_thickness,
    };

    try {
      console.log("Submitting design with parameters:", param);
      setLoading(true);
      createDesign(param, apiModuleId);
      setDisplayOutput(true);
      setOutputDisabled(false); // Enable output after design is submitted
      setModelKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error submitting design:", error);
      setLoading(false);
      alert(
        "An error occurred while submitting the design. Please check the console for details."
      );
    }
  };

  // Add hook to initialize lists from context on component mount
  useEffect(() => {
    // If needed, you can add additional initialization code here
    if (propertyClassList && propertyClassList.length > 0) {
      setSelectedPropertyClassListItems(propertyClassList);
    }
    if (boltDiameterList && boltDiameterList.length > 0) {
      setSelectedDiameterNewItems(boltDiameterList);
    }
    if (thicknessList && thicknessList.length > 0) {
      setSelectedPlateThicknessItems(thicknessList);
    }
  }, [propertyClassList, boltDiameterList, thicknessList]);

  const navigate = useNavigate();

  // Add a function to check design calculation status
  const checkDesignStatus = () => {
    // Check if output data is loaded correctly
    if (designData && Object.keys(designData).length > 0) {
      console.log("Design data loaded successfully", designData);
      return true;
    } else if (logs && logs.length > 0) {
      // Check if there are logs indicating an error
      const errorLogs = logs.filter(
        (log) =>
          log.includes("error") ||
          log.includes("Error") ||
          log.includes("failed")
      );

      if (errorLogs.length > 0) {
        console.log("Design calculation errors found:", errorLogs);
        return false;
      }
    }

    return false;
  };

  // Add monitoring for design calculation results
  useEffect(() => {
    if (designData && Object.keys(designData).length > 0) {
      checkDesignStatus();
    }
  }, [designData, logs]);

  // // Add custom cookie handling for session management
  // useEffect(() => {
  //   // Function to manually set a cookie in the browser
  //   const setCookie = (name, value, days) => {
  //     let expires = "";
  //     if (days) {
  //       const date = new Date();
  //       date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  //       expires = "; expires=" + date.toUTCString();
  //     }
  //     document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=None; Secure";
  //   };

  //   // Function to get a cookie value
  //   const getCookie = (name) => {
  //     const nameEQ = name + "=";
  //     const ca = document.cookie.split(';');
  //     for (let i = 0; i < ca.length; i++) {
  //       let c = ca[i];
  //       while (c.charAt(0) === ' ') c = c.substring(1, c.length);
  //       if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  //     }
  //     return null;
  //   };

  //   // Check if our session cookie exists
  //   const sessionCookie = getCookie("beam_to_column_end_plate_connection_session");

  //   // If the session cookie doesn't exist and we've already tried to create a session
  //   if (!sessionCookie && state.sessionCreated) {
  //     // Generate a random string to use as a cookie value
  //     const randomString = Math.random().toString(36).substring(2, 15) +
  //                          Math.random().toString(36).substring(2, 15);

  //     // Set the cookie manually
  //     setCookie("beam_to_column_end_plate_connection_session", randomString, 1);
  //     console.log("Manually set session cookie as fallback");
  //   }
  // }, [state.sessionCreated]);

  return (
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

      <div className="superMainBody">
        <div className="InputDock">
          <p>Input Dock</p>
          <div className="subMainBody scroll-data">
            {/* Connecting Members Section */}
            <h3>Connecting Members</h3>
            <div className="component-grid">
              <div className="component-grid-align">
                <h4>Connectivity *</h4>
                <Select value={selectedOption} onSelect={setSelectedOption}>
                  {connectivityList.map((type, index) => (
                    <Option key={index} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="component-grid-align">
                <h4>End Plate Type *</h4>
                <Select value={endPlateType} onSelect={setEndPlateType}>
                  {endPlateTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Standalone Member Properties */}
            <div className="component-grid">
              <div className="component-grid-align">
                <h4>Column Section *</h4>
                <Select
                  value={inputs.column_section}
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
                <h4>Beam Section *</h4>
                <Select
                  value={inputs.beam_section}
                  onSelect={(value) =>
                    setInputs({ ...inputs, beam_section: value })
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
                <h4>Material *</h4>
                <Select
                  value={inputs.connector_material}
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
                  {materialList?.map((item, index) => (
                    <Option key={index} value={item.id}>
                      {item.Grade}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Factored Loads Section */}
            <h3>Factored Loads</h3>
            <div className="component-grid">
              <div className="component-grid-align">
                <h4>Bending Moment (kNm)</h4>
                <Input
                  type="text"
                  name="Moment"
                  onInput={(event) => {
                    event.target.value = event.target.value.replace(
                      /[^0-9.]/g,
                      ""
                    );
                  }}
                  pattern="\d*"
                  value={inputs.load_moment}
                  onChange={(e) =>
                    setInputs({ ...inputs, load_moment: e.target.value })
                  }
                />
              </div>
              <div className="component-grid-align">
                <h4>Shear Force (kN) *</h4>
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
                  onChange={(e) =>
                    setInputs({ ...inputs, load_shear: e.target.value })
                  }
                />
              </div>
              <div className="component-grid-align">
                <h4>Axial Force (kN)</h4>
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
                  onChange={(e) =>
                    setInputs({ ...inputs, load_axial: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Bolt Section */}
            <h3>Bolt</h3>
            <div className="component-grid">
              <div className="component-grid-align">
                <h4>Diameter (mm) *</h4>
                <Select
                  onSelect={handleSelectChangeBoltBeam}
                  value={boltDiameterSelect}
                >
                  <Option value="Customized">Customized</Option>
                  <Option value="All">All</Option>
                </Select>
              </div>

              <div className="component-grid-align">
                <h4>Type *</h4>
                <Select
                  value={inputs.bolt_type}
                  onSelect={(value) =>
                    setInputs({ ...inputs, bolt_type: value })
                  }
                >
                  <Option value="Bearing_Bolt">Bearing Bolt</Option>
                  <Option value="Friction_Grip_Bolt">Friction Grip Bolt</Option>
                </Select>
              </div>

              <div className="component-grid-align">
                <h4>Property Class *</h4>
                <Select
                  onSelect={handleSelectChangePropertyClass}
                  value={propertyClassSelect}
                >
                  <Option value="Customized">Customized</Option>
                  <Option value="All">All</Option>
                </Select>
              </div>

              {/* Diameter(mm) Pop up */}
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

              <Modal
                open={isModalPropertyClassListOpen}
                onCancel={() => setModalPropertyClassListOpen(false)}
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
                    targetKeys={selectedPropertyClassListItems}
                    onChange={handleTransferChangeInPropertyClassList}
                    render={(item) => item.label}
                    titles={["Available", "Selected"]}
                    showSearch
                    listStyle={{ height: 400, width: 300 }}
                  />
                </div>
              </Modal>
            </div>

            {/* End Plate Section */}
            <h3>End Plate</h3>
            <div className="component-grid">
              <div className="component-grid-align">
                <h4>Thickness (mm) *</h4>
                <Select onSelect={handleAllSelectPT} value={thicknessSelect}>
                  <Option value="Customized">Customized</Option>
                  <Option value="All">All</Option>
                </Select>
              </div>

              <Modal
                open={plateThicknessModal}
                onCancel={() => setPlateThicknessModal(false)}
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
                    targetKeys={selectedPlateThicknessItems}
                    onChange={handleTransferChangeInPlateThickness}
                    render={(item) => item.label}
                    titles={["Available", "Selected"]}
                    showSearch
                    listStyle={{ height: 400, width: 300 }}
                  />
                </div>
              </Modal>
            </div>

            {/* Weld Section */}
            <h3>Weld</h3>
            <div className="component-grid">
              <div className="component-grid-align">
                <h4>Type *</h4>
                <Select
                  value={inputs.weld_type}
                  onSelect={(value) =>
                    setInputs({ ...inputs, weld_type: value })
                  }
                >
                  <Option value="Groove Weld">Groove Weld</Option>
                  <Option value="Fillet Weld">Fillet Weld</Option>
                </Select>
              </div>
            </div>
          </div>
          <div className="inputdock-btn">
            <Input type="button" value="Reset" onClick={handleReset} />
            <Input type="button" value="Design" onClick={handleSubmit} />
          </div>
        </div>

        {/* Middle section with 3D model */}
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
              style={{
                backgroundImage: `url(${cad_background})`,
              }}
            >
              <Canvas
                gl={{ antialias: true }}
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
                </Suspense>
              </Canvas>
            </div>
          ) : (
            <div className="modelback"></div>
          )}
          <Logs logs={logs} />
        </div>

        {/* Right section with output dock */}
        <div className="superMain_right">
          {
            <BeamToColumnEndPlateOutputDock
              output={output}
              disabled={outputDisabled}
            />
          }
          <div className="outputdock-btn">
            <Input
              type="button"
              value="Create Design Report"
              onClick={handleCreateDesignReport}
              disabled={outputDisabled}
            />
            <Input
              type="button"
              value="Save Output"
              onClick={saveOutput}
              disabled={outputDisabled}
            />

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

            {/* Design Preferences Modal */}
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
    </div>
  );
}

export default BeamToColumnEndPlate;
