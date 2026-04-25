import React, { useContext, useState, useEffect } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select, Button } from "antd";
import CustomSectionModal from "./CustomSectionModal";
import Slope_Beam from "../../../assets/Slope_Beam.png";

const { Option } = Select;

const readOnlyFontStyle = {
  color: "rgb(0 0 0 / 67%)",
  fontSize: "12px",
  fontWeight: "600",
};

const StiffenerSectionModal = ({
  supportingSectionData,
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
  materialList: materialsFromParent,
  suppressInitialMaterialDispatch = false,
}) => {
  const {
    manageDesignPreferences,
    supporting_material_details,
  } = useContext(ModuleContext);
  const materials = materialsFromParent ?? [];
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
        <h4>Inputs</h4>
          <div className="sub-container">
            <div className="input-cont">
              <h5>Material</h5>
              <div>
                <Select
                  disabled={isInputLocked}
                  style={{ width: "132px", height: "25px", fontSize: "12px" }}
                  value={designPrefInputs.supporting_material}
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
              <h5>Yield Strength, Fy (MPa) (0-20mm)</h5>
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
              <h5>Yield Strength, Fy (MPa) (0-40mm)</h5>
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
              <h5>Yield Strength, Fy (MPa) (&gt;40mm)</h5>
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
            
          </div>

        </div>
              </div>
      
      <CustomSectionModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={setDesignPrefInputs}
        inputValues={designPrefInputs}
        type="supporting"
        materialList={materials}
      />

      
    </>
  );
};

export default StiffenerSectionModal;