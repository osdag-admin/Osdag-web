import React, { useState, useContext } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import ColumnSectionModal from "./ColumnSectionModal";
import BeamSectionModal from "./BeamSectionModal";
import ConnectorSectionModal from "./ConnectorSectionModal";
import BoltSectionModal from "./BoltSectionModal";
import WeldSectionModal from "./WeldSectionModal";
import DetailingSectionModal from "./DetailingSectionModal";
import DesignSectionModal from "./DesignSectionModal";
import { Button, Modal } from "antd";
import { MODULE_KEY_FIN_PLATE } from "../../../constants/DesignKeys";
import { getDesignPrefConfig, getDesignPrefTabs } from "../config/designPrefModuleConfig";

const DesignPrefSections = ({
  module = MODULE_KEY_FIN_PLATE,
  inputs,
  setInputs,
  selectedOption = null,
  setDesignPrefModalStatus,
  setConfirmationModal,
  confirmationModal,
  isInputLocked,
}) => {
  const designPrefConfig = getDesignPrefConfig(module);
  const tabs = getDesignPrefTabs(module);

  const [activeTab, setActiveTab] = useState(() => designPrefConfig.initialTabIndex);
  const { design_pref_defaults } = useContext(ModuleContext);

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
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        {activeTab === 1 && (
          <BeamSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        {activeTab === 2 && (
          <ConnectorSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        {activeTab === 3 && (
          <BoltSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        {activeTab === 4 && (
          <WeldSectionModal
            module={module}
            inputs={inputs}
            setInputs={setInputs}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        {activeTab === 5 && (
          <DetailingSectionModal
            module={module}
            designPrefInputs={designPrefInputs}
            setDesignPrefInputs={setDesignPrefInputs}
            isInputLocked={isInputLocked}
          />
        )}
        {activeTab === 6 && (
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
          justifyContent: "space-between",
          marginTop: "1rem",
        }}
      >
        <Button onClick={resetInputs} disabled={isInputLocked}>
          Reset
        </Button>
        <Button
          type="primary"
          onClick={saveCoreInputs}
          disabled={isInputLocked}
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

