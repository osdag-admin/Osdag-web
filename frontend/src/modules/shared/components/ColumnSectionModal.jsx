import React, { useContext, useState, useEffect } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select, Button } from "antd";
import CustomSectionModal from "./CustomSectionModal";
import Slope_Beam from "../../../assets/Slope_Beam.png";
// Parallel_Beam.png
import sectionData from "./additional_inputs.json";

const { dimensions, section_properties, advanced_properties } = sectionData;

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
}) => {
  const {
    materialList,
    manageDesignPreferences,
    supporting_material_details,
  } = useContext(ModuleContext);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("designPrefInputs:", designPrefInputs);
    const material = materialList.filter(
      (value) => value.Grade === designPrefInputs.supporting_material
    );
    manageDesignPreferences("material_update", {
      materialType: "supporting",
      materialData: material[0],
    });
  }, []);

  const handleDownload = () => {
    const fileName = "Columns_Details.xlsx";
  
    const link = document.createElement("a");
    link.href = `/downloads/${fileName}`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="input-cont">
              <h5>Material *</h5>
              <div>
                <Select
                  disabled={isInputLocked}
                  style={{ width: "132px", height: "25px", fontSize: "12px" }}
                  // value={designPrefInputs.supporting_material}
                  value={inputs.connector_material || inputs.material}
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
                value={dimensions.depth_D_mm || 0}
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
                value={dimensions.flange_width_B_mm || 0}
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
                value={dimensions.flange_thickness_T_mm || 0}
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
                value={dimensions.web_thickness_t_mm || 0}
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
                value={dimensions.flange_slope_alpha_deg || 0}
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
                value={dimensions.root_radius_R1_mm || 0}
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
                value={dimensions.toe_radius_R2_mm || 0}
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
                value={section_properties.mass_M_kg_per_m || 0}
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
                value={section_properties.sectional_area_cm2 || 0}
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
                value={section_properties.second_moment_of_area_Iz_cm4 || 0}
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
                value={section_properties.second_moment_of_area_Iy_cm4 || 0}
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
                value={section_properties.radius_of_gyration_rz_cm || 0}
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
                value={section_properties.radius_of_gyration_ry_cm || 0}
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
                value={section_properties.elastic_modulus_Zz_cm3 || 0}
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
                value={section_properties.elastic_modulus_Zy_cm3 || 0}
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
                value={advanced_properties.plastic_modulus_Zpz_cm3 || 0}
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
                value={advanced_properties.plastic_modulus_Zpy_cm3 || 0}
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
                value={advanced_properties.torsion_constant_It_cm4 || 0}
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
                value={advanced_properties.warping_constant_Iw_cm6 || 0}
                style={readOnlyFontStyle}
              />
            </div>
          </div>

        </div>
              </div>
      
              <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "5px",
          borderTop: "1px solid #ccc",
        }}
      >
        <Button style={{ minWidth: "140px" }}>Add</Button>
        <Button style={{ minWidth: "140px" }}>Clear</Button>
        <Button
          style={{ minWidth: "140px" }}
          onClick={() => document.getElementById("import-xlsx").click()}
        >
          Import xlsx file
        </Button>
        <input
          id="import-xlsx"
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              console.log("Selected file:", file);
              const formData = new FormData();
              formData.append("file", file);
              fetch("/api/upload", { method: "POST", body: formData });
            }
          }}
        />
        <Button
          style={{ minWidth: "140px" }}
          onClick={handleDownload}
        >
          Download xlsx file
        </Button>
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

