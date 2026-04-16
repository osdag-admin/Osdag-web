import React, { useContext, useState, useEffect } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select, Button } from "antd";
import equaldp from "../../../assets/equaldp.png";
import CustomSectionModal from "./CustomSectionModal";
import SectionTabToolbar from "./SectionTabToolbar";

const { Option } = Select;

const readOnlyFontStyle = {
  color: "rgb(0 0 0 / 67%)",
  fontSize: "12px",
  fontWeight: "600",
};

const CleatAngleSectionModal = ({
  supportedSectionData,
  inputs,
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
  materialList: materialsFromParent,
  isGuest,
  onRefetchModuleOptions,
}) => {
  const {
    manageDesignPreferences,
    supported_material_details,
  } = useContext(ModuleContext);
  const materials = materialsFromParent ?? [];
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const material = materials.filter(
      (value) => value.Grade === designPrefInputs.supported_material
    );
    if (material[0]) {
      manageDesignPreferences("material_update", {
        materialType: "supported",
        materialData: material[0],
      });
    }
  }, []);

  const handleClearSectionTab = () => {
    setDesignPrefInputs((prev) => ({
      ...prev,
      supported_material:
        inputs?.supported_material ??
        inputs?.connector_material ??
        inputs?.material ??
        prev.supported_material,
    }));
  };

  return (
    <>
      <div className="col-beam-cont">
        {/* Left Section */}
        <div className="col-left">
          <div className="input-cont">
            <h5>Designation</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportedSectionData.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
          </div>
          <div className="sub-container">
            <h4>Mechanical Properties</h4>
            <div className="input-cont">
              <h5>Material *</h5>
              <div>
                <Select
                  disabled={isInputLocked}
                  style={{ width: "132px", height: "25px", fontSize: "12px" }}
                  value={designPrefInputs.supported_material}
                  onSelect={(value) => {
                    if (isInputLocked) return;
                    if (value === -1) {
                      setShowModal(true);
                      return;
                    }
                    const material = materials.find((item) => item.Grade === value);
                    if (!material) return;
                    setDesignPrefInputs({
                      ...designPrefInputs,
                      supported_material: material.Grade,
                    });
                    manageDesignPreferences("section_update", {
                      id: 2,
                      materialValue: material.Grade,
                    });
                    manageDesignPreferences("material_update", {
                      materialType: "supported",
                      materialData: material,
                    });
                  }}
                >
                  {materials.map((item, index) => (
                    <Option key={item.id ?? index} value={item.Grade}>
                      {item.Grade}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="input-cont">
              <h5>Ultimate Strength, Fu (MPa)</h5>
              <Input
                type="text"
                name="ultimate-strength"
                className="input-design-pref"
                value={
                  supported_material_details[0]
                    ? supported_material_details[0].Ultimate_Tensile_Stress
                    : 0
                }
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Yield Strength, Fy (MPa)</h5>
              <Input
                type="text"
                name="yield-strength"
                className="input-design-pref"
                value={
                  supported_material_details[0]
                    ? supported_material_details[0].Yield_Stress_greater_than_40
                    : 0
                }
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Modulus of Elasticity, E (GPa)</h5>
              <Input
                type="text"
                name="modulus-elasticity"
                className="input-design-pref"
                value={200}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Modulus of Rigidity, G (GPa)</h5>
              <Input
                type="text"
                name="modulus-rigidity"
                className="input-design-pref"
                value={76.9}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Poisson's Ratio, v</h5>
              <Input
                type="text"
                name="poisson-ratio"
                className="input-design-pref"
                value={0.3}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Thermal Expansion Coefficient, (x10^(-8) / C)</h5>
              <Input
                type="text"
                name="thermal-coefficient"
                className="input-design-pref"
                value={12}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Type</h5>
              <div>
                <Select
                  style={{ width: "132px", height: "25px", fontSize: "12px" }}
                  // value={
                  //   supportedSectionData.Type
                  //     ? supportedSectionData.Type
                  //     : "Rolled"
                  // }
                  // disabled
                >
                  {["Rolled", "Welded"].map((item, index) => (
                    <Option key={index} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="input-cont">
              <h5>Source</h5>
              <Input
                type="text"
                name="source"
                className="input-design-pref"
                // value={supportedSectionData.Source || 0}
                // disabled
                style={readOnlyFontStyle}
              />
            </div>
          </div>
        </div>
        {/*  */}
        {/* Middle Section */}
        <div className="col-middle">
          <div className="sub-container">
            <h4>Dimensions</h4>
            <div className="input-cont">
              <h5>Long Leg, A (mm)*</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportedSectionData.D || 0}
                // disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Short Leg, B (mm)*</h5>
              <Input
                type="text"
                name="flange-widht"
                className="input-design-pref"
                // value={supportedSectionData.B || 0}
                // disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Leg Thickness, t (mm)*</h5>
              <Input
                type="text"
                name="flange-thickness"
                className="input-design-pref"
                // value={supportedSectionData.T || 0}
                // disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Root Radius, R1 (mm)*</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportedSectionData.R1 || 0}
                // disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Toe Radius, R2 (mm)*</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportedSectionData.R2 || 0}
                // disabled
                style={readOnlyFontStyle}
              />
            </div>

            <h4>Section Properties</h4>
            <div className="input-cont">
              <h5>Mass, M (Kg/m)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportedSectionData.D || 0}
                // disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Sectional Area, a (cm²)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Cz(cm)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Cz(cm)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>2nd Moment of Area, Iz (cm⁴)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>2nd Moment of Area, Iy (cm⁴)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>2nd Moment of Area, Iu (cm⁴)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>2nd Moment of Area, Iv (cm⁴)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Radius of Gyration, rz (cm)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Radius of Gyration, ry (cm)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
          </div>
        </div>

        {/* Right Section (Image like SS-2) */}
        <div className="col-right">  
        <div className="section-image">
          <img
            // src={ISection}
            src={equaldp}
            alt="Section Diagram"
            style={{ width: "100%", maxWidth: "320px" }}
          />
        </div>

        {/* <div className="section-properties"> */}
        <div className="sub-container" style={{width: "310px"}}>
            <h4>Section Properties</h4>
            <div className="input-cont">
              <h5>Radius of Gyration, ru (cm)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>

            <div className="input-cont">
              <h5>Radius of Gyration, rv (cm)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>

            <div className="input-cont">
              <h5>Elastic Modulus, Zz (cm³)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>

            <div className="input-cont">
              <h5>Elastic Modulus, Zy (ccm³)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>

            <div className="input-cont">
              <h5>Plastic Modulus, Zpz (cm³)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>

            <div className="input-cont">
              <h5>Plastic Modulus, Zpy (cm³)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>

            <div className="input-cont">
              <h5>Torsion Constant, It (cm⁴)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>

            <div className="input-cont">
              <h5>Warping Constant, Iw (cm⁶)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                style={readOnlyFontStyle}
              />
            </div>
          </div>
          </div>
      </div>
      <SectionTabToolbar
        sectionTable="Angles"
        isInputLocked={isInputLocked}
        isGuest={isGuest}
        onRefetchModuleOptions={onRefetchModuleOptions}
        onClearTab={handleClearSectionTab}
      />
      <CustomSectionModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={setDesignPrefInputs}
        inputValues={designPrefInputs}
        type="supported"
        materialList={materials}
        onRefetchModuleOptions={onRefetchModuleOptions}
      />
    </>
  );
};

export default CleatAngleSectionModal;