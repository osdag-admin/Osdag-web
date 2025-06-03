import React, { useState } from 'react';
import { Input, Modal } from 'antd';
import spacingIMG from "../../../assets/spacing_3.png";
import capacityIMG1 from "../../../assets/L_shear1.png";
import capacityIMG2 from "../../../assets/L.png";
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
      groove: GrooveImg,
      spacing: spacingIMG,
      capacity1: capacityIMG1,
      capacity2: capacityIMG2
    };

    if (imageType === 'groove' || imageType === 'spacing' || 
        imageType === 'capacity1' || imageType === 'capacity2') {
      return imageMap[imageType];
    }
    return imageMap[imageType]?.[selectedOption] || null;
  };

  // Helper function to get output value - Works for both module formats
  const getOutputValue = (key, output) => {
    if (!output) return " ";
    
    // Both modules now use flat structure: { "Bolt.Diameter": { label, val } }
    if (output[key]?.val !== undefined) {
      return output[key].val;
    }
    
    return " ";
  };

  // JSX Rendering Functions
  const renderModalContent = (modalType, activeSection, output) => {
    const config = outputConfig.modalTypes[modalType];
    const fieldsData = outputConfig.modalData[modalType]?.[activeSection] || [];

    if (config.layout === "two-column") {
      return (
        <div className="spacing-main-body">
          {config.note && (
            <p style={{ padding: "20px" }}>
              Note: {config.note}
            </p>
          )}
          <div className="spacing-main-two">
            <div className="spacing-left-body">
              {fieldsData.map(({ key, label }, idx) => (
                <div key={idx} className="spacing-left-body-align">
                  <h4>{label}</h4>
                  <Input
                    type="text"
                    value={getOutputValue(key, output)}
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
                <img src={getImageForModal('spacing')} alt="Spacing Image" />
              </div>
            )}
          </div>
        </div>
      );
    } else if (config.layout === "capacity-complex") {
      // Complex capacity layout with multiple sections and images
      const groupedFields = fieldsData.reduce((acc, field) => {
        const section = field.section || 'Default';
        if (!acc[section]) acc[section] = [];
        acc[section].push(field);
        return acc;
      }, {});

      return (
        <div className="spacing-main-body">
          {config.note && (
            <p style={{ padding: "20px" }}>
              Note: {config.note}
            </p>
          )}
          <div className="Capacity-main-body">
            {Object.entries(groupedFields).map(([sectionName, sectionFields], sectionIdx) => (
              <div key={sectionIdx}>
                <div className="Capacity-sub-body-title">
                  <h4>{sectionName}</h4>
                </div>
                <div className="Capacity-sub-body">
                  <div className="Capacity-left-body">
                    {sectionFields.map(({ key, label }, idx) => (
                      <div key={idx} className="Capacity-left-body-align">
                        <p>{label}</p>
                        <Input
                          type="text"
                          value={getOutputValue(key, output)}
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
                  {sectionIdx < 2 && ( // Show images for first two sections
                    <div className="Capacity-right-body">
                      <img 
                        src={getImageForModal(sectionIdx === 0 ? 'capacity1' : 'capacity2')} 
                        alt={`Capacity Image ${sectionIdx + 1}`} 
                      />
                      <h5>Block Shear Pattern</h5>
                    </div>
                  )}
                </div>
                {sectionIdx < Object.entries(groupedFields).length - 1 && <hr />}
              </div>
            ))}
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
                  value={getOutputValue(key, output)}
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
    const isModalTrigger = field.key in outputConfig.modals;
    const fieldValue = getOutputValue(field.key, output);

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
              value={fieldValue}
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
