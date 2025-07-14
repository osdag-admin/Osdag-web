import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Html, PerspectiveCamera } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { Input, Modal, Button } from "antd";

import { useEngineeringModule } from "../hooks/useEngineeringModule";
import { InputSection } from "../components/InputSection";
import { CustomizationModal } from "../components/CustomizationModal";
import { DesignReportModal } from "../components/DesignReportModal";
import useViewCamera from "./btobViewCamera";
import Model from "./btobRender";
import Logs from "../../../components/Logs";
import UnifiedDropdownMenu from "../utils/UnifiedDropdownMenu";
import ScreenshotCapture from "../../../components/ScreenShotCapture";
import DesignPrefSections from "../../../components/DesignPrefSections";
import { MODULE_KEY_FIN_PLATE, MODULE_DISPLAY_FIN_PLATE } from '../../../constants/DesignKeys';

export const EngineeringModule = ({
  moduleConfig,
  OutputDockComponent,
  menuItems,
  title,
}) => {
  const navigate = useNavigate();
  const cameraRef = useRef();

  const {
    // Context data
    beamList,
    columnList,
    connectivityList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    angleList,
    channelList,
    sectionProfileList,
    topAngleList,
    cadModelPaths,

    // State
    inputs,
    setInputs,
    output,
    logs,
    loading,
    renderBoolean,
    modelKey,
    modalStates,
    selectionStates,
    allSelected,
    selectedItems,
    saveOutput,
    createDesignReportBool,
    setCreateDesignReportBool,
    designReportInputs,
    setDesignReportInputs,
    designPrefModalStatus,
    setDesignPrefModalStatus,
    confirmationModal,
    setConfirmationModal,
    displaySaveInputPopup,
    saveInputFileName,
    selectedView,
    setSelectedView,
    screenshotTrigger,
    setScreenshotTrigger,
    extraState,
    setExtraState,

    // Project management states
    currentProjectId,
    projectNameLoading,

    // Navigation and Reset states
    showResetConfirmation,
    setShowResetConfirmation,
    confirmationType,
    setConfirmationType,
    isLoadingModalVisible,
    setIsLoadingModalVisible,
    loadingStage,
    setLoadingStage,

    // Actions
    updateModalState,
    updateSelectionState,
    updateSelectedItems,
    toggleAllSelected,
    handleSubmit,
    handleReset,
    handleHomeClick,
    performReset,
    handleCreateDesignReport,
    handleOkDesignReport,
    handleCancelDesignReport,
  } = useEngineeringModule(moduleConfig);

  // Get the backend parameter name (different from display name for some cases)
  const getBackendViewName = (displayOption) => {
    // Map UI display names to backend parameter names  
    const backendMapping = {
      "CoverPlate": "Connector", // UI shows "CoverPlate" but backend expects "Connector"
    };
    return backendMapping[displayOption] || displayOption;
  };
  // Get connectivity for modules that support it (FinPlate, etc.)
  const getConnectivity = () => {
    if (moduleConfig.cameraKey === MODULE_KEY_FIN_PLATE) {
      return extraState?.selectedOption || inputs?.connectivity;
    }
    return null;
  };

  const { position: cameraPos, fov } = useViewCamera(
    moduleConfig.cameraKey,
    getBackendViewName(selectedView),
    getConnectivity()
  );

  // Get view options from module configuration
  const getViewOptions = () => {
    // Use cadOptions from module config if available, otherwise fallback to default
    if (moduleConfig.cadOptions && Array.isArray(moduleConfig.cadOptions)) {
      return moduleConfig.cadOptions;
    }

    // Fallback based on module type for backward compatibility
    switch (moduleConfig.cameraKey) {
      case MODULE_KEY_FIN_PLATE:
        return ["Model", "Beam", "Column", "Plate"];
      case "TensionMember":
        return ["Model", "Member", "Plate", "Endplate"];
      case "BeamToColumnEndPlate":
        return ["Model", "Beam", "Column", "EndPlate"];
      case "BeamBeamEndPlate":
        return ["Model", "Beam", "EndPlate"];
      case "CoverPlateBolted":
        return ["Model", "Beam", "Plate"];
      case "CoverPlateWelded":
        return ["Model", "Beam", "CoverPlate"];
      case "CleatAngle":
        return ["Model", "Beam", "Column", "CleatAngle"];
      case "SeatedAngle":
        return ["Model", "Beam", "Column", "SeatedAngle"];
      case "FlexuralMember":
        return ["Model", "Beam"];
      default:
        return ["Model", "Beam", "Connector"];
    }
  };

  const viewOptions = getViewOptions();

  // Get the display name for view options (for better UI labels)
  const getViewDisplayName = (option) => {
    const displayNames = {
      "Model": "Model",
      "Beam": "Beam",
      "Column": "Column",
      "Connector": "Connector",
      "CoverPlate": "Cover Plate",
      "Member": "Member",
      "Plate": "Plate",
      "Endplate": "End Plate",
      "EndPlate": "End Plate",
      "CleatAngle": "Cleat Angle",
      "SeatedAngle": "Seated Angle"
    };
    return displayNames[option] || option;
  };



  // Initialize selectedView to first option if not set
  React.useEffect(() => {
    if (!selectedView && viewOptions.length > 0) {
      setSelectedView(viewOptions[0]);
    }
  }, [selectedView, viewOptions, setSelectedView]);

  const contextData = {
    beamList,
    columnList,
    connectivityList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    angleList,
    channelList,
    sectionProfileList,
    topAngleList,
  };

  const triggerScreenshotCapture = () => {
    setScreenshotTrigger(true);
  };

  return (
    <div className="module_base">
      {/* Navigation */}
      <div className="module_nav">
        {menuItems.map((item, index) => (
          <UnifiedDropdownMenu
            key={index}
            label={item.label}
            dropdown={item.dropdown}
            setDesignPrefModalStatus={setDesignPrefModalStatus}
            inputs={inputs}
            setInputs={setInputs}
            allSelected={allSelected}
            logs={logs}
            setCreateDesignReportBool={setCreateDesignReportBool}
            triggerScreenshotCapture={triggerScreenshotCapture}
            selectedOption={extraState.selectedOption}
            setSelectedOption={(value) =>
              setExtraState({ ...extraState, selectedOption: value })
            }
          />
        ))}

        {displaySaveInputPopup && (
          <span id="save-input-style" style={{ marginTop: "18px" }}>
            <strong>Saved input file as "{saveInputFileName}"</strong>
          </span>
        )}

        <div className="element">
          <div className="home-btn" onClick={handleHomeClick}>
            Home
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="superMainBody">
        {/* Left - Input Dock */}
        <div className="InputDock">
          <p>Input Dock</p>
          <div className="subMainBody scroll-data">
            {moduleConfig.inputSections.map((section, index) => (
              <InputSection
                key={index}
                section={section}
                inputs={inputs}
                setInputs={setInputs}
                selectionStates={selectionStates}
                updateSelectionState={updateSelectionState}
                updateModalState={updateModalState}
                toggleAllSelected={toggleAllSelected}
                contextData={contextData}
                extraState={extraState}
                setExtraState={setExtraState}
              />
            ))}
          </div>

          <div className="inputdock-btn">
            <Input type="button" value="Reset" onClick={handleReset} />
            <Input type="button" value="Design" onClick={handleSubmit} />
          </div>
        </div>

        {/* Middle - 3D Model */}
        <div className="superMainBody_mid">
          {/* Dynamic View Options */}
          <div className="options-container">
            {viewOptions.map((option) => (
              <div
                key={option}
                className="option-wrapper"
                onClick={() => setSelectedView(option)}
                title={`View ${getViewDisplayName(option)}`}
              >
                <div
                  className={`option-box ${selectedView === option ? "selected" : ""
                    }`}
                ></div>
                <span className="option-label">{getViewDisplayName(option)}</span>
              </div>
            ))}
          </div>

          {/* 3D Model Canvas */}
          {loading ? (
            <div className="modelLoading">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading Model...</p>
                <span className="loading-subtext">
                  {loadingStage || "Preparing 3D visualization..."}
                </span>
              </div>
            </div>
          ) : renderBoolean ? (
            <div className="cadModel">
              <Canvas
                gl={{ antialias: true, preserveDrawingBuffer: true }}
                onCreated={({ gl }) => {
                  gl.setClearColor("#ADD8E6");
                }}
              >
                <PerspectiveCamera
                  ref={cameraRef}
                  makeDefault
                  position={cameraPos}
                  fov={fov}
                  near={0.1}
                  far={1000}
                />
                <Suspense
                  fallback={
                    <Html>
                      <div className="model-loading-fallback">
                        <div className="spinner"></div>
                        <p>Loading 3D Model...</p>
                      </div>
                    </Html>
                  }
                >
                  <Model
                    modelPaths={cadModelPaths}
                    selectedView={getBackendViewName(selectedView)}
                    key={modelKey}
                  />
                  <ScreenshotCapture
                    screenshotTrigger={screenshotTrigger}
                    setScreenshotTrigger={setScreenshotTrigger}
                    selectedView={getBackendViewName(selectedView)}
                  />
                </Suspense>
              </Canvas>
            </div>
          ) : (
            <div className="modelback">
              <div className="no-model-message">
                <div className="no-model-icon">📐</div>
                <h3>No Model Generated</h3>
                <p>Click "Design" to generate and view the 3D model</p>
                <div className="model-info">
                  <small>
                    Available views: {viewOptions.map(getViewDisplayName).join(", ")}
                  </small>
                </div>
              </div>
            </div>
          )}

          <Logs logs={logs} />
        </div>

        {/* Right - Output Dock */}
        <div className="superMain_right">
          <OutputDockComponent output={output} extraState={extraState} />
          <div className="outputdock-btn">
            <Input
              type="button"
              value="Create Design Report"
              onClick={handleCreateDesignReport}
              disabled={!output || Object.keys(output).length === 0}
            />
            <Input
              type="button"
              value="Save Output"
              onClick={saveOutput}
              disabled={!output || Object.keys(output).length === 0}
            />
          </div>
        </div>
      </div>

      {/* Design Report Modal */}
      <DesignReportModal
        isOpen={createDesignReportBool}
        onCancel={handleCancelDesignReport}
        onOk={handleOkDesignReport}
        designReportInputs={designReportInputs}
        setDesignReportInputs={setDesignReportInputs}
        output={output}
      />

      {/* Customization Modals */}
      {moduleConfig.modalConfig.map((modal) => {
        // Handle dynamic data sources
        let dataSource = [];
        
        if (modal.dataSource) {
          // Static data source from contextData
          dataSource = contextData[modal.dataSource] || [];
        } else {
          // Dynamic data source - find the field with getDynamicDataSource
          const dynamicField = moduleConfig.inputSections
            .flatMap(section => section.fields)
            .find(field => field.modalKey === modal.key && field.getDynamicDataSource);
          
          if (dynamicField && dynamicField.getDynamicDataSource) {
            dataSource = dynamicField.getDynamicDataSource(inputs, contextData) || [];
          }
        }

        return (
          <CustomizationModal
            key={modal.key}
            isOpen={modalStates[modal.key]}
            onClose={() => updateModalState(modal.key, false)}
            title="Customized"
            dataSource={dataSource}
            selectedItems={selectedItems[modal.inputKey]}
            onTransferChange={(nextTargetKeys) =>
              updateSelectedItems(modal.inputKey, nextTargetKeys)
            }
          />
        );
      })}

      {/* Design Preferences Modal */}
      {designPrefModalStatus && (
        <Modal
          open={designPrefModalStatus}
          onCancel={() => setConfirmationModal(true)}
          footer={null}
          minWidth={1200}
          width={1400}
          maxHeight={1200}
          maskClosable={false}
        >
          <DesignPrefSections
            module={moduleConfig.sessionName}
            inputs={inputs}
            setInputs={setInputs}
            setDesignPrefModalStatus={setDesignPrefModalStatus}
            confirmationModal={confirmationModal}
            setConfirmationModal={setConfirmationModal}
          />
        </Modal>
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        open={showResetConfirmation}
        title={
          <span>
            {confirmationType === "reset"
              ? "Confirm Reset"
              : "Unsaved Progress"}
          </span>
        }
        onCancel={() => {
          setShowResetConfirmation(false);
          setConfirmationType("reset");
        }}
        footer={[
          <Button key="cancel" onClick={() => setShowResetConfirmation(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            style={{ background: "rgb(135, 91, 91)", color: "white" }}
            onClick={performReset}
          >
            {confirmationType === "reset"
              ? "Yes, Reset Everything"
              : "Yes, Leave Page"}
          </Button>,
        ]}
        width={500}
      >
        <div>
          <p>
            {confirmationType === "reset"
              ? "Are you sure you want to reset all inputs and clear the current design?"
              : "You have unsaved design progress. Are you sure you want to leave?"}
          </p>
          <br />
          <p>
            <strong>This will lose all your current work.</strong>
          </p>
        </div>
      </Modal>

      {/* Loading Modal */}
      <Modal
        open={isLoadingModalVisible}
        footer={null}
        closable={false}
        maskClosable={false}
        centered
        width={400}
        className="loading-modal"
        styles={{
          body: {
            textAlign: "center",
            padding: "40px 20px",
          },
        }}
      >
        <div className="loading-content">
          <div
            style={{
              fontSize: "18px",
              marginBottom: "20px",
              fontWeight: "bold",
            }}
          >
            Processing Design
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div
              className="spinner"
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            ></div>
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>
            {loadingStage || "Please wait while we generate your results..."}
          </div>
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#999" }}>
            This may take a few moments
          </div>
        </div>
      </Modal>

      {/* Enhanced CSS for better UI */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .options-container {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 8px;
          margin-bottom: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .option-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .option-wrapper:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .option-box {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #ccc;
          transition: all 0.2s ease;
        }

        .option-box.selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
        }

        .option-label {
          font-size: 13px;
          font-weight: 500;
          color: #333;
          user-select: none;
        }

        .option-wrapper:hover .option-label {
          color: #667eea;
        }

        .modelLoading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 400px;
          background: linear-gradient(135deg, #f6f9fc 0%, #e9ecef 100%);
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }

        .loading-container {
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        .loading-subtext {
          color: #6c757d;
          font-size: 12px;
          display: block;
          margin-top: 5px;
        }

        .modelback {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 400px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }

        .no-model-message {
          text-align: center;
          color: #6c757d;
        }

        .no-model-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .no-model-message h3 {
          margin: 0 0 8px 0;
          color: #495057;
        }

        .no-model-message p {
          margin: 0 0 16px 0;
          font-size: 14px;
        }

        .model-info {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 4px;
          display: inline-block;
        }

        .model-loading-fallback {
          text-align: center;
          color: white;
        }

        .model-loading-fallback .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        .cadModel {
          height: 400px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .outputdock-btn input[type="button"]:disabled,
        .inputdock-btn input[type="button"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default EngineeringModule;
