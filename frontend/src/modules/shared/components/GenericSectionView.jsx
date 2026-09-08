/* eslint-disable react/prop-types */
import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select } from "antd";
import { STEEL_CONSTANTS, UNIT_LABELS } from "../constants/engineering";
import CustomMaterialModal from "./CustomMaterialModal";
import SectionTabToolbar from "./SectionTabToolbar";
import { notifyCustomSectionAdded } from "../hooks/useModuleData";

const { Option } = Select;

const readOnlyFontStyle = {
  color: "rgb(0 0 0 / 67%)",
  fontSize: "12px",
  fontWeight: "600",
};

/**
 * GenericSectionView - A unified view for section details (Beam, Column, Angle, etc.)
 * This replaces the redundant *SectionModal.jsx components in the shared directory.
 */
const GenericSectionView = ({
  sectionData,        // supportingSectionData or supportedSectionData
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
  inputs,             // Base inputs from parent
  materialList = [],
  isGuest,
  onRefetchModuleOptions,
  suppressInitialMaterialDispatch = false,
  sectionType,        // 'supporting' or 'supported'
  sectionTableName,   // 'Beams', 'Columns', 'Angles', etc.
  displayConfig,      // Configuration for fields and image
  onClearSection,     // Callback to clear parent state if needed
  onDesignationChange,// Callback when designation changes
  hideDropdown        // If true, suppress dropdown (e.g. for primary members)
}) => {
  const {
    manageDesignPreferences,
    beamList = [],
    columnList = [],
    angleList = [],
    channelList = [],
    sectionDesignation = [],
    [sectionType === 'supporting' ? 'supporting_material_details' : 'supported_material_details']: materialDetails,
  } = useContext(ModuleContext);
  const [showModal, setShowModal] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [designationStr, setDesignationStr] = useState("");
  const [lastPropDesignation, setLastPropDesignation] = useState("");

  const getDropdownOptions = useCallback(() => {
    const fullList =
      sectionTableName === "Beams"
        ? beamList
        : sectionTableName === "Columns"
        ? columnList
        : sectionTableName === "Angles"
        ? angleList
        : sectionTableName === "Channels"
        ? channelList
        : [];

    let dockSelections = [];
    if (sectionTableName === "Beams") {
      dockSelections = inputs?.section_designation || inputs?.beam_section || inputs?.primary_beam || inputs?.secondary_beam;
    } else if (sectionTableName === "Columns") {
      dockSelections = inputs?.section_designation || inputs?.column_section || inputs?.member_designation;
    } else if (sectionTableName === "Angles") {
      dockSelections = inputs?.section_designation || inputs?.cleat_section || inputs?.seated_section || inputs?.Designation;
    } else if (sectionTableName === "Channels") {
      dockSelections = inputs?.section_designation || inputs?.section_designation;
    }

    let selectionsArr = [];
    if (Array.isArray(dockSelections)) {
      selectionsArr = dockSelections;
    } else if (dockSelections) {
      selectionsArr = [dockSelections];
    }

    const filteredSelections = selectionsArr.filter(
      (item) => item && item !== "All" && item !== "Select Section"
    );

    const finalOptionsList = filteredSelections.length > 0 ? filteredSelections : fullList;

    return finalOptionsList.map((item) =>
      typeof item === "object"
        ? item.Designation || item.value || item.Grade || String(item)
        : String(item)
    );
  }, [sectionTableName, beamList, columnList, angleList, channelList, inputs]);

  // Safety check for sectionData
  const safeSectionData = useMemo(() => sectionData || {}, [sectionData]);

  useEffect(() => {
    setEditableData(safeSectionData);
  }, [safeSectionData]);

  useEffect(() => {
    const resolved =
      inputs?.section_designation ||
      inputs?.member_designation ||
      inputs?.cleat_section ||
      inputs?.seated_section ||
      inputs?.[displayConfig.designationKey] ||
      "";

    let desigStr = "";
    if (Array.isArray(resolved)) {
      desigStr = resolved.find((item) => item !== "All") || resolved[0] || "";
    } else {
      desigStr = String(resolved || "");
    }

    if (!desigStr && !hideDropdown) {
      const opts = getDropdownOptions();
      if (opts.length > 0) {
        desigStr = opts[0];
        onDesignationChange?.(desigStr);
      }
    }

    if (desigStr !== lastPropDesignation) {
      setDesignationStr(desigStr);
      setLastPropDesignation(desigStr);
    }
  }, [inputs, displayConfig.designationKey, beamList, columnList, angleList, channelList, hideDropdown, getDropdownOptions, onDesignationChange, lastPropDesignation]);


  const materialKey = sectionType === 'supporting' ? 'supporting_material' : 'supported_material';
  const targetMaterial = designPrefInputs[materialKey];

  useEffect(() => {
    if (suppressInitialMaterialDispatch) return;
    const material = materialList.find((v) => v.Grade === targetMaterial);
    if (material) {
      manageDesignPreferences("material_update", {
        materialType: sectionType,
        materialData: material,
      });
    }
  }, [suppressInitialMaterialDispatch, targetMaterial, materialList, sectionType, manageDesignPreferences]);

  const handleMaterialChange = (value) => {
    if (value === -1) {
      setShowModal(true);
      return;
    }
    const material = materialList.find((item) => item.Grade === value);
    if (!material) return;

    setDesignPrefInputs({
      ...designPrefInputs,
      [materialKey]: material.Grade,
    });

    manageDesignPreferences("material_update", {
      materialType: sectionType,
      materialData: material,
    });
  };

  const handleClearSectionTab = () => {
    onClearSection?.();
    setDesignPrefInputs((prev) => ({
      ...prev,
      [materialKey]:
        inputs?.[materialKey] ??
        inputs?.connector_material ??
        inputs?.material ??
        prev[materialKey],
    }));
  };

  const handleAddSection = async () => {
    if (!designationStr) {
      alert("Please fill all the missing parameters!");
      return;
    }
    const requiredKeys = [
      ...(displayConfig.dimensions || []).map(f => f.key),
      ...(displayConfig.properties?.middle || []).map(f => f.key),
      ...(displayConfig.properties?.right || []).map(f => f.key)
    ];

    for (const key of requiredKeys) {
      if (editableData[key] === undefined || editableData[key] === null || editableData[key] === "") {
        alert("Please fill all the missing parameters!");
        return;
      }
    }

    const payload = { ...editableData, Designation: designationStr };
    try {
      const { addCustomSection } = await import("../../../datasources/sectionsDataSource");
      await addCustomSection(sectionTableName, payload);
      notifyCustomSectionAdded({ table: sectionTableName, designation: designationStr });
      await onRefetchModuleOptions?.();
      const listMap = {
        Columns: [...columnList, ...sectionDesignation],
        Beams: [...beamList, ...sectionDesignation],
        Angles: angleList,
        Channels: channelList,
      };
      const visible = (listMap[sectionTableName] || []).some(
        (item) => String(item) === String(designationStr)
      );
      if (visible) {
        alert("Data is added successfully to the database!");
      } else {
        alert("Section saved. Dropdown sync is in progress, please reopen the list.");
      }
    } catch (e) {
      const msg = e?.message || "";
      if (msg.includes("400") || msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
        alert("Designation already exists in the database!");
      } else {
        alert(msg || "Failed to add section.");
      }
    }
  };

  const renderField = (label, value, unit = "", options = null, dbKey = null) => {
    const isAlwaysDisabled = dbKey === "Source";
    const fieldDisabled = isAlwaysDisabled || isInputLocked;

    return (
      <div className="input-cont">
        <h5>{label}{unit ? `, ${unit}` : ""}</h5>
        {options ? (
          <Select
            disabled={fieldDisabled}
            style={{ width: "132px", height: "25px", fontSize: "12px" }}
            value={value}
            onSelect={options.onSelect}
          >
            {options.items.map((opt, idx) => (
              <Option key={idx} value={opt}>{opt}</Option>
            ))}
          </Select>
        ) : (
          <Input
            type="text"
            className="input-design-pref"
            value={value ?? ""}
            disabled={fieldDisabled}
            style={fieldDisabled ? readOnlyFontStyle : { fontSize: "12px", color: "#000" }}
            onChange={(e) => {
              if (dbKey && !isAlwaysDisabled) {
                setEditableData(prev => ({
                  ...prev,
                  [dbKey]: e.target.value,
                  ...(dbKey !== 'Type' ? { Source: 'Custom' } : {})
                }));
              }
            }}
          />
        )}
      </div>
    );
  };

  const materialInfo = materialDetails?.[0] || {};

  return (
    <>
      <div className="col-beam-cont">
        {/* Left Section: Mechanical Properties */}
        <div className="col-left">
          <div className="input-cont">
            <h5>Designation</h5>
            {isInputLocked ? (
              <Input
                type="text"
                className="input-design-pref text-[#808080] bg-[#f5f5f5]"
                value={designationStr}
                disabled={true}
              />
            ) : hideDropdown ? (
              <Input
                type="text"
                value={designationStr}
                onChange={(e) => {
                  setDesignationStr(e.target.value);
                  onDesignationChange?.(e.target.value);
                }}
                className="input-design-pref text-black"
              />
            ) : (
              <div className="flex flex-col gap-[5px]">
                <Select
                  value={designationStr}
                  onChange={(val) => {
                    setDesignationStr(val);
                    onDesignationChange?.(val);
                  }}
                  className="input-design-pref"
                  dropdownMatchSelectWidth={false}
                >
                  {getDropdownOptions().map((opt) => (
                    <Option key={opt} value={opt}>
                      {opt}
                    </Option>
                  ))}
                </Select>
                <Input
                  type="text"
                  placeholder="Custom name..."
                  value={designationStr}
                  onChange={(e) => setDesignationStr(e.target.value)}
                  className="input-design-pref text-black"
                />
              </div>
            )}
          </div>

          <div className="sub-container">
            <h4>Mechanical Properties</h4>
            <div className="input-cont">
              <h5>Material *</h5>
              <Select
                disabled={isInputLocked}
                style={{ width: "134px", height: "25px", fontSize: "12px" }}
                value={designPrefInputs[materialKey] || ""}
                onSelect={handleMaterialChange}
              >
                {materialList.map((item, index) => (
                  <Option key={index} value={item.Grade}>{item.Grade}</Option>
                ))}
              </Select>
            </div>

            {renderField("Ultimate Strength", materialInfo.Ultimate_Tensile_Stress, UNIT_LABELS.FU)}
            {renderField("Yield Strength", materialInfo.Yield_Stress_greater_than_40, UNIT_LABELS.FY)}
            {renderField("Modulus of Elasticity", STEEL_CONSTANTS.E, UNIT_LABELS.E)}
            {renderField("Modulus of Rigidity", STEEL_CONSTANTS.G, UNIT_LABELS.G)}
            {renderField("Poisson's Ratio", STEEL_CONSTANTS.POISSON_RATIO)}
            {renderField(`Thermal Expansion Coefficient (x10^-6 / C)`, STEEL_CONSTANTS.THERMAL_EXPANSION)}

            {displayConfig.showType && renderField("Type", editableData.Type || "Rolled", "", {
              items: ["Rolled", "Welded"],
              onSelect: (val) => setEditableData(prev => ({ ...prev, Type: val }))
            })}

            {renderField("Source", editableData.Source || "IS808 Rev", "", null, "Source")}
          </div>
        </div>

        {/* Middle Section: Dimensions & Section Properties */}
        <div className="col-middle">
          <div className="sub-container">
            <h4>Dimensions</h4>
            {displayConfig.dimensions.map(field =>
              renderField(field.label, editableData[field.key], field.unit || UNIT_LABELS.DIMENSION, null, field.key)
            )}

            <h4>Section Properties</h4>
            {displayConfig.properties.middle.map(field =>
              renderField(field.label, editableData[field.key], field.unit, null, field.key)
            )}
          </div>
        </div>

        {/* Right Section: Image & More Section Properties */}
        <div className="col-right">
          <div className="section-image">
            <img
              src={displayConfig.image}
              alt="Section Diagram"
              style={{ width: "100%", maxWidth: "320px" }}
            />
          </div>

          <div className="sub-container" style={{ width: "310px" }}>
            <h4>Section Properties</h4>
            {displayConfig.properties.right.map(field =>
              renderField(field.label, editableData[field.key], field.unit, null, field.key)
            )}
          </div>
        </div>
      </div>

      <SectionTabToolbar
        sectionTable={sectionTableName}
        isInputLocked={isInputLocked}
        isGuest={isGuest}
        onRefetchModuleOptions={onRefetchModuleOptions}
        dropdownLists={{
          beamList,
          columnList,
          angleList,
          topAngleList: angleList,
          channelList,
          sectionDesignation,
        }}
        onClearTab={handleClearSectionTab}
        onAddSection={handleAddSection}
      />

      <CustomMaterialModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={setDesignPrefInputs}
        inputValues={designPrefInputs}
        type={sectionType}
        materialList={materialList}
        onRefetchModuleOptions={onRefetchModuleOptions}
      />
    </>
  );
};

export default GenericSectionView;
