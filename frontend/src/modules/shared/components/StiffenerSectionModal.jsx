/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select } from "antd";
import CustomMaterialModal from "./CustomMaterialModal";

const { Option } = Select;

const readOnlyFontStyle = {
  color: "rgb(0 0 0 / 67%)",
  fontSize: "12px",
  fontWeight: "600",
};

const StiffenerSectionModal = ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suppressInitialMaterialDispatch]);

  const selectedMaterialGrade = designPrefInputs["Stiffener_Key.Material"] || designPrefInputs.supporting_material || "";
  const selectedMaterialDetails = materials.find((item) => item.Grade === selectedMaterialGrade) || (supporting_material_details && supporting_material_details[0]);

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
                  value={selectedMaterialGrade}
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
                      "Stiffener_Key.Material": material.Grade,
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
                className="input-design-pref"
                value={selectedMaterialDetails ? selectedMaterialDetails.Ultimate_Tensile_Stress : 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Yield Strength, Fy (MPa) (0-20mm)</h5>
              <Input
                type="text"
                className="input-design-pref"
                value={selectedMaterialDetails ? selectedMaterialDetails.Yield_Stress_less_than_20 : 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Yield Strength, Fy (MPa) (20-40mm)</h5>
              <Input
                type="text"
                className="input-design-pref"
                value={selectedMaterialDetails ? selectedMaterialDetails.Yield_Stress_between_20_and_neg40 : 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
            <div className="input-cont">
              <h5>Yield Strength, Fy (MPa) (&gt;40mm)</h5>
              <Input
                type="text"
                className="input-design-pref"
                value={selectedMaterialDetails ? selectedMaterialDetails.Yield_Stress_greater_than_40 : 0}
                disabled
                style={readOnlyFontStyle}
              />
            </div>
          </div>
        </div>
      </div>
      
      <CustomMaterialModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={(newValues) => {
          if (typeof newValues === 'function') {
            setDesignPrefInputs((prev) => {
              const updated = newValues(prev);
              return {
                ...updated,
                "Stiffener_Key.Material": updated.supporting_material,
              };
            });
          } else {
            setDesignPrefInputs({
              ...designPrefInputs,
              ...newValues,
              "Stiffener_Key.Material": newValues.supporting_material,
            });
          }
        }}
        inputValues={designPrefInputs}
        type="supporting"
        materialList={materials}
      />
    </>
  );
};

export default StiffenerSectionModal;