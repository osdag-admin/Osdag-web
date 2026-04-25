import { useContext, useEffect, useState } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select } from "antd";
import CustomSectionModal from "./CustomSectionModal";

const { Option } = Select;

const readOnlyFontStyle = {
  color: "rgb(0 0 0 / 67%)",
  fontSize: "12px",
  fontWeight: "600",
};

const OptimizationSectionModal = ({
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
  materialList: materialsFromParent,
  suppressInitialMaterialDispatch = false,
}) => {
  const { conn_material_details, manageDesignPreferences } =
    useContext(ModuleContext);
  const materials = materialsFromParent ?? [];
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
  }, [suppressInitialMaterialDispatch]);

  const handleMaterialChange = (value) => {
    if (value === -1) {
      setShowModal(true);
      return;
    }
    const material = materials.find((item) => item.Grade === value);
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
            <h5>Effective Area Parameter</h5>
            <div>
              <Select
                disabled={isInputLocked}
                style={{ width: "134px", height: "25px", fontSize: "12px" }}
                value={designPrefInputs.connector_material}
                onSelect={(value) => {
                  handleMaterialChange(value);
                }}
              >
                {materials.map((item, index) => {
                  return (
                    <Option key={item.id ?? index} value={item.Grade}>
                      {item.Grade}
                    </Option>
                  );
                })}
              </Select>
            </div>
          </div>
          <div className="input-cont">
            <h5>Semi-compact sections</h5>
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
            <h5>Loading Condition</h5>
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
            <h5>Effective Length Parameter</h5>
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
            <h5>Bearing Length (mm)</h5>
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

      <div>
        <h4>Description</h4>

        <div className="description-container">
            <p>
            <b>The Allowable Utilization Ratio (UR)</b> is the maximum allowable value
            of the demand to capacity ratio for performing the design. The default
            value of this ratio is set at 1.0. The UR can be re-defined for any
            particular design session with a maximum allowable value of 1.0 and a
            minimum of 0.1.
            </p>

            <p>
            <b>The Effective Area Parameter</b> is the parameter used to define the
            reduction in the area of the section due to connection detailing and other
            such requirements. The default value of this parameter is set at 1.0,
            which means that the effective area is 100% of the gross area for Plastic,
            Compact and Semi-compact sections. For Slender sections, the initial area
            will be computed based on the recommendations in Fig.2B of The National
            Building Code (2016). The value of the parameter should be defined in
            terms of the effective area to be considered for design simulation after
            deducting the area lost. The maximum value of the parameter is 1.0
            (effective area is 100% of the gross area) with a minimum value of 0.1.
            </p>

            <p>
            <b>The Effective Length</b> is the parameter to Overwrite the Length
            multiplier. The default value of this ratio is set at NA. The value can be
            re-defined for any particular design session with a minimum of 0.1. If
            invalid value given then it is set to NA or 1.0.
            </p>

            <p>
            For simply supported beams of overall depth D and span length L, the
            effective length LLT is given by below Table
            </p>

            <div className="table-container">
            <table className="desc-table">
            <thead>
                <tr>
                    <th colSpan="5">Effective Length for Simply Supported Beams</th>
                </tr>
            <tr>
                <th rowSpan="3">Sl No.</th>
                <th colSpan="2">Conditions of Restraint Supports</th>
                <th colSpan="2">Loading Condition</th>
            </tr>

            <tr>
                <th rowSpan="2">Torsional Restraint</th>
                <th rowSpan="2">Warping Restraint</th>
                <th>Normal</th>
                <th>Destabilizing</th>
            </tr>
            </thead>

            <tbody>
            <tr>
                <td>(i)</td>
                <td>Fully restrained</td>
                <td>Both flanges fully restrained</td>
                <td>0.7 L</td>
                <td>0.85 L</td>
            </tr>

            <tr>
                <td>(ii)</td>
                <td>Fully restrained</td>
                <td>Compression flange fully restrained</td>
                <td>0.75 L</td>
                <td>0.9 L</td>
            </tr>

            <tr>
                <td>(iii)</td>
                <td>Fully restrained</td>
                <td>Both flanges fully restrained</td>
                <td>0.8 L</td>
                <td>0.95 L</td>
            </tr>

            <tr>
                <td>(iv)</td>
                <td>Fully restrained</td>
                <td>Both flanges fully restrained</td>
                <td>0.85 L</td>
                <td>1.0 L</td>
            </tr>

            <tr>
                <td>(v)</td>
                <td>Fully restrained</td>
                <td>Warping not restrained in both flanges</td>
                <td>1.0 L</td>
                <td>1.2 L</td>
            </tr>

            <tr>
                <td>(vi)</td>
                <td>
                Partially restrained by bottom flange support connection
                </td>
                <td>Warping not restrained in both flanges</td>
                <td>1.0 + 2 D</td>
                <td>1.2 L + 2 D</td>
            </tr>

            <tr>
                <td>(vii)</td>
                <td>
                Partially restrained by bottom flange bearing support
                </td>
                <td>Warping not restrained in both flanges</td>
                <td>1.2 L + 2 D</td>
                <td>1.4 L + 2 D</td>
            </tr>
            </tbody>
        </table>
            </div>

            <p>
            <b>The Bearing Length Parameter</b> is the length of Bearing stiffener
            provided for webs. The default value of this parameter is set at NA. If
            invalid value given then it is set to NA.
            </p>
        </div>
    </div>

      <CustomSectionModal
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

export default OptimizationSectionModal;

