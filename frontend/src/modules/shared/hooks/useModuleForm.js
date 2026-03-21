import { useEffect, useState } from "react";
import {
  MODULE_KEY_FIN_PLATE,
  MODULE_KEY_CLEAT_ANGLE,
  MODULE_KEY_SEAT_ANGLE,
  MODULE_KEY_END_PLATE,
  MODULE_KEY_BEAM_BEAM_END_PLATE,
  MODULE_KEY_BEAM_COLUMN_END_PLATE,
} from "../../../constants/DesignKeys";
import { INPUT_KEY_TO_LIST } from "../constants/moduleDataKeys";

/**
 * Form/state layer for engineering modules.
 * - Manages inputs & extraState
 * - Manages selection/allSelected/selectedItems
 * - Handles prefill from sessionStorage
 * - Applies \"Select All\" logic to sync lists into inputs
 */
export const useModuleForm = (moduleConfig, moduleData) => {
  const safeModuleData = moduleData || {};

  // Inputs state
  const [inputs, setInputs] = useState(moduleConfig.defaultInputs);

  // Initialize extraState based on module type (delegated to config when available)
  const resolveInitialExtraState = () => {
    if (typeof moduleConfig.getInitialExtraState === "function") {
      return moduleConfig.getInitialExtraState();
    }
    if (moduleConfig.cameraKey === MODULE_KEY_FIN_PLATE) {
      return { selectedOption: "Column Flange-Beam-Web" };
    } else if (moduleConfig.cameraKey === MODULE_KEY_CLEAT_ANGLE) {
      return { selectedOption: "Column Flange-Beam-Web" };
    } else if (moduleConfig.cameraKey === MODULE_KEY_SEAT_ANGLE) {
      return { selectedOption: "Column Flange-Beam-Web" };
    } else if (moduleConfig.cameraKey === MODULE_KEY_END_PLATE) {
      return { selectedOption: "Column Flange-Beam-Web" };
    } else if (moduleConfig.cameraKey === MODULE_KEY_BEAM_BEAM_END_PLATE) {
      return { selectedOption: "Flushed - Reversible Moment" };
    } else if (moduleConfig.cameraKey === MODULE_KEY_BEAM_COLUMN_END_PLATE) {
      return { selectedOption: "Flushed - Reversible Moment" };
    }
    return { selectedOption: "Column Flange-Beam-Web" };
  };

  const [extraState, setExtraState] = useState(resolveInitialExtraState());

  // Selection states
  const [selectionStates, setSelectionStates] = useState(
    (moduleConfig.selectionConfig || []).reduce((acc, selection) => {
      acc[selection.key] = selection.defaultValue || "All";
      return acc;
    }, {})
  );

  // All selected states
  const [allSelected, setAllSelected] = useState(
    (moduleConfig.selectionConfig || []).reduce((acc, selection) => {
      acc[selection.inputKey] = true;
      return acc;
    }, {})
  );

  // Selected items for transfers
  const [selectedItems, setSelectedItems] = useState(
    (moduleConfig.selectionConfig || []).reduce((acc, selection) => {
      acc[selection.inputKey] = [];
      return acc;
    }, {})
  );

  // Modal states
  const [modalStates, setModalStates] = useState(
    (moduleConfig.modalConfig || []).reduce((acc, modal) => {
      acc[modal.key] = false;
      return acc;
    }, {})
  );

  const [modalDynamicSrc, setModalDynamicSrc] = useState(
    (moduleConfig.modalConfig || []).reduce((acc, modal) => {
      if (!modal?.dataSource) acc[modal.key] = [];
      return acc;
    }, {})
  );

  // UI toggles
  const [designPrefModalStatus, setDesignPrefModalStatus] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [displaySaveInputPopup, setDisplaySaveInputPopup] = useState(false);
  const [saveInputFileName, setSaveInputFileName] = useState("");

  // Prefill inputs from sessionStorage if available
  useEffect(() => {
    try {
      const moduleKey = moduleConfig.cameraKey || moduleConfig.moduleKey || moduleConfig.designType;
      if (moduleKey) {
        const raw = sessionStorage.getItem(`prefill:${moduleKey}`);
        if (raw) {
          const uiObj = JSON.parse(raw);
          const baseDefaults = moduleConfig.defaultInputs || {};
          const osiKeyMap = moduleConfig.osiKeyMap || {};

          const normalized = {};
          const addIfPresent = (inputKey, value) => {
            if (value === undefined || value === null) return;
            const val = Array.isArray(value) ? (value.length ? value[0] : undefined) : value;
            if (val === undefined) return;
            normalized[inputKey] = typeof val === "string" ? val : String(val);
          };

          for (const inputKey of Object.keys(baseDefaults)) {
            const mappedOsiKey = osiKeyMap[inputKey];
            if (mappedOsiKey && Object.prototype.hasOwnProperty.call(uiObj, mappedOsiKey)) {
              addIfPresent(inputKey, uiObj[mappedOsiKey]);
              continue;
            }
            if (Object.prototype.hasOwnProperty.call(uiObj, inputKey)) {
              addIfPresent(inputKey, uiObj[inputKey]);
              continue;
            }
            const aliases = {
              bolt_hole_type: "Bolt.Bolt_Hole_Type",
              bolt_diameter: "Bolt.Diameter",
              bolt_grade: "Bolt.Grade",
              bolt_slip_factor: "Bolt.Slip_Factor",
              bolt_type: "Bolt.Type",
              connector_material: "Connector.Material",
              design_method: "Design.Design_Method",
              detailing_edge_type: "Detailing.Edge_type",
              detailing_gap: "Detailing.Gap",
              detailing_corr_status: "Detailing.Corrosive_Influences",
              load_axial: "Load.Axial",
              load_shear: "Load.Shear",
              plate_thickness: "Connector.Plate.Thickness_List",
              beam_section: "Member.Supported_Section.Designation",
              column_section: "Member.Supporting_Section.Designation",
              supported_material: "Member.Supported_Section.Material",
              supporting_material: "Member.Supporting_Section.Material",
            };
            const aliasKey = aliases[inputKey];
            if (aliasKey && Object.prototype.hasOwnProperty.call(uiObj, aliasKey)) {
              addIfPresent(inputKey, uiObj[aliasKey]);
              continue;
            }
          }

          if (Object.keys(normalized).length > 0) {
            setInputs({ ...baseDefaults, ...normalized });
          }
          sessionStorage.removeItem(`prefill:${moduleKey}`);
        }
      }
    } catch (e) {
      console.warn("Prefill from OSI failed:", e);
    }
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Select All" logic - syncs lists into inputs when All is active (uses INPUT_KEY_TO_LIST + moduleData)
  useEffect(() => {
    const nextInputs = { ...inputs };
    let changed = false;

    Object.entries(INPUT_KEY_TO_LIST).forEach(([inputKey, listKey]) => {
      if (!allSelected?.[inputKey]) return;
      const current = inputs?.[inputKey];
      const isEmptyArray = Array.isArray(current) ? current.length === 0 : !current;
      if (!isEmptyArray) return;
      const fullList = safeModuleData[listKey];
      const normalized = Array.isArray(fullList)
        ? fullList.map((val) => {
            if (typeof val === "object" && val !== null) {
              return val.value || val.Grade || String(val);
            }
            return String(val);
          })
        : [];
      nextInputs[inputKey] = normalized;
      changed = true;
    });

    if (changed) {
      setInputs(nextInputs);
    }
  }, [safeModuleData, allSelected, inputs]);

  // Auto-hide save input popup
  useEffect(() => {
    if (displaySaveInputPopup) {
      setTimeout(() => setDisplaySaveInputPopup(false), 4000);
    }
  }, [displaySaveInputPopup]);

  const updateModalState = (modalKey, isOpen) => {
    setModalStates((prev) => ({
      ...prev,
      [modalKey]: isOpen,
    }));
  };

  const updateSelectionState = (selectionKey, value) => {
    setSelectionStates((prev) => ({
      ...prev,
      [selectionKey]: value,
    }));
  };

  const updateSelectedItems = (inputKey, items) => {
    setSelectedItems((prev) => ({
      ...prev,
      [inputKey]: items,
    }));
    setInputs((prev) => ({
      ...prev,
      [inputKey]: items,
    }));
  };

  const toggleAllSelected = (inputKey, isAll) => {
    setAllSelected((prev) => ({
      ...prev,
      [inputKey]: isAll,
    }));
  };

  const resetFormState = () => {
    setInputs(moduleConfig.defaultInputs);
    setExtraState(resolveInitialExtraState());
    setSelectionStates(
      (moduleConfig.selectionConfig || []).reduce((acc, selection) => {
        acc[selection.key] = selection.defaultValue || "All";
        return acc;
      }, {})
    );
    setAllSelected(
      (moduleConfig.selectionConfig || []).reduce((acc, selection) => {
        acc[selection.inputKey] = true;
        return acc;
      }, {})
    );
    setSelectedItems(
      (moduleConfig.selectionConfig || []).reduce((acc, selection) => {
        acc[selection.inputKey] = [];
        return acc;
      }, {})
    );

    setModalStates(
      (moduleConfig.modalConfig || []).reduce((acc, modal) => {
        acc[modal.key] = false;
        return acc;
      }, {})
    );
    setModalDynamicSrc(
      (moduleConfig.modalConfig || []).reduce((acc, modal) => {
        if (!modal?.dataSource) acc[modal.key] = [];
        return acc;
      }, {})
    );

    setDesignPrefModalStatus(false);
    setConfirmationModal(false);
    setDisplaySaveInputPopup(false);
    setSaveInputFileName("");
  };

  return {
    inputs,
    setInputs,
    extraState,
    setExtraState,
    selectionStates,
    setSelectionStates,
    allSelected,
    setAllSelected,
    selectedItems,
    setSelectedItems,
    modalStates,
    setModalStates,
    modalDynamicSrc,
    setModalDynamicSrc,
    designPrefModalStatus,
    setDesignPrefModalStatus,
    confirmationModal,
    setConfirmationModal,
    displaySaveInputPopup,
    setDisplaySaveInputPopup,
    saveInputFileName,
    setSaveInputFileName,
    updateModalState,
    updateSelectionState,
    updateSelectedItems,
    toggleAllSelected,
    resetFormState,
  };
};


