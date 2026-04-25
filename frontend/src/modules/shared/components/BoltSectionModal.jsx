import { Select, Input } from "antd";

const { Option } = Select;

const BOLT_SLIP_FACTOR_OPTIONS = [
  "0.2",
  "0.5",
  "0.1",
  "0.25",
  "0.3",
  "0.33",
  "0.48",
  "0.52",
  "0.55",
];

// const PLATED_CONNECTION_BOLT_MODULES = ["Butt Joint Bolted", "Lap Joint Bolted"];

const BoltSectionModal = ({
  module,
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
}) => {
  // const isPlatedConnection =
  //   module && PLATED_CONNECTION_BOLT_MODULES.includes(module);

  const Bolt_discription = `
IS 800 Table 20 Typical Average Values for Coefficient of Friction (µf)

Treatment of Surfaces     µ_f
i) Surfaces not treated   0.2
ii) Surfaces blasted with short or grit with any loose rust removed, no pitting   0.5
iii) Surfaces blasted with short or grit and hot-dip galvanized   0.1
iv) Surfaces blasted with short or grit and spray - metallized with zinc (thickness 50-70 µm)     0.25
v) Surfaces blasted with short or grit and painted with ethylzinc silicate coat (thickness 30-60 µm)   0.3
vi) Sand blasted surface, after light rusting     0.52
vii) Surfaces blasted with shot or grit and painted with ethylzinc silicate coat (thickness 60-80 µm)     0.3
viii) Surfaces blasted with shot or grit and painted with alcalizinc silicate coat (thickness 60-80 µm)   0.3
ix) Surfaces blasted with shot or grit and spray metallized with aluminium (thickness >50 µm)     0.5
x) Clean mill scale   0.33
xi) Sand blasted surface      0.48
xii) Red lead painted surface     0.1
`;

  return (
    <>
      <div className="Connector-col-beam-cont">
        {/* Left Section */}
        <div className="connector-left">
          <h4>Inputs</h4>
          <div className="sub-container">
              <div className="input-cont">
                <h5>Type *</h5>
                <div>
                  <Select
                    disabled={isInputLocked}
                    style={{ width: "132px", height: "25px", fontSize: "12px" }}
                    value={designPrefInputs.bolt_tension_type}
                    onSelect={(value) =>
                      setDesignPrefInputs({
                        ...designPrefInputs,
                        bolt_tension_type: value,
                      })
                    }
                  >
                    <Option value="Pre-tensioned">Pre-tensioned</Option>
                    <Option value="Non Pre-tensioned">Non Pre-tensioned</Option>
                  </Select>
                </div>
              </div>
              <div className="input-cont">
                <h5>Hole Type</h5>
                <div>
                  <Select
                    disabled={isInputLocked}
                    style={{ width: "132px", height: "25px", fontSize: "12px" }}
                    value={designPrefInputs.bolt_hole_type}
                    onSelect={(value) =>
                      setDesignPrefInputs({
                        ...designPrefInputs,
                        bolt_hole_type: value,
                      })
                    }
                  >
                    <Option value="Standard">Standard</Option>
                    <Option value="Over-Sized">Over-Sized</Option>
                  </Select>
                </div>
              </div>
              <div className="input-cont">
                <h5>
                  Slip Factor, (µ
                  <span style={{ verticalAlign: "sub", fontSize: "smaller" }}>
                    f
                  </span>
                  )
                </h5>
                <Select
                  disabled={isInputLocked}
                  style={{ width: "132px", height: "25px", fontSize: "12px" }}
                  value={designPrefInputs.bolt_slip_factor}
                  onSelect={(value) =>
                    setDesignPrefInputs({
                      ...designPrefInputs,
                      bolt_slip_factor: value,
                    })
                  }
                >
                  {BOLT_SLIP_FACTOR_OPTIONS.map((v) => (
                    <Option key={v} value={v}>
                      {v}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
          {/* Right Section */}
          {/* {!isPlatedConnection && ( */}
            <div className="connector-right">
              <h4>Description</h4>

              <div className="sub-container">
                <Input.TextArea
                  rows={18}
                  value={Bolt_discription}
                  readOnly
                />
              </div>
            </div>
          {/* )} */}
        </div>
        
      {/* Bottom Note */}
      <div className="connector-note">
         
            NOTE: If slip is permitted under the design load, design the bolt
            as a bearing bolt select corresponding bolt grade.
          
        </div>
    </>
  );
};

export default BoltSectionModal;

