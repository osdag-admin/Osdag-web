import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
    { key: "singleangle", label: "Single Angle" },
    { key: "doubleangle", label: "Double Angle" },
    { key: "plate", label: "Plate" },
  ],
  CompressionMember: [
    { key: "singleangle", label: "Single Angle" },
    { key: "doubleangle", label: "Double Angle" },
    { key: "builtup", label: "Built-up Section" },
  ],
  FlexureMember: [
    { key: "ibeam", label: "I-Beam" },
    { key: "channel", label: "Channel Section" },
    { key: "box", label: "Box Section" },
  ],
  'Beam-Column': [
    { key: "strongaxis", label: "Strong Axis" },
    { key: "weakaxis", label: "Weak Axis" },
    { key: "biaxial", label: "Biaxial Bending" },
  ],
  PlateGirder: [
    { key: "welded", label: "Welded Plate Girder" },
    { key: "bolted", label: "Bolted Plate Girder" },
    { key: "hybrid", label: "Hybrid Plate Girder" },
  ],
  Truss: [
    { key: "pratt", label: "Pratt Truss" },
    { key: "warren", label: "Warren Truss" },
    { key: "howe", label: "Howe Truss" },
  ],
  '2DFrame': [
    { key: "portal", label: "Portal Frame" },
    { key: "gabled", label: "Gabled Frame" },
    { key: "sway", label: "Sway Frame" },
  ],
  '3DFrame': [
    { key: "industrial", label: "Industrial Frame" },
    { key: "commercial", label: "Commercial Frame" },
    { key: "residential", label: "Residential Frame" },
  ],
  GroupDesign: [
    { key: "group1", label: "Group Design 1" },
    { key: "group2", label: "Group Design 2" },
    { key: "group3", label: "Group Design 3" },
  ],
};

// Content for "connections" submodules (complex/nested)
const CONNECTIONS_TAB_CONTENT = {
  shear: [
    {
      label: "Shear Connections",
      options: [
        { key: "sc1", label: "Shear Connection 1", img: coverPlateBolted },
        { key: "sc2", label: "Shear Connection 2", img: coverPlateWelded },
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
        { key: "ep1", label: "End Plate", img: endPlate },
        { key: "cpw", label: "Cover Plate Welded", img: coverPlateWelded },
        { key: "ep2", label: "End Plate", img: endPlate },
      ],
    },
    {
      label: "PEB",
      options: [
        { key: "ep", label: "End Plate", img: endPlate },
        { key: "cpw", label: "Cover Plate Welded", img: coverPlateWelded },
      ],
    },
  ],
  base: [
    {
      label: "Base Plates",
      options: [
        { key: "bp1", label: "Base Plate 1", img: endPlate },
        { key: "bp2", label: "Base Plate 2", img: coverPlateBolted },
      ],
    },
  ],
  truss: [
    {
      label: "Truss Connections",
      options: [
        { key: "tc1", label: "Truss Connection 1", img: coverPlateBolted },
        { key: "tc2", label: "Truss Connection 2", img: coverPlateWelded },
      ],
    },
  ],
};

