import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import coverPlateBolted from "../../assets/ShearConnection/sc_fin_plate.png";
import coverPlateWelded from "../../assets/ShearConnection/sc_fin_plate.png";
import endPlate from "../../assets/ShearConnection/sc_fin_plate.png";
import ProjectNameModal from "../../components/ProjectNameModal";
import { getCurrentUserEmail, isGuestUser } from "../../utils/auth";
import { MODULE_KEY_FIN_PLATE, MODULE_DISPLAY_FIN_PLATE } from '../../constants/DesignKeys';

// Submodules for each main module
const MODULE_SUBMODULES = {
  Connections: [
    { key: "shear", label: "Shear Connection" },
    { key: "moment", label: "Moment Connection" },
    { key: "base", label: "Base Plate" },
    { key: "truss", label: "Truss Connection" },
  ],
  TensionMember: [
    { key: "tension", label: "Tension Member" },
  ],
  CompressionMember: [
    { key: "compression", label: "Compression Member" },
  ],
  FlexureMember: [
    { key: "flexure", label: "Flexure Member" },
  ],
  'Beam-Column': [],
  PlateGirder: [],
  Truss: [],
  '2DFrame': [],
  '3DFrame': [],
  GroupDesign: [],
};

// Content for "connections" submodules (complex/nested)
const CONNECTIONS_TAB_CONTENT = {
  shear: [
    {
      label: "Shear Connections",
      options: [
        { key: MODULE_KEY_FIN_PLATE, label: MODULE_DISPLAY_FIN_PLATE, img: coverPlateBolted },
        { key: "ca", label: "Cleat Angle", img: endPlate },
        { key: "ep", label: "End Plate", img: endPlate },
        { key: "sa", label: "Seated Angle", img: endPlate },
      ],
    },
  ],
  moment: [
    {
      label: "Beam to Beam Splice",
      options: [
        { key: "cpb", label: "Cover Plate Bolted", img: coverPlateBolted },
        { key: "cpw", label: "Cover Plate Welded", img: coverPlateWelded },
        { key: "ep", label: "End Plate", img: endPlate },
      ],
    },
    {
      label: "Beam to Column Splice",
      options: [{ key: "ep", label: "End Plate", img: endPlate }],
    },
    {
      label: "Column to Column Splice",
      options: [
        { key: "cpb", label: "Cover Plate Bolted", img: coverPlateBolted },
        { key: "cpw", label: "Cover Plate Welded", img: coverPlateWelded },
        { key: "ep", label: "End Plate", img: endPlate },
      ],
    },
    {
      label: "PEB",
      options: [],
    },
  ],
  base: [
    {
      label: "Base Plates",
      options: [
        { key: "bp", label: "Base Plate Connection", img: endPlate },
      ],
    },
  ],
  truss: [
    {
      label: "Truss Connections",
      options: [],
    },
  ],
};

// Generic submodule content for other modules (simple, no nesting)
const GENERIC_SUBMODULE_CONTENT = {
  tension: [
    {
      label: "Tension Member",
      options: [
        { key: "boltedtoendplate", label: "Bolted to End Plate", img: coverPlateBolted },
        { key: "weldedtoendplate", label: "Welded to End Plate", img: coverPlateWelded },
      ],
    },
  ],
  compression: [
    {
      label: "Compression Member",
      options: [
        { key: "struts", label: "Struts in Trusses", img: coverPlateBolted },
      ],
    },
  ],
  flexure: [
    {
      label: "Flexure Member",
      options: [
        { key: "ssb", label: "Simply Supported Beam", img: endPlate },
        { key: "cb", label: "Cantilever Beam", img: coverPlateBolted },
      ],
    },
  ],
};

// Route mapping for different modules
const MODULE_ROUTES = {
  // Shear Connections
  fp: "/design/connections/shear/fin_plate",
  [MODULE_KEY_FIN_PLATE]: "/design/connections/shear/fin_plate",
  ca: "/design/connections/shear/cleat_angle", 
  ep: "/design/connections/shear/end_plate",
  sa: "/design/connections/shear/seated_angle",
  // Moment Connections - Beam to Beam
  cpb: "/design/connections/beam-to-beam-splice/cover_plate_bolted",
  cpw: "/design/connections/beam-to-beam-splice/cover_plate_welded",
  // Tension Members
  boltedtoendplate: "/design/tension-member/bolted_to_end_gusset",
  weldedtoendplate: "/design/tension-member/welded_to_end_gusset", // Add this route if needed
  // Base Plate
  bp: "/design/connections/base_plate", // Add this route if needed
};

