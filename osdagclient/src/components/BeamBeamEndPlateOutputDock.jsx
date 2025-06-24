import React, { useEffect } from "react";
import { useState } from "react";
import { Input, Modal } from "antd";
import Stiffener_BWE from "../assets/BB_Stiffener_BWE.png";
import Stiffener_FP from "../assets/BB_Stiffener_FP.png";
import Stiffener_OWE from "../assets/BB_Stiffener_OWE.png";
import Detailing_BWE from "../assets/Detailing-BWE.png";
import Detailing_FP from "../assets/Detailing-Flush.png";
import Detailing_OWE from "../assets/Detailing-OWE.png";
import GrooveImg from "../assets/BB-BC-single_bevel_groove.png";

const stiffenerImages = {
  "Flushed - Reversible Moment": Stiffener_FP,
  "Extended One Way - Irreversible Moment": Stiffener_OWE,
  "Extended Both Ways - Reversible Moment": Stiffener_BWE,
};

const detailingImages = {
  "Flushed - Reversible Moment": Detailing_FP,
  "Extended One Way - Irreversible Moment": Detailing_OWE,
  "Extended Both Ways - Reversible Moment": Detailing_BWE,
};

const customMapping = {
  "Critical Bolt Design": [
    { key: "Bolt.Diameter", label: "Diameter (mm)" },
    { key: "Bolt.Grade_Provided", label: "Property Class" },
    { key: "Bolt.Force (kN)", label: "Shear Demand (kN)" },
    { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
    { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
    { key: "Bolt.Betalg", label: "β<sub>lg</sub>" },
    { key: "Bolt.Capacity", label: "Bolt Capacity" },
    { key: "Bolt.TensionForce", label: "Tension Due to Moment (kN)" },
    { key: "Bolt.PryingForce", label: "Prying Force (kN)" },
    { key: "Bolt.TensionTotal", label: "Tension Demand (kN)" },
    { key: "Bolt.Tension", label: "Tension Capacity (kN)" },
    { key: "Bolt.IR", label: "Combined Capacity, I.R" },
  ],
  Detailing: [
    { key: "Detailing.No. of Bolts", label: "No. of Bolts" },
    { key: "Detailing.No. of Columns", label: "No. of Columns" },
    { key: "Detailing.No. of Rows", label: "No. of Rows" },
    { key: "Detailing.PitchDistanceOut", label: "Pitch Distance (mm)" },
    { key: "Detailing.GaugeDistanceOut", label: "Gauge Distance (mm)" },
    {
      key: "Detailing.Cross-centre Gauge Distance",
      label: "Cross-centre Gauge (mm)",
    },
    { key: "Detailing.EndDistanceOut", label: "End Distance (mm)" },
    { key: "Detailing.EdgeDistanceOut", label: "Edge Distance (mm)" },
    { key: "DetailingModal", label: "Typical Detailing" },
  ],
  "Stiffener Plate": [
    { key: "DimensionsModal", label: "Details" },
    { key: "SketchModal", label: "Typical Sketch" },
  ],
  "Weld at Web": [
    { key: "Weld.Size", label: "Size (mm)" },
    { key: "Weld.Length", label: "Total Length (mm)" },
    { key: "Weld.Stress", label: "Stress (N/mm)" },
    { key: "Weld.StressCombined", label: "Combined Stress (N/mm2)" },
    { key: "Weld.Strength", label: "Strength (N/mm2)" },
  ],
  "Weld at Flange": [
    { key: "Weld.Type", label: "Type" },
    { key: "SketchFlangeModal", label: "Details" },
  ],
};

const customDetails = {
  DimensionsModal: [
    { key: "Stiffener.Length", label: "Length (mm)" },
    { key: "Stiffener.Width", label: "Width (mm)" },
    { key: "Stiffener.Thickness", label: "Thickness (mm)" },
  ],
};

const customImages = {
  DetailingModal: [],
  SketchModal: [],
};

const grooveImage = {
  SketchFlangeModal: [],
};

const modalButtonNames = {
  DetailingModal: "Details",
  DimensionsModal: "Details",
  SketchModal: "Details",
  SketchFlangeModal: "Details",
};

const BeamBeamEndplateOutputDock = ({ output, selectedOption }) => {
  const [capacityModel, setCapacityModel] = useState(false);
  const [customImagesModel, setCustomImagesModel] = useState(false);
  const [grooveImageModel, setGrooveImageModel] = useState(false);
  const [selectedStiffenerImage, setSelectedStiffenerImage] = useState(
    stiffenerImages[selectedOption]
  );
  const [selectedDetailingImage, setSelectedDetailingImage] = useState(
    detailingImages[selectedOption]
  );

  const [activeDetailSection, setActiveDetailSection] = useState(null);
  const [activeCustomImagesSection, setActiveCustomImagesSection] =
    useState(null);
  const [activeGrooveImageSection, setActiveGrooveImageSection] =
    useState(null);

  const handleDialog = (key) => {
    if (key in customDetails) {
      setActiveDetailSection(key);
      setCapacityModel(true);
    } else if (key in customImages) {
      setActiveCustomImagesSection(key);
      setCustomImagesModel(true);
    } else if (key in grooveImage) {
      setActiveGrooveImageSection(key);
      setGrooveImageModel(true);
    }
  };

  useEffect(() => {
    setSelectedStiffenerImage(stiffenerImages[selectedOption]);
    setSelectedDetailingImage(detailingImages[selectedOption]);
  }, [selectedOption]);

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
                key in customDetails ||
                key in customImages ||
                key in grooveImage;
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
        visible={customImagesModel}
        onCancel={() => {
          setCustomImagesModel(false);
          setActiveCustomImagesSection(null);
        }}
        footer={null}
        width={"40%"}
      >
        {activeCustomImagesSection === "SketchModal" && (
          <>
            <h3>Stiffener Details</h3>
            <div className="spacing-main-body">
              <img src={selectedStiffenerImage} alt="StiffenerImage" />
            </div>
          </>
        )}

        {activeCustomImagesSection === "DetailingModal" && (
          <>
            <h3>Typical Detailing</h3>
            <div className="spacing-main-body">
              <img
                src={selectedDetailingImage}
                height={"500px"}
                alt="DetailingImage"
              />
            </div>
          </>
        )}
      </Modal>

      <Modal
        visible={grooveImageModel}
        onCancel={() => {
          setGrooveImageModel(false);
          setActiveGrooveImageSection(null);
        }}
        footer={null}
        width={"40%"}
      >
        <>
          <h3>Stiffener Details</h3>
          <div className="spacing-main-body">
            <img src={GrooveImg} alt="grooveImage" />
          </div>
        </>
      </Modal>
    </>
  );
};

export default BeamBeamEndplateOutputDock;
