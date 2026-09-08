import { Modal, Button, Radio } from "antd";
import { DesignReportModal } from "./DesignReportModal";
import { CustomizationModal } from "./CustomizationModal";
import DesignPrefSections from "./DesignPrefSections";
import { DesignStatusModal } from "./DesignStatusModal";
import HelpLinkModal from "./help/HelpLinkModal";
import AboutOsdagModal from "./help/AboutOsdagModal";
import { ASK_QUESTION_LINK } from "./help/helpContent";
import { DESIGN_STATUS } from "../hooks/useDesignSubmission";
import { isGuestUser } from "../../../utils/auth";
import { useEngineeringContext } from "../context/EngineeringContext";

export const EngineeringModals = () => {
  const {
    form,
    moduleData,
    uiContext,
    designStatus,
    actions,
    isMobile,
    showAskQuestionModal,
    setShowAskQuestionModal,
    showAboutOsdagModal,
    setShowAboutOsdagModal,
    showSave3dTypeModal,
    setShowSave3dTypeModal,
    selectedSave3dType,
    setSelectedSave3dType,
    handleNavbarMenuClick,
    isInputLocked,
    performResetEnhanced,
    selectedSection,
    setSelectedSection,
    moduleConfig,
    setDocks,
    projectCreationModal,
  } = useEngineeringContext();

  const {
    inputs,
    setInputs,
    allSelected,
    designPrefOverrides,
    setDesignPrefOverrides,
    extraState,
    selectedItems,
    modalDynamicSrc,
    updateSelectedItems,
  } = form;

  const {
    materialList,
    boltDiameterList,
    thicknessList,
    propertyClassList,
    angleList,
    contextData,
  } = moduleData;

  const {
    modalStates,
    updateModalState,
    designPrefModalStatus,
    setDesignPrefModalStatus,
    confirmationModal,
    setConfirmationModal,
    showResetConfirmation,
    setShowResetConfirmation,
    confirmationType,
    setConfirmationType,
    createDesignReportBool,
    handleCancelDesignReport,
    designReportInputs,
    setDesignReportInputs,
  } = uiContext;

  const {
    output,
    logs,
    status,
    setStatus,
  } = designStatus;

  const { refetchModuleOptions } = actions;

  return (
    <>
      <DesignReportModal
        isOpen={createDesignReportBool}
        onCancel={handleCancelDesignReport}
        onOk={undefined}
        designReportInputs={designReportInputs}
        setDesignReportInputs={setDesignReportInputs}
        output={output}
        moduleId={moduleConfig?.designType}
        inputValues={inputs}
        logs={logs}
        moduleConfig={moduleConfig}
        boltDiameterList={boltDiameterList}
        propertyClassList={propertyClassList}
        thicknessList={thicknessList}
        angleList={angleList}
        allSelected={allSelected}
        extraState={extraState}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        lists={contextData}
      />

      {moduleConfig.modalConfig.map((modal) => (
        <CustomizationModal
          key={modal.key}
          isOpen={modalStates[modal.key]}
          onClose={() => updateModalState(modal.key, false)}
          title="Customized"
          dataSource={contextData[modal.dataSource] || (modalDynamicSrc[modal.inputKey] || [])}
          selectedItems={selectedItems[modal.inputKey]}
          onTransferChange={(nextTargetKeys) =>
            updateSelectedItems(modal.inputKey, nextTargetKeys)
          }
        />
      ))}

      {designPrefModalStatus && (
        <Modal
          title="Additional Inputs"
          open={designPrefModalStatus}
          onCancel={() => {
            if (isInputLocked) {
              setDesignPrefModalStatus(false);
            } else {
              setConfirmationModal(true);
            }
          }}
          footer={null}
          minWidth={isMobile ? undefined : 1200}
          width={isMobile ? '100%' : 1400}
          maxHeight={isMobile ? '100%' : 1200}
          maskClosable={false}
          className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
        >
          <DesignPrefSections
            module={moduleConfig.sessionName}
            inputs={inputs}
            setInputs={setInputs}
            setDesignPrefModalStatus={setDesignPrefModalStatus}
            designPrefOverrides={designPrefOverrides}
            setDesignPrefOverrides={setDesignPrefOverrides}
            confirmationModal={confirmationModal}
            setConfirmationModal={setConfirmationModal}
            isInputLocked={isInputLocked}
            moduleMaterialList={materialList}
            isGuest={isGuestUser()}
            onRefetchModuleOptions={refetchModuleOptions}
          />
        </Modal>
      )}

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
            onClick={performResetEnhanced}
          >
            {confirmationType === "reset"
              ? "Yes, Reset Everything"
              : "Yes, Leave Page"}
          </Button>,
        ]}
        width={isMobile ? '90%' : 500}
        className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
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

      <DesignStatusModal
        status={status}
        isMobile={isMobile}
        onRetry={() => {
          setStatus({ step: DESIGN_STATUS.IDLE, message: '', error: null });
        }}
        onClose={() => {
          if (status.step === DESIGN_STATUS.ERROR) {
            setStatus({ step: DESIGN_STATUS.IDLE, message: '', error: null });
            setDocks({ logs: true });
          }
        }}
      />

      <HelpLinkModal
        open={showAskQuestionModal}
        onClose={() => setShowAskQuestionModal(false)}
        title="Ask us a question"
        helperText="Please visit:"
        link={ASK_QUESTION_LINK}
      />

      <AboutOsdagModal
        open={showAboutOsdagModal}
        onClose={() => setShowAboutOsdagModal(false)}
      />

      <Modal
        open={showSave3dTypeModal}
        title="Save 3D Model"
        onCancel={() => setShowSave3dTypeModal(false)}
        onOk={async () => {
          await handleNavbarMenuClick(selectedSave3dType);
          setShowSave3dTypeModal(false);
        }}
        okText="Export"
        cancelText="Cancel"
        width={isMobile ? "90%" : 520}
        className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
      >
        <div className="space-y-3">
          <p className="text-sm">Choose CAD file type to export:</p>
          <Radio.Group
            value={selectedSave3dType}
            onChange={(event) => setSelectedSave3dType(event.target.value)}
            className="flex flex-col gap-2"
          >
            <Radio value="Export BREP">BREP</Radio>
            <Radio value="Export STL">STL</Radio>
            <Radio value="Export STEP">STEP</Radio>
            <Radio value="Export IGS">IGS</Radio>
            <Radio value="Export IFC">IFC</Radio>
          </Radio.Group>
        </div>
      </Modal>

      {projectCreationModal}
    </>
  );
};
