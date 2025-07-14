/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Input, Modal } from "antd";
import spacingIMG from "../assets/spacing_3.png";
import capacityIMG1 from "../assets/L_shear1.png";
import capacityIMG2 from "../assets/L.png";

const customMapping = {
  "Cleat Angle": [
    { key: "Cleat.Angle", label: "Cleat Angle Designation" },
    { key: "Plate.Height", label: "Height (mm)" },
    { key: "Cleat.Shear", label: "Shear Yielding Capacity (kN)" },
    { key: "Cleat.BlockShear", label: "Block Shear Capacity (kN)" },
    { key: "Cleat.MomDemand", label: "Moment Demand (kNm)" },
    { key: "Cleat.MomCapacity", label: "Moment Capacity (kNm)" },
  ],
  Bolt: [
    { key: "Bolt.Diameter", label: "Diameter (mm)" },
    { key: "Bolt.Grade_Provided", label: "Property Class" },
  ],
  "Bolts on Supported Leg": [
    { key: "Bolt.Line", label: "Bolt Columns (nos)" },
    { key: "Bolt.OneLine", label: "Bolt Rows (nos)" },
    { key: "Bolt.Force (kN)", label: "Bolt Force (kN)" },
    { key: "Bolt.Capacity_sptd", label: "Bolt Value (kN)" },
    { key: "CapacityModal_supported", label: "Capacity Details" },
    { key: "SpacingModal", label: "Spacing" },
  ],
  "Bolts on Supporting Leg": [
    { key: "Cleat.Spting_leg.Line", label: "Bolt Columns (nos)" },
    { key: "Cleat.Spting_leg.OneLine", label: "Bolt Rows (nos)" },
    { key: "Cleat.Spting_leg.Force", label: "Bolt Force (kN)" },
    { key: "Bolt.Capacity_spting", label: "Bolt Value (kN)" },
    { key: "CapacityModal_supporting", label: "Capacity Details" },
    { key: "SpacingModal", label: "Spacing" },
  ],
};

const customDetails = {
  Details_Supported: [
    { key: "Bolt.Bearing_supported", label: "Bearing Capacity (kN)" },
    { key: "Bolt.Shear_supported", label: "Shear Capacity (kN)" },
    { key: "Bolt.Betalg_supported", label: "β<sub>lg</sub>" },
    { key: "Bolt.Betalj_supported", label: "β<sub>lj</sub>" },
    { key: "Bolt.Capacity_supported", label: "Bolt Value (kN)" },
    { key: "Bolt.Force (kN)_supported", label: "Bolt Shear Force (kN)" },
  ],

  Details_Supporting: [
    { key: "Bolt.Bearing_supporting", label: "Bearing Capacity (kN)" },
    { key: "Bolt.Shear_supporting", label: "Shear Capacity (kN)" },
    { key: "Bolt.Betalg_supporting", label: "β<sub>lg</sub>" },
    { key: "Bolt.Betalj_supporting", label: "β<sub>lj</sub>" },
    { key: "Bolt.Capacity_supporting", label: "Bolt Value (kN)" },
    { key: "Bolt.Force (kN)_supporting", label: "Bolt Shear Force (kN)" },
  ],
};

const CleatAngleOutputDock = ({ output }) => {
  const [spacingModel, setSpacingModel] = useState(false);
  const [capacityModel, setCapacityModel] = useState(false);
  const [activeDetailSection, setActiveDetailSection] = useState(null);

  const handleDialogSpacing = (value, detailType = null) => {
    if (value === "Spacing") {
      setSpacingModel(true);
    } else if (value === "Capacity") {
      setActiveDetailSection(detailType);
      setCapacityModel(true);
    } else {
      setSpacingModel(false);
      setCapacityModel(false);
      setActiveDetailSection(null);
    }
  };

  return (
    <>
      <p>Output Dock</p>
      <div className="subMainBody scroll-data">
        {Object.entries(customMapping).map(([section, fields]) => (
          <div key={section}>
            <h3>{section}</h3>

            {fields.map(({ key, label }, index) => {
              const entry = output?.[key]; // safe access

              if (
                key === "CapacityModal_supported" ||
                key === "CapacityModal_supporting" ||
                key === "SpacingModal"
              ) {
                return (
                  <div key={index} className="component-grid">
                    <div className="component-grid-align">
                      <h4>{label}</h4>
                      <Input
                        className="btn"
                        type="button"
                        value={label}
                        disabled={!output} // disable button until output is available
                        onClick={() =>
                          handleDialogSpacing(
                            label.includes("Spacing") ? "Spacing" : "Capacity",
                            key.includes("supported")
                              ? "Details_Supported"
                              : "Details_Supporting"
                          )
                        }
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div key={index} className="component-grid">
                  <div className="component-grid-align">
                    <h4>{entry?.label || label}</h4>
                    <Input
                      type="text"
                      value={entry?.val ?? " "}
                      disabled
                      style={{
                        color: "rgb(0 0 0 / 67%)",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Spacing */}
      <Modal
        visible={spacingModel}
        onCancel={() => setSpacingModel(false)}
        footer={null}
        width={"58%"}
      >
        <>
          <p>Spacing Details</p>
          <div>
            <p style={{ padding: "20px" }}>
              Note: Representative image for Spacing Details - 3 x 3 pattern
              considered
            </p>
          </div>
          <div className="spacing-main-body">
            <h3>Spacing Details</h3>
            <div className="spacing-main-two">
              <div className="spacing-left-body">
                {[
                  "Pitch Distance (mm)",
                  "End Distance (mm)",
                  "Gauge Distance 1 (mm)",
                  "Gauge Distance 2 (mm)",
                  "Edge Distance (mm)",
                ].map((label) => (
                  <div key={label} className="spacing-left-body-align">
                    <h4>{label}</h4>
                    <Input
                      type="text"
                      style={{
                        color: "rgb(0 0 0 / 67%)",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                      readOnly={true}
                      value={
                        Object.values(output || {}).find(
                          (entry) => entry.label === label
                        )?.val || "0"
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="spacing-right-body">
                <img src={spacingIMG} alt="SpacingImage" />
              </div>
            </div>
          </div>
        </>
      </Modal>

      <Modal
        visible={capacityModel}
        onCancel={() => setCapacityModel(false)}
        footer={null}
        width={"30%"}
        style={{ height: "50vh" }}
      >
        <h3>Capacity Details</h3>
        <div className="details-main-body">
          <div className="details-main-body-inside">
            {activeDetailSection &&
              customDetails[activeDetailSection]?.map(({ key, label }, idx) => (
                <div  key={idx} className="details-main-body-align">
                  <h4 dangerouslySetInnerHTML={{ __html: label }} />
                  <Input
                    type="text"
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
    </>
  );
};

export default CleatAngleOutputDock;
