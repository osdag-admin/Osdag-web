import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Html, PerspectiveCamera } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { Input, Modal } from "antd";

import { useEngineeringModule } from "../hooks/useEngineeringModule";
import { InputSection } from "../components/InputSection";
import { CustomizationModal } from "../components/CustomizationModal";
import { DesignReportModal } from "../components/DesignReportModal"; 
import useViewCamera from "./btobViewCamera";
import Model from "./btobRender";
import Logs from "../../../components/Logs";
import MomentDropdownMenu from "../../../components/MomentDropDownMenu";
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

    // Actions
    updateModalState,
    updateSelectionState,
    updateSelectedItems,
    toggleAllSelected,
    handleSubmit,
    handleReset,
    handleCreateDesignReport,
    handleOkDesignReport,
    handleCancelDesignReport,
  } = useEngineeringModule(moduleConfig);

  const { position: cameraPos, fov } = useViewCamera(
    moduleConfig.cameraKey,
    selectedView
  );
  const options = ["Model", "Beam", "Connector"];

  const contextData = {
    beamList,
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
          <MomentDropdownMenu
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
          />
        ))}

        {displaySaveInputPopup && (
          <span id="save-input-style" style={{ marginTop: "18px" }}>
            <strong>Saved input file as "{saveInputFileName}"</strong>
          </span>
        )}

        <div className="element">
          <div className="home-btn" onClick={() => navigate("/home")}>
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
                  className={`option-box ${
                    selectedView === option ? "selected" : ""
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
          <OutputDockComponent
            output={output}
            extraState={extraState}
          />
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

      {/* Designreport separate modal */}
      <DesignReportModal
        isOpen={createDesignReportBool}
        onCancel={handleCancelDesignReport}
        onOk={handleOkDesignReport}
        designReportInputs={designReportInputs}
        setDesignReportInputs={setDesignReportInputs}
        output={output}
      />

      {/* Modals */}
      {moduleConfig.modalConfig.map((modal) => (
        <CustomizationModal
          key={modal.key}
          isOpen={modalStates[modal.key]}
          onClose={() => updateModalState(modal.key, false)}
          title="Customized"
          dataSource={contextData[modal.dataSource] || []}
          selectedItems={selectedItems[modal.inputKey]}
          onTransferChange={(nextTargetKeys) =>
            updateSelectedItems(modal.inputKey, nextTargetKeys)
          }
        />
      ))}

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
    </div>
  );
};
