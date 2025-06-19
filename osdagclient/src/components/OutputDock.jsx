/* eslint-disable no-unused-vars */
import React from "react";
import { useState } from "react";
import { Input, Modal } from "antd";
import spacingIMG from "../assets/spacing_3.png";
import capacityIMG1 from "../assets/L_shear1.png";
import capacityIMG2 from "../assets/L.png";

const customMapping = {
  "Bolt": [
    { key: "Bolt.Diameter", label: "Diameter (mm)" },
    { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
    { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
    { key: "Bolt.Capacity", label: "Capacity (kN)" },
    { key: "Bolt.Force (kN)", label: "Bolt Force (kN)" },
    { key: "Bolt.Line", label: "Bolt Columns (nos)" },
    { key: "Bolt.OneLine", label: "Bolt Rows (nos)" },
    { key: "SpacingModal", label: "Spacing" },
  ],
  "Plate": [
    { key: "Plate.Thickness", label: "Thickness (mm)" },
    { key: "Plate.Height", label: "Height (mm)" },
    { key: "Plate.Length", label: "Length (mm)" },
    { key: "PlateCapacityModal", label: "Capacity" },
  ],
  "Section Details": [
    { key: "SectionCapacityModal", label: "Capacity" },
  ],
  "Weld": [
    { key: "Weld.Size", label: "Size (mm)" },
    { key: "Weld.Strength", label: "Strength (N/mm2)" },
    { key: "Weld.Stress", label: "Stress (N/mm)" },
  ],
};

const customSpacing = {
  SpacingModal: [
    {
      key: "Bolt.Pitch",
      label: "Pitch Distance (mm)",
    },
    {
      key: "Bolt.EndDist",
      label: "End Distance (mm)",
    },
    {
      key: "Bolt.Gauge",
      label: "Gauge Distance (mm)",
    },
    {
      key: "Bolt.EdgeDist",
      label: "Edge Distance (mm)",
    },
  ],
};

const customCapacity = {
  PlateCapacityModal: [
    {
      key: "Plate.Shear",
      label: "Shear Yielding Capacity (kN)",
    },
    {
      key: "Plate.Rupture",
      label: "Rupture Capacity (kN)",
    },
    {
      key: "Plate.BlockShear",
      label: "Block Shear Capacity (kN)",
    },
    {
      key: "Plate.TensionYield",
      label: "Tension Yielding Capacity (kN)",
    },
    {
      key: "Plate.TensionRupture",
      label: "Tension Rupture Capacity (kN)",
    },
    {
      key: "Plate.BlockShearAxial",
      label: "Axial Block Shear Capacity (kN)",
    },
    {
      key: "Plate.MomDemand",
      label: "Moment Demand (kNm)",
    },
    {
      key: "Plate.MomCapacity",
      label: "Moment Capacity (kNm)",
    },
  ],
  SectionCapacityModal: [
    {
      key: "Member.shear_yielding",
      label: "Shear Yielding Capacity (kN)",
    },
    {
      key: "Member.shear_rupture",
      label: "Rupture Capacity (kN)",
    },
    {
      key: "Member.shear_blockshear",
      label: "Block Shear Capacity (kN)",
    },
    {
      key: "Member.tension_yielding",
      label: "Tension Yielding Capacity (kN)",
    },
    {
      key: "Member.tension_rupture",
      label: "Tension Rupture Capacity (kN)",
    },
    {
      key: "Member.tension_blockshear",
      label: "Axial Block Shear Capacity (kN)",
    },
    {
      key: "Plate.MomDemand",
      label: "Moment Demand (kNm)",
    },
    {
      key: "Section.MomCapacity",
      label: "Moment Capacity (kNm)",
    },
  ],
};

const modalButtonNames = {
  SpacingModal: "Spacing",
  PlateCapacityModal: "Capacity",
  SectionCapacityModal: "Capacity",
};

const OutputDock = ({ output }) => {
  const [spacingModel, setSpacingModel] = useState(false);
  const [customCapacityModel, setCustomCapacityModel] = useState(false);

  const [activeSpacingSection, setActiveSpacingSection] = useState(null);
  const [activeCustomCapacitySection, setActiveCustomCapacitySection] = useState(null);

  const handleDialog = (key) => {
    if (key in customSpacing) {
      setActiveSpacingSection(key);
      setSpacingModel(true);
    } else if (key in customCapacity) {
      setActiveCustomCapacitySection(key);
      setCustomCapacityModel(true);
    }
  };

  // Helper function to get image for capacity sections
  const getCapacityImage = (startIndex, endIndex) => {
    if (startIndex >= 0 && endIndex <= 2) {
      return { img: capacityIMG1, title: "Block Shear Pattern" };
    } else if (startIndex >= 3 && endIndex <= 5) {
      return { img: capacityIMG2, title: "Block Shear Pattern" };
    }
    return null;
  };

  // Helper function to render capacity section with image
  const renderCapacitySection = (fields, startIndex, endIndex, sectionTitle) => {
    const sectionFields = fields.slice(startIndex, endIndex + 1);
    const imageData = getCapacityImage(startIndex, endIndex);
    
    return (
      <div key={`section-${startIndex}`}>
        {sectionTitle && (
          <div className="Capacity-sub-body-title">
            <h4>{sectionTitle}</h4>
          </div>
        )}
        <div className="spacing-main-body">
          <div className="spacing-main-two">
            <div className="spacing-left-body">
              {sectionFields.map(({ key, label }, idx) => (
                <div key={idx} className="spacing-left-body-align">
                  <h4>{label}</h4>
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
            {imageData && (
              <div className="spacing-right-body">
                <img src={imageData.img} alt="CapacityImage" />
                <h5>{imageData.title}</h5>
              </div>
            )}
            {!imageData && endIndex >= 6 && (
              <div className="spacing-right-body">
                {/* Empty space for last section without image */}
              </div>
            )}
          </div>
        </div>
        {endIndex < 5 && <hr />}
      </div>
    );
  };

  return (
    <>
      <p>Output Dock</p>
      <div className="subMainBody scroll-data">
        {Object.entries(customMapping).map(([section, fields]) => (
          <div key={section}>
            <h3>{section}</h3>
            {fields.map(({ key, label }, index) => {
              const entry = output?.[key];
              const isModalTrigger =
                key in customSpacing || key in customCapacity;

              return (
                <div key={index} className="component-grid">
                  <div className="component-grid-align">
                    <h4>{label}</h4>
                    {isModalTrigger ? (
                      <Input
                        className="btn"
                        type="button"
                        value={modalButtonNames[key] || label}
                        disabled={!output}
                        onClick={() => handleDialog(key)}
                      />
                    ) : (
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Spacing Modal */}
      <Modal
        visible={spacingModel}
        onCancel={() => {
          setSpacingModel(false);
          setActiveSpacingSection(null);
        }}
        footer={null}
        width={"68%"}
      >
        <h3>Spacing Details</h3>
        <p style={{ padding: "20px" }}>
          Note: Representative image for Spacing Details - 3 x 3 pattern considered
        </p>
        <div className="spacing-main-body">
          <div className="spacing-main-two">
            <div className="spacing-left-body">
              {customSpacing?.[activeSpacingSection]?.map(
                ({ key, label }, idx) => (
                  <div key={idx} className="spacing-left-body-align">
                    <h4>{label}</h4>
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
                )
              )}
            </div>
            <div className="spacing-right-body">
              <img src={spacingIMG} alt="SpacingImage" />
            </div>
          </div>
        </div>
      </Modal>

      {/* Custom Capacity Modal */}
      <Modal
        visible={customCapacityModel}
        onCancel={() => {
          setCustomCapacityModel(false);
          setActiveCustomCapacitySection(null);
        }}
        footer={null}
        width={"68%"}
        style={{ height: "70vh" }}
      >
        <h3>Capacity Details</h3>
        <p style={{ padding: "20px" }}>
          Note: Representative image for Failure Pattern (Half Plate) - 2 x 3 Bolt pattern considered
        </p>
        <div className="Capacity-main-body">
          {customCapacity?.[activeCustomCapacitySection] && (
            <>
              {/* First section: Shear in Plate (indices 0-2) */}
              {renderCapacitySection(
                customCapacity[activeCustomCapacitySection],
                0,
                2,
                "Failure Pattern due Shear in Plate"
              )}
              
              {/* Second section: Tension in Plate (indices 3-5) */}
              {renderCapacitySection(
                customCapacity[activeCustomCapacitySection],
                3,
                5,
                "Failure due Tension in Plate"
              )}
              
              {/* Third section: Moment (indices 6-7) */}
              {customCapacity[activeCustomCapacitySection].length > 6 &&
                renderCapacitySection(
                  customCapacity[activeCustomCapacitySection],
                  6,
                  7,
                  "Moment Analysis"
                )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default OutputDock;