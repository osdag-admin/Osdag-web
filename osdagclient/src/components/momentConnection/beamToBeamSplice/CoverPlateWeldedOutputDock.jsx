import React, { useState } from "react";
import { Input, Modal } from "antd";

// Add import for block shear image
import blockShearImg from "../../../../../ResourceFiles/images/Beam-webblockaxial.svg";

const modalData = {
  "Member Capacity": [
    { key: "Section.MomCapacity", label: "Moment Capacity Member (kNm)" },
    { key: "Section.ShearCapacity", label: "Shear Capacity Member (kN)" },
    { key: "Section.AxialCapacity", label: "Axial Capacity Member (kN)" },
  ],
  "Web Capacity": [
    { key: "section.Tension_capacity_web", label: "Web Tension Capacity (kN)" },
    { key: "Web_plate.capacity", label: "Web Plate Tension Capacity (kN)" },
    { key: "web_plate.shear_capacity_web_plate", label: "Web Plate Shear Capacity (kN)" },
  ],
  "Block Shear Pattern": [
    { key: "Weld.Lw", label: "Lw (mm)" },
    { key: "Weld.Hw", label: "Hw (mm)" },
  ],
  "Flange Capacity": [
    { key: "Section.flange_capacity", label: "Flange Tension Capacity (kN)" },
    { key: "flange_plate.tension_capacity_flange_plate", label: "Flange Plate Tension Capacity (kN)" },
  ],
  "Flange Plate Weld": [
    { key: "Flange_Weld.Size", label: "Flange Weld Size (mm)" },
    { key: "Flange_Weld.Strength", label: "Flange Weld Strength (N/mm)" },
    { key: "bolt.long_joint", label: "Strength Red.Factor" },
    { key: "Weld.Strength_red", label: "Red.Strength (N/mm)" },
    { key: "Flange_Weld.Stress", label: "Flange Weld Stress (N/mm)" },
  ],
  "Web Plate Weld": [
    { key: "Web_Weld.Size", label: "Web Weld Size (mm)" },
    { key: "Web_Weld.Strength", label: "Web Weld Strength (N/mm)" },
    { key: "Web_Weld.Stress", label: "Web Weld Stress (N/mm)" },
  ]
};

const CoverPlateWeldedOutputDock = ({ output }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [blockShearModal, setBlockShearModal] = useState(false);

  const showModal = (key) => {
    if (key === "Block Shear Pattern") {
      setBlockShearModal(true);
    } else {
      setActiveModal(key);
    }
  };
  
  const closeModal = () => {
    setActiveModal(null);
    setBlockShearModal(false);
  };

  return (
    <>
      <p>Output Dock</p>
      <div className="subMainBody scroll-data">
        {/* Member Capacity Section */}
        <div>
          <h3>Member Capacity</h3>
          <div className="component-grid">
            <div className="component-grid-align">
              <h4>Member Capacity</h4>
              <Input
                className="btn"
                type="button"
                value="Member Capacity"
                disabled={!output}
                onClick={() => showModal("Member Capacity")}
              />
            </div>
          </div>
        </div>

        {/* Web Splice Plate Section */}
        <div>
          <h3>Web Splice Plate</h3>
          <div className="component-grid">
            <div className="component-grid-align">
              <h4>Height (mm)</h4>
              <Input
                value={output?.["Web_Plate.Height (mm)"]?.val ?? " "}
                disabled
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              />
            </div>
            <div className="component-grid-align">
              <h4>Width (mm)</h4>
              <Input
                value={output?.["Web_Plate.Width"]?.val ?? " "}
                disabled
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              />
            </div>
            <div className="component-grid-align">
              <h4>Thickness (mm)</h4>
              <Input
                value={output?.["Connector.Web_Plate.Thickness_List"]?.val ?? " "}
                disabled
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              />
            </div>
            <div className="component-grid-align">
              <h4>Web Capacity</h4>
              <Input
                className="btn"
                type="button"
                value="Web Capacity"
                disabled={!output}
                onClick={() => showModal("Web Capacity")}
              />
            </div>
            <div className="component-grid-align">
              <h4>Block Shear Pattern</h4>
              <Input
                className="btn"
                type="button"
                value="Block Shear Pattern"
                disabled={!output}
                onClick={() => showModal("Block Shear Pattern")}
              />
            </div>
            <div className="component-grid-align">
              <h4>Web Plate Weld</h4>
              <Input
                className="btn"
                type="button"
                value="Web Plate Weld"
                disabled={!output}
                onClick={() => showModal("Web Plate Weld")}
              />
            </div>
          </div>
        </div>

        {/* Flange Splice Plate Section */}
        <div>
          <h3>Flange Splice Plate Outer Plate</h3>
          <div className="component-grid">
            <div className="component-grid-align">
              <h4>Width (mm)</h4>
              <Input
                value={output?.["Flange_Plate.Width (mm)"]?.val ?? " "}
                disabled
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              />
            </div>
            <div className="component-grid-align">
              <h4>Length (mm)</h4>
              <Input
                value={output?.["flange_plate.Length"]?.val ?? " "}
                disabled
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              />
            </div>
            <div className="component-grid-align">
              <h4>Thickness (mm)</h4>
              <Input
                value={output?.["Connector.Flange_Plate.Thickness_list"]?.val ?? " "}
                disabled
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              />
            </div>
            <div className="component-grid-align">
              <h4>Flange Capacity</h4>
              <Input
                className="btn"
                type="button"
                value="Flange Capacity"
                disabled={!output}
                onClick={() => showModal("Flange Capacity")}
              />
            </div>
            <div className="component-grid-align">
              <h4>Flange Plate Weld</h4>
              <Input
                className="btn"
                type="button"
                value="Flange Plate Weld"
                disabled={!output}
                onClick={() => showModal("Flange Plate Weld")}
              />
            </div>
          </div>
        </div>

        {/* Modals */}
        {Object.entries(modalData).map(([title, fields]) => (
          <Modal
            key={title}
            visible={activeModal === title}
            title={title}
            onCancel={closeModal}
            footer={null}
            width={500}
          >
            <div className="details-main-body">
              <div className="details-main-body-inside">
                {fields.map(({ key, label }) => (
                  <div key={key} className="details-main-body-align">
                    <h4>{label}</h4>
                    <Input
                      value={output?.[key]?.val ?? " "}
                      disabled
                      style={{
                        color: "rgb(0 0 0 / 67%)",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        ))}

        {/* Add Block Shear Pattern Modal */}
        <Modal
          visible={blockShearModal}
          onCancel={closeModal}
          footer={null}
          width={"68%"}
          title="Block Shear Pattern"
        >
          <p>Note: Representative image for Failure Pattern (Half Plate)</p>
          <div className="spacing-main-body">
            <div className="spacing-main-two">
              <div className="spacing-left-body" style={{ flex: "0 0 200px" }}>
                <div className="spacing-left-body-align">
                  <h4>Lw (mm)</h4>
                  <Input
                    value={output?.["Weld.Lw"]?.val ?? " "}
                    disabled
                    style={{
                      color: "rgb(0 0 0 / 67%)",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  />
                </div>
                <div className="spacing-left-body-align">
                  <h4>Hw (mm)</h4>
                  <Input
                    value={output?.["Weld.Hw"]?.val ?? " "}
                    disabled
                    style={{
                      color: "rgb(0 0 0 / 67%)",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  />
                </div>
              </div>
              <div className="spacing-right-body" style={{ flex: 1 }}>
                <img src={blockShearImg} alt="Block Shear Pattern" style={{ width: '100%', maxWidth: '500px' }} />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default CoverPlateWeldedOutputDock;
