/* eslint-disable react/prop-types */
import { useContext, useEffect, useState, useMemo } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select } from "antd";
import CustomMaterialModal from "./CustomMaterialModal";

const { Option } = Select;

const readOnlyFontStyle = {
  color: "rgb(0 0 0 / 67%)",
  fontSize: "12px",
  fontWeight: "600",
};

const ConnectorSectionModal = ({
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
  materialList: materialsFromParent,
  suppressInitialMaterialDispatch = false,
}) => {
  const { conn_material_details, manageDesignPreferences } =
    useContext(ModuleContext);
  const materials = useMemo(() => materialsFromParent ?? [], [materialsFromParent]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (suppressInitialMaterialDispatch) return;
    const material = materials.filter(
      (value) => value.Grade === designPrefInputs.connector_material
    );
    if (material[0]) {
      manageDesignPreferences("material_update", {
        materialType: "connector",
        materialData: material[0],
      });
    }
  }, [suppressInitialMaterialDispatch, designPrefInputs.connector_material, materials, manageDesignPreferences]);

  const handleMaterialChange = (value) => {
    if (value === -1) {
      setShowModal(true);
      return;
    }
    const material = materials.find((item) => item.Grade === value);
    if (!material) return;
    setDesignPrefInputs({
      ...designPrefInputs,
      connector_material: material.Grade,
    });

    manageDesignPreferences("material_update", {
      materialType: "connector",
      materialData: material,
    });
  };

  return (
    <div className="Connector-col-beam-cont">
      {/* Left Section */}
      <div className="col-left">
        <div className="sub-container">
          <h4>Inputs</h4>
          <div className="input-cont">
            <h5>Material *</h5>
            <div>
              <Select
                disabled={isInputLocked}
                style={{ width: "134px", height: "25px", fontSize: "12px" }}
                // value={designPrefInputs.connector_material}
                value={designPrefInputs.connector_material || ""}
                onSelect={(value) => {
                  handleMaterialChange(value);
                }}
              >
                {materials.map((item, index) => {
                  return (
                    <Option key={`connectorSection-${item.id??index}`} value={item.Grade}>
                      {item.Grade}
                    </Option>
                  );
                })}
              </Select>
            </div>
          </div>
          <div className="input-cont">
            <h5>Ultimate Strength, Fu (Mpa)</h5>
            <Input
              type="text"
              name="ultimate-strength"
              className="input-design-pref"
              value={
                conn_material_details[0]
                  ? conn_material_details[0].Ultimate_Tensile_Stress
                  : 0
              }
              style={readOnlyFontStyle}
            />
          </div>
          <div className="input-cont">
            <h5>Yield  Strength, Fy (Mpa) (0-20mm)</h5>
            <Input
              type="text"
              name="yield-strength"
              className="input-design-pref"
              value={
                conn_material_details[0]
                  ? conn_material_details[0].Yield_Stress_less_than_20
                  : 0
              }
              style={readOnlyFontStyle}
            />
          </div>
          <div className="input-cont">
            <h5>Yield  Strength, Fy (Mpa) (20-40mm)</h5>
            <Input
              type="text"
              name="modulus-elasticity"
              className="input-design-pref"
              value={
                conn_material_details[0]
                  ? conn_material_details[0].Yield_Stress_between_20_and_neg40
                  : 0
              }
              style={readOnlyFontStyle}
            />
          </div>
          <div className="input-cont">
            <h5>{`Yield  Strength, Fy (Mpa) (>40mm)`}</h5>
            <Input
              type="text"
              name="modulus-rigidity"
              className="input-design-pref"
              value={
                conn_material_details[0]
                  ? conn_material_details[0].Yield_Stress_greater_than_40
                  : 0
              }
              style={readOnlyFontStyle}
            />
          </div>
        </div>
      </div>
      <CustomMaterialModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={setDesignPrefInputs}
        inputValues={designPrefInputs}
        type="connector"
        materialList={materials}
      />
    </div>
  );
};

export default ConnectorSectionModal;