// Generic submodule content for other modules (simple, no nesting)
const GENERIC_SUBMODULE_CONTENT = {
  singleangle: [
    {
      label: "Single Angle",
      options: [
        { key: "sa1", label: "Design 1", img: coverPlateBolted },
        { key: "sa2", label: "Design 2", img: coverPlateWelded },
      ],
    },
  ],
  doubleangle: [
    {
      label: "Double Angle",
      options: [
        { key: "da1", label: "Design 1", img: coverPlateBolted },
        { key: "da2", label: "Design 2", img: coverPlateWelded },
      ],
    },
  ],
  plate: [
    {
      label: "Plate",
      options: [
        { key: "pl1", label: "Design 1", img: endPlate },
        { key: "pl2", label: "Design 2", img: coverPlateBolted },
      ],
    },
  ],
  builtup: [
    {
      label: "Built-up Section",
      options: [
        { key: "bu1", label: "Design 1", img: coverPlateWelded },
        { key: "bu2", label: "Design 2", img: endPlate },
      ],
    },
  ],
  ibeam: [
    {
      label: "I-Beam",
      options: [
        { key: "ib1", label: "Design 1", img: coverPlateBolted },
        { key: "ib2", label: "Design 2", img: coverPlateWelded },
      ],
    },
  ],
  channel: [
    {
      label: "Channel Section",
      options: [
        { key: "ch1", label: "Design 1", img: endPlate },
        { key: "ch2", label: "Design 2", img: coverPlateBolted },
      ],
    },
  ],
  box: [
    {
      label: "Box Section",
      options: [
        { key: "bx1", label: "Design 1", img: coverPlateWelded },
        { key: "bx2", label: "Design 2", img: endPlate },
      ],
    },
  ],
  strongaxis: [
    {
      label: "Strong Axis",
      options: [
        { key: "sa1", label: "Design 1", img: coverPlateBolted },
        { key: "sa2", label: "Design 2", img: coverPlateWelded },
      ],
    },
  ],
  weakaxis: [
    {
      label: "Weak Axis",
      options: [
        { key: "wa1", label: "Design 1", img: endPlate },
        { key: "wa2", label: "Design 2", img: coverPlateBolted },
      ],
    },
  ],
  biaxial: [
    {
      label: "Biaxial Bending",
      options: [
        { key: "bb1", label: "Design 1", img: coverPlateWelded },
        { key: "bb2", label: "Design 2", img: endPlate },
      ],
    },
  ],
  welded: [
    {
      label: "Welded Plate Girder",
      options: [
        { key: "wp1", label: "Design 1", img: coverPlateBolted },
        { key: "wp2", label: "Design 2", img: coverPlateWelded },
      ],
    },
  ],
  bolted: [
    {
      label: "Bolted Plate Girder",
      options: [
        { key: "bp1", label: "Design 1", img: endPlate },
        { key: "bp2", label: "Design 2", img: coverPlateBolted },
      ],
    },
  ],
  hybrid: [
    {
      label: "Hybrid Plate Girder",
      options: [
        { key: "hp1", label: "Design 1", img: coverPlateWelded },
        { key: "hp2", label: "Design 2", img: endPlate },
      ],
    },
  ],
  pratt: [
    {
      label: "Pratt Truss",
      options: [
        { key: "pt1", label: "Design 1", img: coverPlateBolted },
        { key: "pt2", label: "Design 2", img: coverPlateWelded },
      ],
    },
  ],
  warren: [
    {
      label: "Warren Truss",
      options: [
        { key: "wt1", label: "Design 1", img: endPlate },
        { key: "wt2", label: "Design 2", img: coverPlateBolted },
      ],
    },
  ],
  howe: [
    {
      label: "Howe Truss",
      options: [
        { key: "ht1", label: "Design 1", img: coverPlateWelded },
        { key: "ht2", label: "Design 2", img: endPlate },
      ],
    },
  ],
  portal: [
    {
      label: "Portal Frame",
      options: [
        { key: "pf1", label: "Design 1", img: coverPlateBolted },
        { key: "pf2", label: "Design 2", img: coverPlateWelded },
      ],
    },
  ],
  gabled: [
    {
      label: "Gabled Frame",
      options: [
        { key: "gf1", label: "Design 1", img: endPlate },
        { key: "gf2", label: "Design 2", img: coverPlateBolted },
      ],
    },
  ],
  sway: [
    {
      label: "Sway Frame",
      options: [
        { key: "sf1", label: "Design 1", img: coverPlateWelded },
        { key: "sf2", label: "Design 2", img: endPlate },
      ],
    },
  ],
  industrial: [
    {
      label: "Industrial Frame",
      options: [
        { key: "if1", label: "Design 1", img: coverPlateBolted },
        { key: "if2", label: "Design 2", img: coverPlateWelded },
      ],
    },
  ],
  commercial: [
    {
      label: "Commercial Frame",
      options: [
        { key: "cf1", label: "Design 1", img: endPlate },
        { key: "cf2", label: "Design 2", img: coverPlateBolted },
      ],
    },
  ],
  residential: [
    {
      label: "Residential Frame",
      options: [
        { key: "rf1", label: "Design 1", img: coverPlateWelded },
        { key: "rf2", label: "Design 2", img: endPlate },
      ],
    },
  ],
  group1: [
    {
      label: "Group Design 1",
      options: [
        { key: "gd1", label: "Design 1", img: coverPlateBolted },
        { key: "gd2", label: "Design 2", img: coverPlateWelded },
      ],
    },
  ],
  group2: [
    {
      label: "Group Design 2",
      options: [
        { key: "gd3", label: "Design 1", img: endPlate },
        { key: "gd4", label: "Design 2", img: coverPlateBolted },
      ],
    },
  ],
  group3: [
    {
      label: "Group Design 3",
      options: [
        { key: "gd5", label: "Design 1", img: coverPlateWelded },
        { key: "gd6", label: "Design 2", img: endPlate },
      ],
    },
  ],
};

// SectionCards component for rendering section cards
const SectionCards = ({ section }) => (
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
          >
            Open
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TabbedModulePage = () => {
  const { moduleName } = useParams();
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
          <SectionCards key={section.label} section={section} />
        ))}
      </div>
    </div>
  );
};

export default TabbedModulePage;
