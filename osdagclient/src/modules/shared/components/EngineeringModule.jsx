import React, { useRef, useEffect } from "react";
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

   // Get connectivity for FinPlate module
  const getConnectivity = () => {
    if (moduleConfig.cameraKey === "FinPlate") {
      return extraState?.selectedOption || inputs?.connectivity;
    }
    return null;
  };

  const { position: cameraPos, fov } = useViewCamera(
    moduleConfig.cameraKey,
    selectedView,
    getConnectivity()
  );



// Determine view options based on module sessionName or cameraKey
  const getViewOptions = () => {
    if (moduleConfig.sessionName === "Beam-to-Column End Plate Connection") {
      return ["Model", "Beam", "Column", "Connector"];
    }
    if (moduleConfig.cameraKey === "FinPlate") {
      return ["Model", "Beam", "Column", "Plate"];
    } else if (moduleConfig.cameraKey === "TensionMember") {
      return ["Model", "Member", "Plate", "Endplate"];
    }
    return ["Model", "Beam", "Connector"];
  };

  const options = getViewOptions();


  const contextData = {
    beamList,
    columnList,
    connectivityList,
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
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
          <div className="options-container">
            {options.map((option) => (
              <div
                key={option}
                className="option-wrapper"
                onClick={() => setSelectedView(option)}
              >
                <div
                  className={`option-box ${selectedView === option ? "selected" : ""
                    }`}
                ></div>
                <span className="option-label">{option}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="modelLoading">
              <p>Loading Model...</p>
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
                      <p>Loading 3D Model...</p>
                    </Html>
                  }
                >
                  <Model
                    modelPaths={cadModelPaths}
                    selectedView={selectedView}
                    key={modelKey}
                  />
                  <ScreenshotCapture
                    screenshotTrigger={screenshotTrigger}
                    setScreenshotTrigger={setScreenshotTrigger}
                    selectedView={selectedView}
                  />
                </Suspense>
              </Canvas>
            </div>
          ) : (
            <div className="modelback"></div>
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
            />
            <Input type="button" value="Save Output" onClick={saveOutput} />
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
        // Handle dynamic data source for tension member
        let dataSource = contextData[modal.dataSource] || [];
        
        // Check if this is section designation modal and get dynamic data
        const sectionField = moduleConfig.inputSections
          .flatMap(section => section.fields)
          .find(field => field.modalKey === modal.key);
          
        if (sectionField && sectionField.getDynamicDataSource) {
          dataSource = sectionField.getDynamicDataSource(inputs, contextData);
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
o
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

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
