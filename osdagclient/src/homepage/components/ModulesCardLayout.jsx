import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import coverPlateBolted from "../../assets/ShearConnection/sc_fin_plate.png";
import coverPlateWelded from "../../assets/ShearConnection/sc_fin_plate.png";
import endPlate from "../../assets/ShearConnection/sc_fin_plate.png";

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
        { key: "fp", label: "Fin Plate", img: coverPlateBolted },
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
const SectionCards = ({ section, activeSubmodule }) => {
  const navigate = useNavigate();
  
  const handleModuleClick = (optionKey, sectionLabel) => {
    // Special handling for end plate modules based on context
    if (optionKey === "ep") {
      if (activeSubmodule === "moment") {
        if (sectionLabel === "Beam to Beam Splice") {
          navigate("/design/connections/beam-to-beam-splice/end_plate");
                 } else if (sectionLabel === "Beam to Column Splice") {
           navigate("/design/connections/column-beam/end_plate");
        } else {
          // Default for other moment connections (Column to Column, etc.)
          navigate("/design/connections/beam-to-beam-splice/end_plate");
        }
             } else {
         // Default to shear end plate
         navigate("/design/connections/shear/end_plate");
       }
    } else {
      const route = MODULE_ROUTES[optionKey];
      if (route) {
        navigate(route);
      }
    }
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
  console.log("Active moduleName:", moduleName);
  useEffect(() => {
    setActiveSubmodule(submodules[0]?.key);
  }, [moduleName]);

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
          <SectionCards key={section.label} section={section} activeSubmodule={activeSubmodule} />
        ))}
      </div>
    </div>
  );
};

export default TabbedModulePage;
