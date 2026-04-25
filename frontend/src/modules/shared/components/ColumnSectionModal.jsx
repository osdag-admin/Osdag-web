import React, { useContext, useState, useEffect } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select, Button } from "antd";
import CustomSectionModal from "./CustomSectionModal";
import SectionTabToolbar from "./SectionTabToolbar";
import Slope_Beam from "../../../assets/Slope_Beam.png";
// Parallel_Beam.png

const { Option } = Select;

const readOnlyFontStyle = {
  color: "rgb(0 0 0 / 67%)",
  fontSize: "12px",
  fontWeight: "600",
};

const ColumnSectionModal = ({
  supportingSectionData,
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
  inputs,
  materialList: materialsFromParent,
  isGuest,
  onRefetchModuleOptions,
  suppressInitialMaterialDispatch = false,
}) => {
  const {
    // materialList: ctxMaterialList,
    manageDesignPreferences,
    supporting_material_details,
    conn_material_details,
  } = useContext(ModuleContext);
  const materials = materialsFromParent ?? [];
  console.log("designPrefInputs:", designPrefInputs);
  // console.log("materials1:", materials);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (suppressInitialMaterialDispatch) return;
    const material = materials.filter(
      (value) => value.Grade === designPrefInputs.supporting_material
    );
    if (material[0]) {
      manageDesignPreferences("material_update", {
        materialType: "supporting",
        materialData: material[0],
      });
    }
  }, [suppressInitialMaterialDispatch]);

  const handleMaterialChange = (value) => {
    if (value === -1) {
      setShowModal(true);
      return;
    }
    const material = materials.find((item) => item.Grade === value);
    if (!material) return;
    setDesignPrefInputs({
      ...designPrefInputs,
      supporting_material: material.Grade,
    });

    manageDesignPreferences("material_update", {
      materialType: "supporting",
      materialData: material,
    });
  };

  // const handleClearSectionTab = () => {
  //   setDesignPrefInputs((prev) => ({
  //     ...prev,
  //     supporting_material:
  //       inputs.supporting_material ??
  //       inputs.connector_material ??
  //       inputs.material ??
  //       prev.supporting_material,
  //   }));
  // };
  const handleClearSectionTab = () => {
  setDesignPrefInputs((prev) => ({
    ...prev,

    // Preserve material related values (like desktop)
    supporting_material:
      inputs.supporting_material ??
      inputs.connector_material ??
      inputs.material ??
      prev.supporting_material,

    material:
      inputs.material ?? prev.material,

    connector_material:
      inputs.connector_material ?? prev.connector_material,

    // Preserve mechanical properties
    fu: prev.fu,
    fy: prev.fy,
    E: prev.E,
    G: prev.G,
    poisson_ratio: prev.poisson_ratio,
    thermal_expansion: prev.thermal_expansion,

    // Preserve type/source
    type: prev.type,
    source: prev.source,
  }));
  alert("rr");
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
              // value={supportingSectionData.Designation}
              value={inputs.column_section || inputs.member_designation || ""}
              // disabled
              // style={readOnlyFontStyle}
            />
          </div>
          <div className="sub-container">
            <h4>Mechanical Properties</h4>
            {/* <div className="input-cont">
              <h5>Material *</h5>
              <div>
                <Select
                  disabled={isInputLocked}
                  style={{ width: "132px", height: "25px", fontSize: "12px" }}
                  // value={
                  //   designPrefInputs.supporting_material ??
                  //   inputs.supporting_material ??
                  //   inputs.connector_material ??
                  //   inputs.material
                  // }
                  value={designPrefInputs.supporting_material || ""}
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
                      supporting_material: material.Grade,
                    });
                    manageDesignPreferences("section_update", {
                      id: 1,
                      materialValue: material.Grade,
                    });
                    manageDesignPreferences("material_update", {
                      materialType: "supporting",
                      materialData: material,
                    });
                  }}
                >
                  {materials.map((item) => {
                    return (
                      <Option key={item.id} value={item.Grade}>
                        {item.Grade}
                      </Option>
                    );
                  })}
                </Select>
                
              </div>
            </div> */}
            <div className="input-cont">
            <h5>Material *</h5>
            <div>
              <Select
                disabled={isInputLocked}
                style={{ width: "134px", height: "25px", fontSize: "12px" }}
                // value={designPrefInputs.connector_material}
                value={designPrefInputs.supporting_material || ""}
                onSelect={(value) => {
                  handleMaterialChange(value);
                }}
              >
                {materials.map((item, index) => {
                  return (
                    <Option key={`columnSection-${item.id??index}`} value={item.Grade}>
                      {item.Grade}
                    </Option>
                  );
                })}
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
                  supporting_material_details[0]
                    ? supporting_material_details[0].Ultimate_Tensile_Stress
                    : 0
                }
                // disabled
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
                  supporting_material_details[0]
                    ? supporting_material_details[0].Yield_Stress_greater_than_40
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
                  //   supportingSectionData.Type
                  //     ? supportingSectionData.Type
                  //     : "Rolled"
                  // }
                  value={
                    inputs.Type
                      ? inputs.Type
                      : "Rolled"
                  }
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
                // value={supportingSectionData.Source || 0}
                value={inputs.Source || "IS808 Rev"}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
          </div>

        </div>

        {/* Middle Section */}
        <div className="col-middle">
          <div className="sub-container">
            <h4>Dimensions</h4>
            <div className="input-cont">
              <h5>Depth, D (mm)*</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.D || 0}
                value={supportingSectionData.D || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Flange Width, B (mm)*</h5>
              <Input
                type="text"
                name="flange-widht"
                className="input-design-pref"
                // value={supportingSectionData.B || 0}
                value={supportingSectionData.B || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Flange Thickness, T (mm)*</h5>
              <Input
                type="text"
                name="flange-thickness"
                className="input-design-pref"
                // value={supportingSectionData.T || 0}
                value={supportingSectionData.T || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Web Thickness, t (mm)*</h5>
              <Input
                type="text"
                name="web-thickness"
                className="input-design-pref"
                // value={supportingSectionData.tw || 0}
                value={supportingSectionData.tw || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Flange Slope, a (deg.)*</h5>
              <Input
                type="text"
                name="flange-slope"
                className="input-design-pref"
                // value={supportingSectionData.FlangeSlope || 0}
                value={supportingSectionData.FlangeSlope || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Root Radius, R1 (mm)*</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R1 || 0}
                value={supportingSectionData.R1 || 0}
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Toe Radius, R2 (mm)*</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                value={supportingSectionData.R2 || 0}
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
                // value={supportingSectionData.R2 || 0}
                value={supportingSectionData.Mass || 0}
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
                value={supportingSectionData.Area || 0}
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
                value={supportingSectionData.Iz || 0}
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
                value={supportingSectionData.Iy || 0}
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
                value={supportingSectionData.rz || 0}
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
                value={supportingSectionData.ry || 0}
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
                value={supportingSectionData.Zz || 0}
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
                value={supportingSectionData.Zy || 0}
                style={readOnlyFontStyle}
              />
            </div>
          </div>
        </div>
        {/* Right Section (Image like SS-2) */}
        <div className="col-right">
          <div className="section-img">
            <img
              src={Slope_Beam}
              alt="Section Diagram"
              style={{ width: "100%", maxWidth: "320px" }}
            />
          </div>

          {/* <div className="section-properties"> */}
          <div className="sub-container" style={{width: "310px"}}>
            <h4>Section Properties</h4>
            <div className="input-cont">
              <h5>Plastic Modulus, Zpz (cm³)</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                // value={supportingSectionData.R2 || 0}
                value={supportingSectionData.Zpz || 0}
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
                value={supportingSectionData.Zpy || 0}
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
                value={supportingSectionData.It || 0}
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
                value={supportingSectionData.Iw || 0}
                style={readOnlyFontStyle}
              />
            </div>
          </div>

        </div>
              </div>
      
      <SectionTabToolbar
        sectionTable="Columns"
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
        type="supporting"
        materialList={materials}
        onRefetchModuleOptions={onRefetchModuleOptions}
      />

      
    </>
  );
};

export default ColumnSectionModal;

