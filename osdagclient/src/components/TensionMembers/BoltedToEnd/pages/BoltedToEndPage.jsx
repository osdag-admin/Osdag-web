/* eslint-disable no-unused-vars */
import "../../../../App.css";
import {
  useContext,
  useEffect,
  useState,
  useLayoutEffect,
  Suspense,
} from "react";
import "react-toastify/dist/ReactToastify.css";
import { Select, Input, Modal, Button, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import ANGLES from "../../../../assets/TensionMember/angles.png";
import BACK_TO_BACK_ANGLES from "../../../../assets/TensionMember/back_back_angles.png";
import STAR_ANGLES from "../../../../assets/TensionMember/star_angles.png";
import CHANNELS from "../../../../assets/TensionMember/channels.png";
// import BACK_TO_BACK_CHANNELS from "../../assets/TensionMember/back_to_back_channels.png";
import ErrorImg from "../../../../assets/notSelected.png";
import BoltedToEndOutputDock from "../utils/BoltedToEndOutputDock";
import Logs from "../../../Logs";
import Model from "../../../shearConnection/threerender";
import { Canvas } from "@react-three/fiber";
import { ModuleContext } from "../../../../context/ModuleState";
import { Viewer } from "@react-pdf-viewer/core";
import { Transfer } from "antd";
// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Html } from "@react-three/drei";
import DesignPrefSections from "../../../DesignPrefSections";
import CustomSectionModal from "../../../CustomSectionModal";

// drop down
import TensionDropdownMenu from "../../../TensionDropdownMenu";

// crypto packages
import ScreenshotCapture from "../../../ScreenShotCapture";

const { Option } = Select;

const MenuItems = [
  {
    label: "File",
    dropdown: [
      { name: "Load Input", shortcut: "Ctrl+L" },
      { name: "Save Input", shortcut: "Alt+N" },
      { name: "Download Input", shortcut: "Alt+D" },
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
      { name: "Member" },
      { name: "Plate" },
      { name: "Endplate" },
      { name: "Change Background" },
    ],
  },
  {
    label: "Database",
    dropdown: [
      { name: "Downloads", options: ["Angle", "Channel"] },
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

function BoltedToEndPage() {
  const [selectedProfile, setSelectedProfile] = useState("Angles");
  const [imageSource, setImageSource] = useState(BACK_TO_BACK_ANGLES);
  const [isModalOpen, setModalOpen] = useState(false);
  const [output, setOutput] = useState(null);
  const [logs, setLogs] = useState(null);
  const [displayOutput, setDisplayOutput] = useState();
  const [boltDiameterSelect, setBoltDiameterSelect] = useState("All");
  const [thicknessSelect, setThicknessSelect] = useState("All");
  const [propertyClassSelect, setPropertyClassSelect] = useState("All");
  const [designPrefModalStatus, setDesignPrefModalStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [displaySaveInputPopup, setDisplaySaveInputPopup] = useState(false);
  const [saveInputFileName, setSaveInputFileName] = useState("");
  const {
    beamList,
    sectionProfileList,
    angleList,
    channelList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    designLogs,
    designData,
    displayPDF,
    renderCadModel,
    cadModelPaths,
    createDesign,
    createDesignReport,
    getDesingPrefData,
    getBeamMaterialList
  } = useContext(ModuleContext);

  console.log("abhi bolt diameter list", beamList);

  if (displaySaveInputPopup)
    [setTimeout(() => setDisplaySaveInputPopup(false), 4000)];

  const [inputs, setInputs] = useState({
    bolt_diameter: [],
    bolt_grade: [],
    bolt_type: "Bearing Bolt",
    connector_material: "E 250 (Fe 410 W)A",
    section_profile: "Angles",
    location: "Long Leg",
    length: "1250",
    axial_force: "60",
    module: "Tension Member Bolted Design",
    plate_thickness: [],
    section_designation: [],
    material: "E 250 (Fe 410 W)A",
    bolt_hole_type: "Standard",
    bolt_slip_factor: "0.3",
    member_designation: "All",
    detailing_edge_type: "Rolled, machine-flame cut, sawn and planed",
    detailing_gap: "10",
    detailing_corr_status: "No",
    design_method: "Limit State Design",
  });

  // Modal states
  const [isModalpropertyClassListOpen, setModalpropertyClassListOpen] = useState(false);
  const [plateThicknessModal, setPlateThicknessModal] = useState(false);
  const [allSelected, setAllSelected] = useState({
    plate_thickness: true,
    bolt_diameter: true,
    bolt_grade: true,
    section_designation: true,
  });

  const [renderBoolean, setRenderBoolean] = useState(false);
  const [modelKey, setModelKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState("Model");
  const options = ["Model", "Member", "Plate", "Endplate"];
  const [screenshotTrigger, setScreenshotTrigger] = useState(false);
  const triggerScreenshotCapture = () => {
    setScreenshotTrigger(true);
  };

  // Session creation removed - now stateless



  // Session cleanup removed - now stateless

  // Handle property class select
  const handleSelectChangePropertyClass = (value) => {
    if (value === "Customized") {
      if (inputs.bolt_grade.length != 0) {
        setInputs({ ...inputs, bolt_grade: inputs.bolt_grade });
      } else {
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

  // Handle bolt diameter select
  const handleSelectChangeBoltDiameter = (value) => {
    if (value === "Customized") {
      setBoltDiameterSelect("Customized");
      setAllSelected({ ...allSelected, bolt_diameter: false });
      setModalOpen(true);
    } else {
      setBoltDiameterSelect("All");
      setAllSelected({ ...allSelected, bolt_diameter: true });
      // Set all bolt diameters except "All"
      setInputs({ ...inputs, bolt_diameter: boltDiameterList.filter(x => x !== "All") });
      setModalOpen(false);
    }
  };

  // Add new state for section designation selection
  const [sectionDesignationSelect, setSectionDesignationSelect] = useState("All");
  const [isModalSectionDesignationOpen, setModalSectionDesignationOpen] = useState(false);
  const [selectedSectionDesignationItems, setSelectedSectionDesignationItems] = useState([]);

  // Update handleSelectSectionDesignation to match diameter/thickness logic
  const handleSelectSectionDesignation = (value) => {
    if (value === "Customized") {
      setSectionDesignationSelect("Customized");
      setAllSelected({ ...allSelected, section_designation: false });
      setModalSectionDesignationOpen(true);
    } else {
      setSectionDesignationSelect("All");
      setAllSelected({ ...allSelected, section_designation: true });
      const list = selectedProfile && selectedProfile.includes("Angle") ? angleList : channelList;
      setInputs({ ...inputs, section_designation: list });
      setModalSectionDesignationOpen(false);
    }
  };
  const handleTransferChangeSectionDesignation = (nextTargetKeys) => {
    setSelectedSectionDesignationItems(nextTargetKeys);
    setInputs({ ...inputs, section_designation: nextTargetKeys });
  };

  // Handle plate thickness select
  const handleAllSelectPT = (value) => {
    if (value === "Customized") {
      if (inputs.plate_thickness.length != 0) {
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

  useEffect(() => {
    if (!selectedProfile) return;

    if (selectedProfile === "Angles") {
      setImageSource(ANGLES);
    } else if (selectedProfile === "Back to Back Angles") {
      setImageSource(BACK_TO_BACK_ANGLES);
    } else if (selectedProfile === "Star Angles") {
      setImageSource(STAR_ANGLES);
    } else if (selectedProfile === "Channels") {
      setImageSource(CHANNELS);
      // } else if (selectedProfile === "Back to Back Channels") {
      //   setImageSource(BACK_TO_BACK_CHANNELS);
    } else {
      setImageSource(ErrorImg);
    }
  }, [selectedProfile]);

  const handleSelectProfile = (value) => {
    setOutput(null);
    setSelectedProfile(value);
    setInputs({ ...inputs, section_profile: value });
  };

  const handleSelectLocation = (value) => {
    setInputs({ ...inputs, location: value });
  };

  useEffect(() => {
    getBeamMaterialList("Tension-Member-Bolted-Design");
  }, []);


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
      } catch (error) {
        console.log(error);
        setOutput(null);
      }
    }
  }, [designData]);

  const handleSubmit = async () => {
    let param = {};

    if (
      !inputs.section_designation ||
      !inputs.length ||
      !inputs.axial_force ||
      inputs.section_designation === "Select Section"
    ) {
      alert("Please input all the required fields");
      return;
    }


    const getArrayParam = (allSelectedFlag, fullList, selectedList) => {
      if (allSelectedFlag) {
        // Exclude "All" if present in the list
        return fullList.filter(item => item !== "All");
      }
      // Ensure always array
      if (Array.isArray(selectedList)) {
        return selectedList.filter(item => item !== "All");
      }
      return [selectedList].filter(item => item !== "All");
    };

    param = {
      "Bolt.Bolt_Hole_Type": String(inputs.bolt_hole_type),
      "Bolt.Diameter": getArrayParam(allSelected.bolt_diameter, boltDiameterList, inputs.bolt_diameter),
      "Bolt.Grade": getArrayParam(allSelected.bolt_grade, propertyClassList, inputs.bolt_grade),
      "Bolt.Slip_Factor": String(inputs.bolt_slip_factor),
      "Bolt.Type": String(inputs.bolt_type),
      "Connector.Material": String(inputs.connector_material),
      "Material": String(inputs.material),
      "Member.Material": String(inputs.material),
      "Design.Design_Method": String(inputs.design_method),
      "Detailing.Corrosive_Influences": String(inputs.detailing_corr_status),
      "Detailing.Edge_type": String(inputs.detailing_edge_type),
      "Detailing.Gap": String(inputs.detailing_gap),
      "Load.Axial": String(inputs.axial_force),
      "Member.Designation": getArrayParam(
        allSelected.section_designation,
        selectedProfile.includes("Angle") ? angleList : channelList,
        inputs.section_designation
      ),
      "Member.Length": String(inputs.length),
      "Member.Profile": String(inputs.section_profile),
      "Conn_Location": String(inputs.location),
      "Module": "Tension Member Bolted Design",
      "Connector.Plate.Thickness_List": getArrayParam(allSelected.plate_thickness, thicknessList, inputs.plate_thickness),
    };

    var param1 = {
      "Bolt.Bolt_Hole_Type": "Standard",
      "Bolt.Diameter": [
        '8', '10', '12', '16', '20', '24', '30', '36', '42', '48', '56', '64',
        '14', '18', '22', '27', '33', '39', '45', '52', '60'
      ],
      "Bolt.Grade": ['3.6'],
      "Bolt.Slip_Factor": "0.3",
      "Bolt.Type": "Bearing Bolt",
      "Material": "E 250 (Fe 410 W)A",
      "Connector.Material": "E 250 (Fe 410 W)A",
      "Member.Material": "E 250 (Fe 410 W)A",
      "Design.Design_Method": "Limit State Design",
      "Detailing.Corrosive_Influences": "No",
      "Detailing.Edge_type": "Sheared or hand flame cut",
      "Detailing.Gap": "0",
      "Load.Axial": "60",
      "Member.Designation": ["40 x 20 x 3"],
      "Member.Length": "1250",
      "Member.Profile": "Back to Back Angles",
      "Conn_Location": "Long Leg",
      "Module": "Tension Member Design - Bolted to End Gusset",
      "Connector.Plate.Thickness_List": [
        '8', '10', '12', '14', '16', '18', '20', '22', '25', '28', '32', '36',
        '40', '45', '50', '56', '63', '75', '80', '90', '100', '110', '120'
      ]
    };

    console.log("param inputed: ", param);
    console.log("param hardcoded: ", param1);

    createDesign(param, "Tension-Member-Bolted-Design");
    setDisplayOutput(true);

    setLoading(true);
    setModelKey((prev) => prev + 1); //Forces model to reload
  };

  // Create design report state and handlers
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

  const handleCreateDesignReport = () => {
    setCreateDesignReportBool(true);
  };

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

  const saveOutput = () => {
    let data = {};

    if (!inputs.section_designation || !output) {
      alert("Please submit the design first.");
      return;
    }
    console.log("inputs.section_designation: ", inputs.section_designation);
    data = {
      "Bolt.Bolt_Hole_Type": inputs.bolt_hole_type,
      "Bolt.Diameter": allSelected.bolt_diameter
        ? boltDiameterList
        : inputs.bolt_diameter,
      "Bolt.Grade": allSelected.bolt_grade
        ? propertyClassList
        : inputs.bolt_grade,
      "Bolt.Slip_Factor": inputs.bolt_slip_factor,
      "Bolt.Type": inputs.bolt_type,
      "Connector.Material": inputs.connector_material,
      "Material": inputs.connector_material,
      "Member.Material": inputs.connector_material,
      "Design.Design_Method": inputs.design_method,
      "Detailing.Corrosive_Influences": inputs.detailing_corr_status,
      "Detailing.Edge_type": inputs.detailing_edge_type,
      "Detailing.Gap": inputs.detailing_gap,
      "Load.Axial": inputs.axial_force || "",
      "Member.Designation": inputs.section_designation,
      "Member.Length": inputs.length,
      "Member.Profile": inputs.section_profile,
      "Conn_Location": inputs.location,
      Module: "Tension Member Bolted Design",
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

  const handleReset = () => {
    // Reset inputs
    setInputs({
      ...inputs,
      bolt_diameter: inputs.bolt_diameter,
      bolt_grade: inputs.bolt_grade,
      bolt_type: "Bearing Bolt",
      section_designation: "All",
      length: "",
      axial_force: "",
      plate_thickness: inputs.plate_thickness,
    });

    // Reset selected states
    setAllSelected({
      plate_thickness: false,
      bolt_diameter: false,
      bolt_grade: false,
      section_designation: false,
    });

    setBoltDiameterSelect("All");
    setPropertyClassSelect("All");
    setThicknessSelect("All");

    // Reset CAD model and output
    setRenderBoolean(false);
    setOutput(null);
  };

  // Transfer component state for customized selections
  const [selectedDiameterItems, setSelectedDiameterItems] = useState([]);
  const handleTransferChangeDiameter = (nextTargetKeys) => {
    setSelectedDiameterItems(nextTargetKeys);
    setInputs({ ...inputs, bolt_diameter: nextTargetKeys });
  };

  const [selectedPropertyClassItems, setSelectedPropertyClassItems] = useState([]);
  const handleTransferChangePropertyClass = (nextTargetKeys) => {
    setSelectedPropertyClassItems(nextTargetKeys);
    setInputs({ ...inputs, bolt_grade: nextTargetKeys });
  };

  const [selectedPlateThicknessItems, setSelectedPlateThicknessItems] = useState([]);
  const handleTransferChangePlateThickness = (nextTargetKeys) => {
    setSelectedPlateThicknessItems(nextTargetKeys);
    setInputs({ ...inputs, plate_thickness: nextTargetKeys });
  };

  const handleImageFileChange = (event) => {
    const imageFile = event.target.files[0];
    let imageFileName = event.target.files[0].name;

    setDesignReportInputs({
      ...designReportInputs,
      companyLogo: imageFile,
      companyLogoName: imageFileName,
    });
  };

  // Design preferences keyboard shortcut handler
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

  useEffect(() => {
    if (renderCadModel && cadModelPaths) {
      console.log("Received raw .obj data:", cadModelPaths);
      setRenderBoolean(true);
      setLoading(false);
    } else {
      setRenderBoolean(false);
    }
  }, [renderCadModel, cadModelPaths]);

  const navigate = useNavigate();

  return (
    <>
      <div className="module_base">
        <div className="module_nav">
          {MenuItems.map((item, index) => (
            <TensionDropdownMenu
              key={index}
              label={item.label}
              dropdown={item.dropdown}
              setDesignPrefModalStatus={setDesignPrefModalStatus}
              inputs={inputs}
              setInputs={setInputs}
              allSelected={allSelected}
              setAllSelected={setAllSelected}
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}
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

        {/* Main Body of code  */}
        <div className="superMainBody">
          {/* Left - Input Dock */}
          <div className="InputDock">
            <p>Input Dock</p>
            <div className="subMainBody scroll-data">
              {/* Connecting Members Section */}
              <h3>Connecting Members</h3>
              <div className="component-grid">
                <div className="component-grid-align">
                  <h4>Section Profile*</h4>
                  <Select onSelect={handleSelectProfile} value={selectedProfile}>
                    {sectionProfileList && sectionProfileList.length > 0 ? (
                      sectionProfileList.map((profile) => (
                        <options key={profile} value={profile}>
                          {profile}
                        </options>
                      ))
                    ) : (
                      <option>Loading...</option>
                    )}
                  </Select>
                </div>

                <div className="connectionimg">
                  <img
                    src={imageSource}
                    alt="Section Profile"
                    height="100px"
                    width="100px"
                  />
                </div>

                <div className="component-grid-align">
                  <h4>Conn_Location *</h4>
                  <Select
                    value={inputs.location}
                    onSelect={handleSelectLocation}
                  >
                    {selectedProfile && selectedProfile.includes("Angle") ? (
                      <>
                        <Option value="Long Leg">Long Leg</Option>
                        <Option value="Short Leg">Short Leg</Option>
                      </>
                    ) : (
                      <Option value="Web">Web</Option>
                    )}
                  </Select>
                </div>

                <div className="component-grid-align">
                  <h4>Section Designation*</h4>
                  <Select
                    value={sectionDesignationSelect}
                    onSelect={handleSelectSectionDesignation}
                  >
                    <Option value="All">All</Option>
                    <Option value="Customized">Customized</Option>
                  </Select>
                </div>

                <Modal
                  open={isModalSectionDesignationOpen}
                  onCancel={() => setModalSectionDesignationOpen(false)}
                  footer={null}
                  width={500}
                  height={500}
                >
                  <div className="popUp">
                    <h3>Customized</h3>
                    <Transfer
                      dataSource={
                        (selectedProfile && selectedProfile.includes("Angle") ? angleList : channelList || []).map((label) => ({
                          key: label,
                          label: <h5>{label}</h5>,
                        }))
                      }
                      targetKeys={selectedSectionDesignationItems}
                      onChange={handleTransferChangeSectionDesignation}
                      render={(item) => item.label}
                      titles={["Available", "Selected"]}
                      showSearch
                      listStyle={{ height: 400, width: 300 }}
                    />
                  </div>
                </Modal>

                <div className="component-grid-align">
                  <h4>Material *</h4>
                  <Select
                    value={inputs.material}
                    onSelect={(value) => {
                      setInputs({
                        ...inputs,
                        material: value,
                      });
                    }}
                  >
                    {materialList && materialList.length > 0 ? (
                      materialList.map((item, index) => (
                        <Option key={index} value={item.Grade}>
                          {item.Grade}
                        </Option>
                      ))
                    ) : (
                      <Option value="" disabled>
                        No materials available
                      </Option>
                    )}
                  </Select>
                </div>

                <div className="component-grid-align">
                  <h4>Length (mm) *</h4>
                  <Input
                    type="text"
                    name="Length"
                    onInput={(event) => {
                      event.target.value = event.target.value.replace(
                        /[^0-9.]/g,
                        ""
                      );
                    }}
                    pattern="\d*"
                    value={inputs.length}
                    onChange={(event) =>
                      setInputs({ ...inputs, length: event.target.value })
                    }
                  />
                </div>
              </div>

              {/* Factored Loads Section */}
              <h3>Factored Loads</h3>
              <div className="component-grid">
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
                    value={inputs.axial_force}
                    onChange={(event) =>
                      setInputs({ ...inputs, axial_force: event.target.value })
                    }
                  />
                </div>
              </div>

              {/* Bolt Section */}
              <h3>Bolt</h3>
              <div className="component-grid">
                <div className="component-grid-align">
                  <h4>Diameter (mm)</h4>
                  <Select
                    onSelect={handleSelectChangeBoltDiameter}
                    value={boltDiameterSelect}
                  >
                    <Option value="All">All</Option>
                    <Option value="Customized">Customized</Option>
                  </Select>
                </div>

                {/* Diameter(mm) Pop up Modal */}
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
                      dataSource={boltDiameterList && boltDiameterList.length > 0 ?
                        boltDiameterList
                          .sort((a, b) => Number(a) - Number(b))
                          .map((label) => ({
                            key: label,
                            label: <h5>{label}</h5>,
                          }))
                        : []}
                      targetKeys={selectedDiameterItems}
                      onChange={handleTransferChangeDiameter}
                      render={(item) => item.label}
                      titles={["Available", "Selected"]}
                      showSearch
                      listStyle={{ height: 400, width: 300 }}
                    />

                  </div>
                </Modal>

                <div className="component-grid-align">
                  <h4>Type *</h4>
                  <Select
                    value={inputs.bolt_type}
                    onSelect={(value) =>
                      setInputs({ ...inputs, bolt_type: value })
                    }
                  >
                    <Option value="Bearing Bolt">Bearing Bolt</Option>
                    <Option value="Friction Grip Bolt">
                      Friction Grip Bolt
                    </Option>
                  </Select>
                </div>

                <div className="component-grid-align">
                  <h4>Property Class *</h4>
                  <Select
                    onSelect={handleSelectChangePropertyClass}
                    value={propertyClassSelect}
                  >
                    <Option value="All">All</Option>
                    <Option value="Customized">Customized</Option>
                  </Select>
                </div>

                {/* Property Class Pop up Modal */}
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
                      dataSource={propertyClassList && propertyClassList.length > 0 ?
                        propertyClassList
                          .sort((a, b) => Number(a) - Number(b))
                          .map((label) => ({
                            key: label,
                            label: <h5>{label}</h5>,
                          }))
                        : []}
                      targetKeys={selectedPropertyClassItems}
                      onChange={handleTransferChangePropertyClass}
                      render={(item) => item.label}
                      titles={["Available", "Selected"]}
                      showSearch
                      listStyle={{ height: 400, width: 300 }}
                    />
                  </div>
                </Modal>
              </div>

              {/* Plate Section */}
              <h3>Plate</h3>
              <div className="component-grid">
                <div className="component-grid-align">
                  <h4>Thickness (mm)</h4>
                  <Select onSelect={handleAllSelectPT} value={thicknessSelect}>
                    <Option value="All">All</Option>
                    <Option value="Customized">Customized</Option>
                  </Select>
                </div>

                {/* Plate Thickness Pop up Modal */}
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
                      dataSource={thicknessList && thicknessList.length > 0 ?
                        thicknessList
                          .sort((a, b) => Number(a) - Number(b))
                          .map((label) => ({
                            key: label,
                            label: <h5>{label}</h5>,
                          }))
                        : []}
                      targetKeys={selectedPlateThicknessItems}
                      onChange={handleTransferChangePlateThickness}
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

          {/* Middle - 3D Model View */}
          <div className="superMainBody_mid">
            <div className="options-container">
              {options.map((option) => (
                <div
                  key={option}
                  className="option-wrapper"
                  onClick={() => setSelectedView(option)}
                >
                  <div
                    className={`option-box ${selectedView === option ? "selected" : ""
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
          {/* Right - Output Dock */}
          <div className="superMain_right">
            <BoltedToEndOutputDock output={output} />
            <div className="outputdock-btn">
              <Input
                type="button"
                value="Create Design Report"
                onClick={handleCreateDesignReport}
              />
              <Input type="button" value="Save Output" onClick={saveOutput} />

              {/* Create Design Report Modal */}
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
                    selectedProfile={selectedProfile}
                    setDesignPrefModalStatus={setDesignPrefModalStatus}
                    confirmationModal={confirmationModal}
                    setConfirmationModal={setConfirmationModal}
                  />
                </Modal>
              )}

              {/* Additional modals and other UI components */}
            </div>
          </div>

        </div>
      </div >

      {/* Custom section modal */}
      < CustomSectionModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={setInputs}
        inputValues={inputs}
        type="connector"
      />

      {/* PDF viewer component */}
      {
        displayPDF ? (
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
        )
      }
    </>
  );
}

  export default BoltedToEndPage;
