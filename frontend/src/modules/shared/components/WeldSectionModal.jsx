import { Select, Input } from "antd";

const { Option } = Select;

const SIMPLE_CONNECTION_WELD_MODULES = ["Butt Joint Welded", "Lap Joint Welded"];

const WeldSectionModal = ({
  module,
  inputs,
  setInputs,
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
}) => {
  const isSimpleConnection =
    module && SIMPLE_CONNECTION_WELD_MODULES.includes(module);

  const Weld_text = `Shop weld takes a material safety factor of 1.25
Field weld takes a material safety factor of 1.5
(IS 800 - cl. 5. 4. 1 or Table 5)`;

  return (
    <>
      <div className="Connector-col-beam-cont">
        <div>
          <h4>Inputs</h4>
          <div className="sub-container">
            <div className="input-cont">
              <h5>{isSimpleConnection ? "Type" : "Type of Weld Fabrication"}</h5>
              <div>
                <Select
                  disabled={isInputLocked}
                  style={{ width: "132px", height: "25px", fontSize: "12px" }}
                  value={designPrefInputs.weld_fab}
                  onSelect={(value) =>
                    setDesignPrefInputs({ ...designPrefInputs, weld_fab: value })
                  }
                >
                  <Option value="Shop weld">
                    {isSimpleConnection ? "Shop weld" : "Shop Weld"}
                  </Option>
                  <Option value="Field weld">
                    {isSimpleConnection ? "Field weld" : "Field Weld"}
                  </Option>
                </Select>
              </div>
            </div>
            <div className="input-cont">
              <h5>Material Grade Overwrite, Fu (MPa)</h5>
              <div>
                <Input
                  disabled={isInputLocked}
                  type="text"
                  name="source"
                  className="input-design-pref"
                  value={designPrefInputs.weld_material_grade}
                  onChange={(e) =>
                    setDesignPrefInputs({
                      ...designPrefInputs,
                      weld_material_grade: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
        {!isSimpleConnection && (
          <div>
            <div className="sub-container">
              <Input.TextArea
                rows={25}
                cols={150}
                value={Weld_text}
                readOnly
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WeldSectionModal;

