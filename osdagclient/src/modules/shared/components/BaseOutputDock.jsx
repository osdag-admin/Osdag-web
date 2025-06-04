import React, { useState } from 'react';
import { Input, Modal } from 'antd';
import spacingIMG from "../../../assets/spacing_3.png";
import Stiffener_BWE from "../../../assets/BB_Stiffener_BWE.png";
import Stiffener_FP from "../../../assets/BB_Stiffener_FP.png";
import Stiffener_OWE from "../../../assets/BB_Stiffener_OWE.png";
import Detailing_BWE from "../../../assets/Detailing-BWE.png";
import Detailing_FP from "../../../assets/Detailing-Flush.png";
import Detailing_OWE from "../../../assets/Detailing-OWE.png";
import GrooveImg from "../../../assets/BB-BC-single_bevel_groove.png";

export const BaseOutputDock = ({ 
  output, 
  outputConfig, 
  title = "Output Dock",
  extraState = {}
}) => {
  // Shared state management
  const [activeModals, setActiveModals] = useState({});
  const [activeSections, setActiveSections] = useState({});

  // Shared modal management
  const openModal = (modalType, sectionKey = null) => {
    setActiveModals(prev => ({ ...prev, [modalType]: true }));
    if (sectionKey) {
      setActiveSections(prev => ({ ...prev, [modalType]: sectionKey }));
    }
  };

  const closeModal = (modalType) => {
    setActiveModals(prev => ({ ...prev, [modalType]: false }));
    setActiveSections(prev => ({ ...prev, [modalType]: null }));
  };

  // Shared dialog handler
  const handleDialog = (key) => {
    const modalConfig = outputConfig.modals[key];
    if (modalConfig) {
      openModal(modalConfig.type, key);
    }
  };

  const getImageForModal = (imageType, selectedOption) => {
    const imageMap = {
      stiffener: {
        "Flushed - Reversible Moment": Stiffener_FP,
        "Extended One Way - Irreversible Moment": Stiffener_OWE,
        "Extended Both Ways - Reversible Moment": Stiffener_BWE,
      },
      detailing: {
        "Flushed - Reversible Moment": Detailing_FP,
        "Extended One Way - Irreversible Moment": Detailing_OWE,
        "Extended Both Ways - Reversible Moment": Detailing_BWE,
      },
      groove: GrooveImg
    };

    if (imageType === 'groove') return GrooveImg;
    return imageMap[imageType]?.[selectedOption] || null;
  };

  // JSX Rendering Functions (moved from config)
  const renderModalContent = (modalType, activeSection, output) => {
    const config = outputConfig.modalTypes[modalType];
    const fieldsData = outputConfig.modalData[modalType]?.[activeSection] || [];

    if (config.layout === "two-column") {
      return (
        <div className="spacing-main-body">
          <div className="spacing-main-two">
            <div className="spacing-left-body">
              {fieldsData.map(({ key, label }, idx) => (
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
            {config.hasImage && (
              <div className="spacing-right-body">
                <img src={spacingIMG} alt="Image" />
              </div>
            )}
          </div>
        </div>
      );
    } else if (config.layout === "image-only") {
      const image = getImageForModal(config.imageType, extraState.selectedOption);
      return (
        <div className="spacing-main-body">
          {image && <img src={image} alt={`${config.imageType} Image`} />}
        </div>
      );
    } else if(config.layout === "single-column") {
      return (
        <div className="details-main-body">
          <div className="details-main-body-inside">
            {fieldsData.map(({ key, label }, idx) => (
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
            ))}
          </div>
        </div>
      );
    }
  };


  // Shared field renderer
  const renderField = (field, index) => {
    const entry = output?.[field.key];
    const isModalTrigger = field.key in outputConfig.modals;

    return (
      <div key={index} className="component-grid">
        <div className="component-grid-align">
          <h4>{field.label}</h4>
          {isModalTrigger ? (
            <Input
              className="btn"
              type="button"
              value={outputConfig.modals[field.key].buttonText || field.label}
              disabled={!output}
              onClick={() => handleDialog(field.key)}
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
  };

  return (
    <>
      <p>{title}</p>
      <div className="subMainBody scroll-data">
        {Object.entries(outputConfig.sections).map(([sectionName, fields]) => (
          <div key={sectionName}>
            <h3>{sectionName}</h3>
            {fields.map((field, index) => renderField(field, index))}
          </div>
        ))}
      </div>

      {/* Dynamic Modal Rendering */}
      {Object.entries(outputConfig.modalTypes).map(([modalType, config]) => (
        <Modal
          key={modalType}
          open={activeModals[modalType]}
          onCancel={() => closeModal(modalType)}
          footer={null}
          width={config.width || "50%"}
          title={config.title}
        >
          {renderModalContent(modalType, activeSections[modalType], output)}
        </Modal>
      ))}
    </>
  );
};
