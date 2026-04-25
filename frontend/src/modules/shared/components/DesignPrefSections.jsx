import React, { useRef, useState, useContext, useEffect, useCallback } from "react";
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
import { Button, Modal, Spin, message } from "antd";
import { getDesignPrefConfig, getDesignPrefTabs } from "../config/designPrefModuleConfig";
import {
  fetchDesignPrefDefaults,
  fetchDesignPrefSync,
} from "../../../datasources/modulesDataSource";

const DesignPrefSections = ({
  module,
  inputs,
  setInputs,
  designPrefOverrides = {},
  setDesignPrefOverrides,
  selectedOption = null,
  setDesignPrefModalStatus,
  setConfirmationModal,
  confirmationModal,
  isInputLocked,
  /** From `useEngineeringModule`; `ModuleContext.materialList` is empty on engineering-module routes. */
  moduleMaterialList,
  isGuest = false,
  onRefetchModuleOptions,
}) => {
  const designPrefConfig = getDesignPrefConfig(module);
  const tabs = getDesignPrefTabs(module);
  const ctx = useContext(ModuleContext);
  const materialListForModals = moduleMaterialList ?? ctx.materialList ?? [];
  const [activeTab, setActiveTab] = useState(() => designPrefConfig.initialTabIndex);
  const {
    applyDesignPrefSyncBundle,
    setLastKnownGoodDesignPrefSnapshot,
    invalidateDesignOutputs,
    lastKnownGoodDesignPrefSnapshot,
  } = ctx;

  const suppressInitialMaterialDispatch = true;

  const [designPrefInputs, setDesignPrefInputs] = useState(() =>
    designPrefConfig.getInitialPrefs({ ...inputs, ...(designPrefOverrides || {}) }, module)
  );
  const [sectionDetails, setSectionDetails] = useState({ supporting: {}, supported: {} });

  const [syncLoading, setSyncLoading] = useState(true);
  const [syncReady, setSyncReady] = useState(false);

  const syncAbortRef = useRef(null);
  const syncReqIdRef = useRef(0);
  const inputsRef = useRef(inputs);
  inputsRef.current = inputs;
  const prefOverridesRef = useRef(designPrefOverrides);
  prefOverridesRef.current = designPrefOverrides || {};

  const buildMergedInputsForSync = useCallback(
    () => ({ ...inputsRef.current, ...(prefOverridesRef.current || {}) }),
    []
  );

  const toStoredPrefOverrides = useCallback((resolvedInputs) => {
    const next = { ...(resolvedInputs || {}) };
    delete next.material;
    delete next.member_material;
    return next;
  }, []);

  const syncSnapshotRef = useRef(
    lastKnownGoodDesignPrefSnapshot || {
      resolved_inputs: buildMergedInputsForSync(),
      material_details: null,
      metadata: null,
    }
  );

  const rollBackSync = useCallback(() => {
    const snap = syncSnapshotRef.current;
    if (!snap?.resolved_inputs) return;
    applyDesignPrefSyncBundle({ material_details: snap.material_details || {} });
    setSectionDetails(snap.section_details || { supporting: {}, supported: {} });
    setDesignPrefInputs(designPrefConfig.getInitialPrefs(snap.resolved_inputs, module));
    setDesignPrefOverrides?.(toStoredPrefOverrides(snap.resolved_inputs));
  }, [
    applyDesignPrefSyncBundle,
    designPrefConfig,
    module,
    setDesignPrefOverrides,
    setDesignPrefInputs,
    setSectionDetails,
    toStoredPrefOverrides,
  ]);

  const applySyncResponse = useCallback(
    (data) => {
      const resolvedInputs = data.resolved_inputs || {};
      applyDesignPrefSyncBundle({ material_details: data.material_details });
      setDesignPrefInputs(designPrefConfig.getInitialPrefs(resolvedInputs, module));
      syncSnapshotRef.current = {
        resolved_inputs: resolvedInputs,
        material_details: data.material_details,
        metadata: data.metadata,
        section_details: data.section_details || { supporting: {}, supported: {} },
      };
      setSectionDetails(data.section_details || { supporting: {}, supported: {} });
      setLastKnownGoodDesignPrefSnapshot(syncSnapshotRef.current);
    },
    [applyDesignPrefSyncBundle, designPrefConfig, module, setLastKnownGoodDesignPrefSnapshot]
  );

  const runSync = useCallback(
    async (operation, designDraft = null) => {
      syncAbortRef.current?.abort();
      const ac = new AbortController();
      syncAbortRef.current = ac;
      const reqId = ++syncReqIdRef.current;

      setSyncLoading(true);
      try {
        const res = await fetchDesignPrefSync(
          {
            module_session_name: module,
            inputs: buildMergedInputsForSync(),
            operation,
            design_pref_draft: designDraft,
          },
          ac.signal
        );
        if (reqId !== syncReqIdRef.current) return { success: false, stale: true };
        if (!res.success) {
          if (res.aborted) return { success: false, aborted: true };
          throw new Error(res.error || "Preference sync request failed");
        }
        applySyncResponse(res.data);
        return { success: true, data: res.data };
      } catch (e) {
        if (e?.name === "AbortError") return { success: false, aborted: true };
        message.error(
          e.message || "Could not synchronize Additional Inputs with the server."
        );
        rollBackSync();
        return { success: false, error: e.message };
      } finally {
        if (reqId === syncReqIdRef.current) {
          setSyncLoading(false);
          setSyncReady(true);
        }
      }
    },
    [applySyncResponse, module, rollBackSync, buildMergedInputsForSync]
  );

  const runDefaults = useCallback(async () => {
    syncAbortRef.current?.abort();
    const ac = new AbortController();
    syncAbortRef.current = ac;
    const reqId = ++syncReqIdRef.current;
    setSyncLoading(true);
    try {
      const res = await fetchDesignPrefDefaults(
        {
          module_session_name: module,
          inputs: buildMergedInputsForSync(),
        },
        ac.signal
      );
      if (reqId !== syncReqIdRef.current) return { success: false, stale: true };
      if (!res.success) {
        if (res.aborted) return { success: false, aborted: true };
        throw new Error(res.error || "Preference defaults request failed");
      }
      const normalized = {
        ...res.data,
        resolved_inputs: res.data.default_pref_inputs || {},
      };
      applySyncResponse(normalized);
      return { success: true, data: normalized };
    } catch (e) {
      if (e?.name === "AbortError") return { success: false, aborted: true };
      message.error(
        e.message || "Could not load Additional Inputs defaults from the server."
      );
      rollBackSync();
      return { success: false, error: e.message };
    } finally {
      if (reqId === syncReqIdRef.current) {
        setSyncLoading(false);
        setSyncReady(true);
      }
    }
  }, [applySyncResponse, module, rollBackSync, buildMergedInputsForSync]);

  // Resolve canonical open state on modal mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
        const r = await runSync("open", null);
      if (!cancelled && r?.success && r.data?.resolved_inputs) {
        setDesignPrefOverrides?.(toStoredPrefOverrides(r.data.resolved_inputs));
      }
    })();
    return () => {
      cancelled = true;
      syncAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per modal open.
  }, [runSync, setDesignPrefOverrides, toStoredPrefOverrides]);

  // Driving material changed while modal is open — refresh sync state.
  const skipMaterialRefresh = useRef(true);
  useEffect(() => {
    if (!syncReady) return;
    if (skipMaterialRefresh.current) {
      skipMaterialRefresh.current = false;
      return;
    }
    (async () => {
      const r = await runSync("refresh", null);
      if (r?.success && r.data?.resolved_inputs) {
        setDesignPrefOverrides?.(toStoredPrefOverrides(r.data.resolved_inputs));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runSync is stable; avoid reruns on callback identity.
  }, [
    inputs?.connector_material,
    inputs?.material,
    inputs?.member_material,
    syncReady,
    runSync,
    setDesignPrefOverrides,
    toStoredPrefOverrides,
  ]);

  const saveCoreInputs = async () => {
    const r = await runSync("save", designPrefInputs);
    if (!r?.success) {
      return;
    }
    if (r.data?.resolved_inputs) setDesignPrefOverrides?.(toStoredPrefOverrides(r.data.resolved_inputs));
    invalidateDesignOutputs();
    message.success("Preferences saved. Run design again to refresh outputs.");
    setDesignPrefModalStatus(false);
    setConfirmationModal(false);
  };

  const resetInputs = async () => {
    const r = await runDefaults();
    if (!r?.success) return;
    if (r.data?.resolved_inputs) setDesignPrefOverrides?.(toStoredPrefOverrides(r.data.resolved_inputs));
    invalidateDesignOutputs();
    setConfirmationModal(false);
    setDesignPrefModalStatus(false);
  };

  const handleDiscard = () => {
    setConfirmationModal(false);
    setDesignPrefModalStatus(false);
  };

  const modalCommon = { suppressInitialMaterialDispatch };

  return (
    <div>
      <Spin spinning={syncLoading} tip="Syncing preferences…">
        <div className="bloc-tabs" style={{ marginTop: "10px", opacity: syncLoading ? 0.6 : 1 }}>
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                activeTab == item.id
                  ? "tab-btn tabs-design-pref active-tabs"
                  : "tab-btn tabs-design-pref"
              }
              onClick={() => setActiveTab(item.id)}
              disabled={syncLoading}
            >
              {selectedOption === "Beam-Beam" &&
              (item.name === "Column Section*" || item.name == "Beam Section*")
                ? item.name === "Column Section*"
                  ? "Primary Beam*"
                  : "Secondary Beam*"
                : item.name}
            </button>
          ))}
        </div>
        <div className="design-pref-cont">
          {activeTab === 0 && (
            <ColumnSectionModal
              module={module}
              inputs={inputs}
              supportingSectionData={sectionDetails.supporting}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
              isGuest={isGuest}
              onRefetchModuleOptions={onRefetchModuleOptions}
              {...modalCommon}
            />
          )}
          {activeTab === 1 && (
            <BeamSectionModal
              module={module}
              inputs={inputs}
              supportedSectionData={sectionDetails.supported}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
              isGuest={isGuest}
              onRefetchModuleOptions={onRefetchModuleOptions}
              {...modalCommon}
            />
          )}
          {activeTab === 2 && (
            <AngleSectionModal
              module={module}
              inputs={inputs}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
              isGuest={isGuest}
              onRefetchModuleOptions={onRefetchModuleOptions}
              {...modalCommon}
            />
          )}
          {activeTab === 3 && (
            <ConnectorSectionModal
              module={module}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
              {...modalCommon}
            />
          )}

          {activeTab === 4 && (
            <CleatAngleSectionModal
              module={module}
              inputs={inputs}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
              isGuest={isGuest}
              onRefetchModuleOptions={onRefetchModuleOptions}
              {...modalCommon}
            />
          )}

          {activeTab === 5 && (
            <SeatedAngleSectionModal
              module={module}
              inputs={inputs}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
              isGuest={isGuest}
              onRefetchModuleOptions={onRefetchModuleOptions}
              {...modalCommon}
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
              {...modalCommon}
            />
          )}
          {activeTab === 8 && (
            <StiffenerSectionModal
              module={module}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
              {...modalCommon}
            />
          )}
          {activeTab === 9 && (
            <AnchorBoltSectionModal
              module={module}
              designPrefInputs={designPrefInputs}
              setDesignPrefInputs={setDesignPrefInputs}
              isInputLocked={isInputLocked}
              materialList={materialListForModals}
              {...modalCommon}
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
              {...modalCommon}
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
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <Button
            onClick={resetInputs}
            disabled={isInputLocked || syncLoading}
            style={{ minWidth: "140px" }}
          >
            Defaults
          </Button>
          <Button
            type="primary"
            onClick={saveCoreInputs}
            disabled={isInputLocked || syncLoading}
            style={{ minWidth: "140px" }}
          >
            Save
          </Button>
        </div>
      </Spin>
      <Modal
        title="Save"
        open={confirmationModal}
        onCancel={() => setConfirmationModal(false)}
        footer={[
          <Button key="yes" type="primary" onClick={saveCoreInputs}>
            Yes
          </Button>,
          <Button key="no" onClick={handleDiscard}>
            No
          </Button>,
          <Button key="cancel" onClick={() => setConfirmationModal(false)}>
            Cancel
          </Button>,
        ]}
      >
        Do you want to save the changes?
      </Modal>
    </div>
  );
};

export default DesignPrefSections;
