import React, { useState } from 'react';
import { Input, Modal } from 'antd';
import { getOutputImage } from "../config/outputImageMap";
import { OUTPUT_LAYOUTS } from "./outputDock/OutputModalLayouts";

export const BaseOutputDock = ({
  output,
  outputConfig,
  title = "Output Dock",
  extraState = {},
  handleCreateDesignReport,
  saveOutput,
}) => {
  const normalizedOutput = output && output.data ? output.data : output;

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

  // Read-only value box styled like input (transparent bg, grey border)
  const ValueBox = ({ value }) => (
    <div className="w-[45%]">
      <div
        className="w-full h-9 border border-gray-400 rounded-md px-3 text-sm flex items-center bg-transparent dark:bg-transparent text-gray-800 dark:text-gray-100"
      >
        {value !== undefined && value !== null && value !== '' ? String(value) : ' '}
      </div>
    </div>
  );

  const getImageForModal = (imageType, selectedOption, basePlateState = {}) =>
    getOutputImage(imageType, selectedOption, basePlateState);

  // Helper function to get output value - Works for both module formats
  const getOutputValue = (key, rawOutput) => {
    const out = rawOutput && rawOutput.data ? rawOutput.data : rawOutput;
    if (!out) {
      return " ";
    }

    // Both modules now use flat structure: { "Bolt.Diameter": { label, val } }
    if (out[key]?.val !== undefined) {
      return out[key].val;
    }

    // Try alternative structures
    if (out[key] !== undefined) {
      return out[key];
    }
    return " ";
  };

  // JSX Rendering Functions
  const resolveModalEntry = (modalType, activeSection) => {
    const modalEntries = outputConfig.modalData?.[modalType] || {};
    const entry = modalEntries[activeSection];

    if (!entry) {
      return { fields: [], diagram: null };
    }

    if (Array.isArray(entry)) {
      return { fields: entry, diagram: null };
    }

    return {
      fields: entry.fields || [],
      diagram: entry.diagram || null,
    };
  };

  const getNumeric = (key, rawOutput) => {
    const raw = getOutputValue(key, rawOutput);
    if (raw === undefined || raw === null || raw === " ") {
      return undefined;
    }
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : undefined;
  };

  const resolveDiagramProps = (diagramConfig, rawOutput) => {
    if (!diagramConfig) {
      return null;
    }

    const mapValue = (descriptor) => {
      if (descriptor === undefined || descriptor === null) {
        return undefined;
      }
      if (Array.isArray(descriptor)) {
        return descriptor
          .map((item) => mapValue(item))
          .filter((value) => value !== undefined);
      }

      if (typeof descriptor === "number") {
        return descriptor;
      }

      return getNumeric(descriptor, rawOutput);
    };

    const resolved = Object.entries(diagramConfig.props || {}).reduce(
      (acc, [key, descriptor]) => {
        const value = mapValue(descriptor);
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    if (Object.keys(resolved).length === 0) {
      return null;
    }

    if (diagramConfig.origin) {
      resolved.origin = diagramConfig.origin;
    }

    return resolved;
  };

  const renderModalContent = (modalType, activeSection, output) => {
    const config = outputConfig.modalTypes[modalType];
    const { fields, diagram } = resolveModalEntry(modalType, activeSection);
    const LayoutComponent = OUTPUT_LAYOUTS[config.layout] || OUTPUT_LAYOUTS["single-column"];
    const getImage = (imageType, selectedOption, basePlateState) =>
      getImageForModal(imageType, selectedOption, basePlateState);

    const layoutProps = {
      config,
      fields,
      diagram,
      output,
      getOutputValue,
      resolveDiagramProps,
      ValueBox,
      getImage,
      extraState,
    };

    return <LayoutComponent {...layoutProps} />;
  };

  // Shared field renderer
  const renderField = (field, index) => {
    const isModalTrigger = field.key in outputConfig.modals;
    const fieldValue = getOutputValue(field.key, output);

    return (
      <div key={index} className="flex w-full justify-between items-center mb-3">
        <h4 className="w-[55%] text-sm font-medium text-osdag-text-primary dark:text-white">
          {field.label}
        </h4>
        {isModalTrigger ? (
          <div className="w-[45%]">
            <input
              type="button"
              className="w-full h-9 border border-gray-400 rounded-md px-3 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-500 cursor-pointer text-gray-800 dark:text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              value={outputConfig.modals[field.key].buttonText || field.label}
              disabled={!output}
              onClick={() => handleDialog(field.key)}
            />
          </div>
        ) : (
          <ValueBox value={fieldValue} />
        )}
      </div>
    );
  };
  return (
    <>
      <div className="flex flex-col h-full min-h-0">
        <div className="p-2">
          <p className="p-2 inline-block bg-osdag-green text-white rounded">{title}</p>
        </div>
        <div className="flex-1 overflow-y-auto subMainBody scroll-data min-h-0 pb-20">
          {Object.entries(outputConfig.sections).map(([sectionName, fields]) => (
            <div key={sectionName} className='cards'>
              <h3 className='text-black dark:text-white'>{sectionName}</h3>
              <div className="component-grid">
                {fields.map((field, index) => renderField(field, index))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions - sticky at bottom; scroll area has padding so last content is not hidden */}
        {(handleCreateDesignReport || saveOutput) && (
          <div className="sticky bottom-0 flex-shrink-0 z-10 bg-white dark:bg-osdag-dark-color border-t border-gray-200 dark:border-gray-700 flex items-center w-full gap-x-4 px-5 py-2">
            {handleCreateDesignReport && (
              <button
                onClick={handleCreateDesignReport}
                className="flex flex-1 items-center justify-center gap-x-2 bg-osdag-green text-white text-sm font-semibold px-3 py-2.5 rounded-lg shadow-md duration-200 hover:bg-osdag-dark-green whitespace-nowrap"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#FFFFFF" className="flex-shrink-0">
                  <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm80-80h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm200-190q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z" />
                </svg>
                Generate Report
              </button>
            )}
            {saveOutput && (
              <button
                onClick={saveOutput}
                className="flex flex-1 items-center justify-center gap-x-2 bg-osdag-green text-white text-sm font-semibold px-3 py-2.5 rounded-lg shadow-md duration-200 hover:bg-osdag-dark-green whitespace-nowrap"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#FFFFFF" className="flex-shrink-0">
                  <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                </svg>
                Save Output
              </button>
            )}
          </div>
        )}
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
          className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
        >
          {renderModalContent(modalType, activeSections[modalType], output)}
        </Modal>
      ))}
    </>
  );
};