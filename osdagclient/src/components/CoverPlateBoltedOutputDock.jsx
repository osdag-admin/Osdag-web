import React from "react";
import { useState } from "react";
import { Input, Modal } from "antd";
import spacingIMG from "../assets/spacing_3.png";
import Lshear from "../assets/L_Shear.png";
import Ushear from "../assets/U.png";
import Ushear1 from "../assets/path14979-8.jpg";

const customMapping = {
  "Member Capacity": [{ key: "MemberCapacityModal", label: "Member Capacity" }],
  Bolt: [
    { key: "Bolt.Diameter", label: "Diameter (mm)" },
    { key: "Bolt.Grade_Provided", label: "Property Class" },
  ],
  "Bolt Capacities": [
    { key: "BoltFlangeCapacityModal", label: "Flange Bolt Capacity" },
    { key: "BoltWebCapacityModal", label: "Web Bolt Capacity" },
  ],
  "Web Splice Plate": [
    { key: "Web_Plate.Height (mm)", label: "Height (mm)" },
    { key: "Web_Plate.Width", label: "Width (mm)" },
    { key: "Web_Plate.Thickness", label: "Thickness (mm)*" },
    { key: "WebSpacingDetailsModal", label: "Spacing (mm)" },
    { key: "WebCapacityModal", label: "Capacity" },
  ],
  "Flange Splice Plate Outer Plate": [
    { key: "Flange_Plate.Width (mm)", label: "Width (mm)" },
    { key: "flange_plate.Length", label: "Length (mm)" },
    { key: "Connector.Flange_Plate.Thickness_list", label: "Thickness (mm)" },
    { key: "FlangeSpacingDetailsModal", label: "Spacing (mm)" },
    { key: "FlangeCapacityModal", label: "Capacity" },
  ],
  "Inner Plate": [
    { key: "Flange_Plate.InnerWidth", label: "Width (mm)" },
    { key: "flange_plate.InnerLength", label: "Length (mm)" },
    { key: "flange_plate.innerthickness_provided", label: "Thickness (mm)" },
  ],
};

const customSpacing = {
  WebSpacingDetailsModal: [
    {
      key: "Web_plate.pitch_provided_web_spacing",
      label: "Pitch Distance (mm)",
    },
    {
      key: "Web_plate.end_dist_provided _web_spacing",
      label: "End Distance (mm)",
    },
    {
      key: "Web_plate.gauge_provided _web_spacing",
      label: "Gauge Distance (mm)",
    },
    {
      key: "Web_plate.edge_dist_provided_web_spacing",
      label: "Edge Distance (mm)",
    },
  ],
  FlangeSpacingDetailsModal: [
    {
      key: "Flange_plate.pitch_provided_flange_spacing",
      label: "Pitch Distance (mm)",
    },
    {
      key: "Flange_plate.end_dist_provided _flange_spacing",
      label: "End Distance",
    },
    {
      key: "Flange_plate.gauge_provided _flange_spacing",
      label: "Gauge Distance (mm)",
    },
    {
      key: "Flange_plate.edge_dist_provided_flange_spacing",
      label: "Edge Distance (mm)",
    },
  ],
};

const customCapacity = {
  WebCapacityModal: [
    {
      key: "section.Tension_capacity_web_web_capacity",
      label: "Web Tension Capacity (kN)",
    },
    {
      key: "Web_plate.capacity_web_capacity",
      label: "Web Plate Tension Capacity (kN)",
    },
    {
      key: "web_plate.shear_capacity_web_plate_web_capacity",
      label: "Web Plate Shear Capacity (kN)",
    },
    {
      key: "Web_Plate.MomDemand_web_capacity",
      label: "Web Moment Demand (kNm)",
    },
  ],
  FlangeCapacityModal: [
    {
      key: "Section.flange_capacity_flange_capacity",
      label: "Flange Tension Capacity (kN)",
    },
    {
      key: "flange_plate.tension_capacity_flange_plate_flange_capacity",
      label: "Flange Plate Tension Capacity (kN)",
    },
  ],
};

