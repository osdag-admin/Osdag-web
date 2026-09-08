/* eslint-disable react/prop-types */
import { Select } from "antd";

const { Option } = Select;

const SIMPLE_CONNECTION_MODULES = [
  "Butt Joint Bolted",
  "Butt Joint Welded",
  "Lap Joint Bolted",
  "Lap Joint Welded",
];

const DesignSectionModal = ({
  module,
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
}) => {
  const isSimpleConnection =
    module && SIMPLE_CONNECTION_MODULES.includes(module);

  return (
    <>
      <div className="Connector-col-beam-cont">
        <div>
          <h4>Inputs</h4>
          <div className="sub-container">
            {!isSimpleConnection && (
              <div className="input-cont">
                <h5>Design Method</h5>
                <div>
                  <Select
                    disabled={isInputLocked}
                    style={{ width: "132px", height: "25px", fontSize: "12px" }}
                    value={designPrefInputs.design_method}
                    onSelect={(value) =>
                      setDesignPrefInputs({
                        ...designPrefInputs,
                        design_method: value,
                      })
                    }
                  >
                    <Option value="Limited State Design">
                      Limited State Design
                    </Option>
                    <Option
                      value="Limited State (capacity based) Design"
                      disabled
                    >
                      Limited State (capacity based) Design
                    </Option>
                    <Option value="Working Stressed Design" disabled>
                      Working Stressed Design
                    </Option>
                  </Select>
                </div>
              </div>
            )}
            {/* <div className="input-cont">
              <h5>Design For</h5>
              <div>
                <Select
                  disabled={isInputLocked}
                  style={{ width: "200px", height: "25px", fontSize: "12px" }}
                  value={designPrefInputs.design_for}
                  onSelect={(value) =>
                    setDesignPrefInputs({
                      ...designPrefInputs,
                      design_for: value,
                    })
                  }
                >
                  <Option value="Tension">Tension</Option>
                  <Option value="Compression">Compression</Option>
                </Select>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default DesignSectionModal;