// SectionCards component for rendering section cards
const SectionCards = ({ section, activeSubmodule, onModuleClick }) => {
  const navigate = useNavigate();
  
  const handleModuleClick = (optionKey, sectionLabel) => {
    // Call the parent handler instead of directly navigating
    onModuleClick(optionKey, sectionLabel);
  };

  return (
  <div
    className="flex-1 min-w-[380px] border-2 border-osdag-border rounded-xl mb-8 px-4 py-4 shadow-card dark:text-gray-300"
  >
    <div className="mb-4 -mt-7 inline-block px-2">{section.label}</div>
    <div className="flex gap-6">
      {section.options.map((opt) => (
        <div
          key={opt.key}
          className="group flex-1 h-40 min-w-[120px] flex flex-col items-center justify-between
            border rounded-lg shadow-card transition-all duration-200
            hover:border-osdag-green relative"
        >
          <img src={opt.img} alt={opt.label} className="h-20 mt-5 mb-2" />
          <div className="font-semibold mb-2">{opt.label}</div>
          <div
            className="absolute cursor-pointer text-center left-0 right-0 bottom-[-40px] opacity-0 group-hover:bottom-0 group-hover:opacity-100
              text-osdag-green font-bold text-base border-t bg-white border-osdag-border rounded-b-lg py-2 transition-all duration-200"
            onClick={() => handleModuleClick(opt.key, section.label)}
          >
            Open
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

const TabbedModulePage = () => {
  // Get module name from URL path since we're not using params
  const moduleName = window.location.pathname.split('/')[1];
  const navigate = useNavigate();
  const submodules = MODULE_SUBMODULES[moduleName] || [];
  const [activeSubmodule, setActiveSubmodule] = useState(submodules[0]?.key);
  
  // Modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  
  useEffect(() => {
    setActiveSubmodule(submodules[0]?.key);
  }, [moduleName]);

  const handleModuleClick = (optionKey, sectionLabel) => {
    // Determine the route based on the module
    let route = '';
    
    // Special handling for end plate modules based on context
    if (optionKey === "ep") {
      if (activeSubmodule === "moment") {
        if (sectionLabel === "Beam to Beam Splice") {
          route = "/design/connections/beam-to-beam-splice/end_plate";
        } else if (sectionLabel === "Beam to Column Splice") {
          route = "/design/connections/column-beam/end_plate";
        } else {
          // Default for other moment connections (Column to Column, etc.)
          route = "/design/connections/beam-to-beam-splice/end_plate";
        }
      } else {
        // Default to shear end plate
        route = "/design/connections/shear/end_plate";
      }
    } else {
      route = MODULE_ROUTES[optionKey];
    }

    // Guest user: skip modal and backend, navigate directly
    if (isGuestUser()) {
      if (route) {
        navigate(route);
      }
      return;
    }

    // Non-guest: show modal and create project
    if (route) {
      setSelectedModule({
        key: optionKey,
        label: sectionLabel,
        route: route
      });
      setShowProjectModal(true);
    }
  };

  const handleProjectModalConfirm = async (projectName) => {
    if (selectedModule) {
      try {
        // Replace spaces with underscores for project name
        const safeProjectName = (projectName || `${selectedModule.label} Project`).replace(/\s+/g, '_');
        // Create project in database
        const response = await fetch('http://localhost:8000/api/projects/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: safeProjectName,
            module_id: selectedModule.key,
            module_name: selectedModule.label,
            user_email: getCurrentUserEmail(),
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          // Navigate to the module with project name in URL
          navigate(`${selectedModule.route}/${safeProjectName}`);
        } else {
          // Still navigate even if project creation fails, but without project name
          navigate(selectedModule.route);
        }
      } catch (error) {
        // Navigate even if there's an error, but without project name
        navigate(selectedModule.route);
      }
    }
    
    setShowProjectModal(false);
    setSelectedModule(null);
  };

  const handleProjectModalCancel = () => {
    setShowProjectModal(false);
    setSelectedModule(null);
  };

  if (!moduleName || !MODULE_SUBMODULES[moduleName]) {
    return <div className="p-8">Module not found</div>;
  }

  return (
    <div className="w-full p-8 dark:text-gray-300">
      {/* Submodules Tab Bar */}
      <div className="flex mb-8 gap-2">
        {submodules.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubmodule(tab.key)}
            className={`flex-1 py-3 text-lg font-semibold border-2 rounded-xl transition-colors duration-150
              ${activeSubmodule === tab.key
                ? 'bg-osdag-green text-white dark:bg-osdag-dark-green dark:border-osdag-dark-green'
                : "border-osdag-border hover:bg-osdag-light-green/10 hover:text-osdag-green dark:bg-slate-950 dark:text-gray-300  dark:hover:text-osdag-green"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-wrap gap-8">
        {(moduleName === "Connections"
          ? (CONNECTIONS_TAB_CONTENT[activeSubmodule] || [])
          : (GENERIC_SUBMODULE_CONTENT[activeSubmodule] || [])
        ).map((section) => (
          <SectionCards 
            key={section.label} 
            section={section} 
            activeSubmodule={activeSubmodule}
            onModuleClick={handleModuleClick}
          />
        ))}
      </div>

      {/* Project Name Modal */}
      <ProjectNameModal
        visible={showProjectModal}
        onConfirm={handleProjectModalConfirm}
        onCancel={handleProjectModalCancel}
        title="Name Your Project"
        message="Please give your project a name to save it for later access."
        moduleName={selectedModule ? selectedModule.label : ''}
        defaultValue=""
        confirmText="Create Project"
      />
    </div>
  );
};

export default TabbedModulePage;
