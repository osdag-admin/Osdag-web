import React, { useContext, useState, useEffect } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select } from "antd";
import CustomSectionModal from "./CustomSectionModal";

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
}) => {
  const {
    materialList,
    updateSourceAndMechType,
    getMaterialDetails,
    supporting_material_details,
  } = useContext(ModuleContext);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const material = materialList.filter(
      (value) => value.Grade === designPrefInputs.supporting_material
    );
    getMaterialDetails({ data: material[0], type: "supporting" });
  }, []);

  return (
    <>
      <div className="col-beam-cont">
        <div>
          <div className="input-cont">
            <h5>Designation</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              value={supportingSectionData.Designation}
              disabled
              style={readOnlyFontStyle}
            />
          </div>
          <div className="sub-container">
            <h4>Mechanical Properties</h4>
            <div className="input-cont">
              <h5>Material</h5>
              <div>
                <Select
                  disabled={isInputLocked}
                  style={{ width: "200px", height: "25px", fontSize: "12px" }}
                  value={designPrefInputs.supporting_material}
                  onSelect={(value) => {
                    if (isInputLocked) return;
                    if (value === -1) {
                      setShowModal(true);
                      return;
                    }
                    const material = materialList.find(
                      (item) => item.id === value
                    );
                    setDesignPrefInputs({
                      ...designPrefInputs,
                      supporting_material: material.Grade,
                    });
                    updateSourceAndMechType(1, material.Grade);
                    getMaterialDetails({ data: material, type: "supporting" });
                  }}
                >
                  {materialList.map((item) => {
                    return (
                      <Option key={item.id} value={item.id}>
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
              <h5>Thermal Expansion Coefficient (x10^(-8) / C)</h5>
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
                  style={{ width: "200px", height: "25px", fontSize: "12px" }}
                  value={
                    supportingSectionData.Type
                      ? supportingSectionData.Type
                      : "Rolled"
                  }
                  disabled
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
                value={supportingSectionData.Source || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
          </div>
        </div>
        {/*  */}
        <div>
          <div className="sub-container">
            <h4>Dimensions</h4>
            <div className="input-cont">
              <h5>Depth, D (mm)*</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                value={supportingSectionData.D || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Flange Width, B (mm)*</h5>
              <Input
                type="text"
                name="flange-widht"
                className="input-design-pref"
                value={supportingSectionData.B || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Flange Thickness, T (mm)*</h5>
              <Input
                type="text"
                name="flange-thickness"
                className="input-design-pref"
                value={supportingSectionData.T || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Web Thickness, t (mm)*</h5>
              <Input
                type="text"
                name="web-thickness"
                className="input-design-pref"
                value={supportingSectionData.tw || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Flange Slope, a (deg.)*</h5>
              <Input
                type="text"
                name="flange-slope"
                className="input-design-pref"
                value={supportingSectionData.FlangeSlope || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Root Radius, R1 (mm)*</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                value={supportingSectionData.R1 || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Toe Radius, R2 (mm)*</h5>
              <Input
                type="text"
                name="depth"
                className="input-design-pref"
                value={supportingSectionData.R2 || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>

            <div className="input-cont">
              <h5>Area of Cross Section, (mm2)</h5>
              <Input
                type="text"
                name="cross-area"
                className="input-design-pref"
                value={supportingSectionData.A || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Moment of Inertia about xx-axis, Ixx (mm4)</h5>
              <Input
                type="text"
                name="moment-xx"
                className="input-design-pref"
                value={supportingSectionData.IX || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Moment of Inertia about yy-axis, Iyy (mm4)</h5>
              <Input
                type="text"
                name="moment-yy"
                className="input-design-pref"
                value={supportingSectionData.IY || 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
          </div>
        </div>
      </div>
      <CustomSectionModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={setDesignPrefInputs}
        inputValues={designPrefInputs}
        type="supporting"
      />
    </>
  );
};

export default ColumnSectionModal;

