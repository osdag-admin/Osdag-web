import React, { useState, useContext } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import ColumnSectionModal from "./ColumnSectionModal";
import BeamSectionModal from "./BeamSectionModal";
import ConnectorSectionModal from "./ConnectorSectionModal";
import CleatAngleSectionModal from "./CleatAngleSectionModal";
import SeatedAngleSectionModal from "./SeatedAngleSectionModal";
import AngleSectionModal from "./AngleSectionModal";
import BoltSectionModal from "./BoltSectionModal";
import BasePlateSectionModal from "./BasePlateSectionModal";
import StiffenerSectionModal from "./StiffenerSectionModal";
import AnchorBoltSectionModal from "./AnchorBoltSectionModal";
import WeldSectionModal from "./WeldSectionModal";
import DetailingSectionModal from "./DetailingSectionModal";
import OptimizationSectionModal from "./OptimizationSectionModal";
import DesignSectionModal from "./DesignSectionModal";
import { Button, Modal } from "antd";
import { getDesignPrefConfig, getDesignPrefTabs } from "../config/designPrefModuleConfig";

const DesignPrefSections = ({
  module,
  inputs,
  setInputs,
  selectedOption = null,
  setDesignPrefModalStatus,
  setConfirmationModal,
  confirmationModal,
  isInputLocked,
  /** From `useEngineeringModule`; `ModuleContext.materialList` is empty on engineering-module routes. */
  moduleMaterialList,
}) => {
  const designPrefConfig = getDesignPrefConfig(module);
  const tabs = getDesignPrefTabs(module);
  const ctx = useContext(ModuleContext);
  const materialListForModals = moduleMaterialList ?? ctx.materialList ?? [];
  const [activeTab, setActiveTab] = useState(() => designPrefConfig.initialTabIndex);
  const { design_pref_defaults } = ctx;

  const [designPrefInputs, setDesignPrefInputs] = useState(() =>
    designPrefConfig.getInitialPrefs(inputs, module)
  );

  const saveCoreInputs = () => {
    setInputs({ ...inputs, ...designPrefInputs });
    setDesignPrefModalStatus(false);
    setConfirmationModal(false);
  };

  const getDefaultPrefsForModule = () =>
    designPrefConfig.getDefaultPrefs(inputs, module, design_pref_defaults);

  const resetInputs = () => {
    const defaults = getDefaultPrefsForModule();
    setDesignPrefInputs(defaults);
    setInputs({ ...inputs, ...defaults });
    setConfirmationModal(false);
    setDesignPrefModalStatus(false);
  };

  return (
    <div>
      <div className="bloc-tabs" style={{ marginTop: "10px" }}>
        {tabs.map((item) => {
          return (
            <button
              key={item.id}
              className={
                activeTab == item.id
                  ? "tab-btn tabs-design-pref active-tabs"
                  : "tab-btn tabs-design-pref"
              }
              onClick={() => setActiveTab(item.id)}
            >
              {selectedOption === "Beam-Beam" &&
              (item.name === "Column Section*" || item.name == "Beam Section*")
                ? item.name === "Column Section*"
                  ? "Primary Beam*"
                  : "Secondary Beam*"
                : item.name}
            </button>
          );
        })}
      </div>
      <div className="design-pref-cont">
        {activeTab === 0 && (
          <ColumnSectionModal
            module={module}
            inputs={inputs}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
            materialList={materialListForModals}
          />
        )}
        {activeTab === 1 && (
          <BeamSectionModal
            module={module}
            inputs={inputs}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
            materialList={materialListForModals}
          />
        )}
        {activeTab === 2 && (
          <AngleSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
            materialList={materialListForModals}
          />
        )}
        {activeTab === 3 && (
            <ConnectorSectionModal
              module={module}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
            />
          )}

        {activeTab === 4 && (
            <CleatAngleSectionModal
              module={module}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
            />
          )}

        {activeTab === 5 && (
            <SeatedAngleSectionModal
              module={module}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
            />
          )}
     
        {activeTab === 6 && (
          <BoltSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        {activeTab === 7 && (
          <BasePlateSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
            materialList={materialListForModals}
          />
        )}
        {activeTab === 8 && (
          <StiffenerSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
            materialList={materialListForModals}
          />
        )}
        {activeTab === 9 && (
          <AnchorBoltSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
            materialList={materialListForModals}
          />
        )}
        {activeTab === 10 && (
          <WeldSectionModal
            module={module}
            inputs={inputs}
            setInputs={setInputs}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        {activeTab === 11 && (
          <DetailingSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        {activeTab === 12 && (
          <OptimizationSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
            materialList={materialListForModals}
          />
        )}
        {activeTab === 13 && (
          <DesignSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        
      </div>
      
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",   // controls closeness
          marginTop: "8px",
        }}
      >
        <Button onClick={resetInputs} disabled={isInputLocked} style={{ minWidth: "140px" }}>
          Defaults
        </Button>
        <Button
          type="primary"
          onClick={saveCoreInputs}
          disabled={isInputLocked}
          style={{ minWidth: "140px" }}
        >
          Save
        </Button>
      </div>
      <Modal
        title="Design Preferences"
        open={confirmationModal}
        onOk={saveCoreInputs}
        onCancel={() => setConfirmationModal(false)}
        okText="Yes"
        cancelText="No"
      >
        <p>Do you want to apply these design preferences to the current design?</p>
      </Modal>
    </div>
  );
};

export default DesignPrefSections;