const customDetails = {
  MemberCapacityModal: [
    { key: "Section.AxialCapacity", label: "Axial Capacity Member (kN)" },
    { key: "Section.MomCapacity", label: "Moment Capacity Member (kNm)" },
    { key: "Section.ShearCapacity", label: "Shear Capacity Member (kN)" },
  ],
  BoltFlangeCapacityModal: [
    {
      key: "Flange_plate.Bolt_Line_flange_bolt_capacity",
      label: "Bolt Lines ",
    },
    {
      key: "Flange_plate.Bolt_OneLine_flange_bolt_capacity",
      label: "Bolts in One Line ",
    },
    {
      key: "Flange_plate.Bolt_required_flange_bolt_capacity",
      label: "Bolts Required",
    },
    { key: "Bolt.Shear_flange_bolt_capacity", label: "Shear Capacity (kN)" },
    {
      key: "Bolt.Bearing_flange_bolt_capacity",
      label: "Bearing Capacity (kN)",
    },
    {
      key: "flange_bolt.large_grip_flange_bolt_capacity",
      label: "Large Grip Red.Factor",
    },
    {
      key: "flange_plate.red,factor_flange_bolt_capacity",
      label: "Long Joint Red.Factor",
    },
    { key: "Bolt.Capacity_flange_bolt_capacity", label: "Capacity (kN)" },
    { key: "Bolt.Force (kN)_flange_bolt_capacity", label: "Bolt Force (kN)" },
  ],
  BoltWebCapacityModal: [
    { key: "Web_plate.Bolt_Line_web_bolt_capacity", label: "Bolt Lines " },
    {
      key: "Web_plate.Bolt_OneLine_web_bolt_capacity",
      label: "Bolts in One Line ",
    },
    {
      key: "Web_plate.Bolt_required_web_bolt_capacity",
      label: "Bolts Required",
    },
    { key: "Bolt.Shear_web_bolt_capacity", label: "Shear Capacity (kN)" },
    { key: "Bolt.Bearing_web_bolt_capacity", label: "Bearing Capacity (kN)" },
    { key: "web_plate.red,factor_web_bolt_capacity", label: "Red. Factor" },
    { key: "Bolt.Capacity_web_bolt_capacity", label: "Capacity (kN)" },
    { key: "Bolt.Force (kN)_web_bolt_capacity", label: "Bolt Force (kN)" },
  ],
};

const modalButtonNames = {
  WebSpacingDetailsModal: "Web Spacing",
  FlangeSpacingDetailsModal: "Flange Spacing",
  WebCapacityModal: "Web Capacity",
  FlangeCapacityModal: "Flange Capacity",
  BoltWebCapacityModal: "Web Bolt Capacity",
  BoltFlangeCapacityModal: "Flange Bolt Capacity",
  MemberCapacityModal: "Member Capacity",
};

const CoverPlateBoltedOutputDock = ({ output }) => {
  const [capacityModel, setCapacityModel] = useState(false);
  const [spacingModel, setSpacingModel] = useState(false);
  const [customCapacityModel, setCustomCapacityModel] = useState(false);

  const [activeDetailSection, setActiveDetailSection] = useState(null);
  const [activeSpacingSection, setActiveSpacingSection] = useState(null);
  const [activeCustomCapacitySection, setActiveCustomCapacitySection] =
    useState(null);

  const handleDialog = (key) => {
    if (key in customSpacing) {
      setActiveSpacingSection(key);
      setSpacingModel(true);
    } else if (key in customDetails) {
      setActiveDetailSection(key);
      setCapacityModel(true);
    } else if (key in customCapacity) {
      setActiveCustomCapacitySection(key);
      setCustomCapacityModel(true);
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
              const entry = output?.[key];
              const isModalTrigger =
                key in customSpacing ||
                key in customDetails ||
                key in customCapacity;

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

      {/* Capacity Modal */}
      <Modal
        visible={capacityModel}
        onCancel={() => {
          setCapacityModel(false);
          setActiveDetailSection(null);
        }}
        footer={null}
        width={"35%"}
        style={{ height: "20vh" }}
      >
        <h3>Capacity Details</h3>
        <div className="details-main-body">
          <div className="details-main-body-inside">
            {customDetails?.[activeDetailSection]?.map(
              ({ key, label }, idx) => (
                <div key={idx} className="details-main-body-align">
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
              )
            )}
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
      >
        <h3>Plate Capacity Details</h3>
        <div className="spacing-main-body">
          <div className="spacing-main-two">
            <div className="spacing-left-body">
              {customCapacity?.[activeCustomCapacitySection]?.map(
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
              <img src={spacingIMG} alt="CapacityImage" />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CoverPlateBoltedOutputDock;
