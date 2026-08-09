import { normalizeOsiPayload } from "./osiNormalizer";
import { INPUT_KEY_TO_LIST } from "../constants/moduleDataKeys";

/**
 * Hydrates React state hooks with normalized input/preference payload.
 * Supports both nested JSON format and older flat formats automatically.
 */
export function loadStateFromOsi(payload, {
  setInputs,
  setDesignPrefOverrides,
  setExtraState,
  setSelectionStates,
  setAllSelected,
  setSelectedItems,
  moduleConfig,
  safeModuleData = {}
}) {
  if (!payload || !moduleConfig) return;

  const isNested = (payload.dock || payload.pref) || (payload.inputs && (payload.inputs.dock || payload.inputs.pref));
  const normalizedPayload = isNested
    ? {
        dock: payload.dock || payload.inputs?.dock || {},
        pref: payload.pref || payload.inputs?.pref || {}
      }
    : normalizeOsiPayload(payload, moduleConfig);

  // Ensure plate_thickness aliases are copied to standard form keys
  if (normalizedPayload.dock) {
    if (normalizedPayload.dock.plate_thickness_list && !normalizedPayload.dock.plate_thickness) {
      normalizedPayload.dock.plate_thickness = normalizedPayload.dock.plate_thickness_list;
    }
    if (normalizedPayload.dock.flange_plate_thickness_list && !normalizedPayload.dock.flange_plate_thickness) {
      normalizedPayload.dock.flange_plate_thickness = normalizedPayload.dock.flange_plate_thickness_list;
    }
    if (normalizedPayload.dock.web_plate_thickness_list && !normalizedPayload.dock.web_plate_thickness) {
      normalizedPayload.dock.web_plate_thickness = normalizedPayload.dock.web_plate_thickness_list;
    }
    if (normalizedPayload.dock.profile && !normalizedPayload.dock.section_profile) {
      normalizedPayload.dock.section_profile = normalizedPayload.dock.profile;
    }
    if (normalizedPayload.dock.end_1 && !normalizedPayload.dock.end_condition_1) {
      normalizedPayload.dock.end_condition_1 = normalizedPayload.dock.end_1;
    }
    if (normalizedPayload.dock.end_2 && !normalizedPayload.dock.end_condition_2) {
      normalizedPayload.dock.end_condition_2 = normalizedPayload.dock.end_2;
    }
    if (normalizedPayload.dock.end_1_y && !normalizedPayload.dock.end_condition_1_y) {
      normalizedPayload.dock.end_condition_1_y = normalizedPayload.dock.end_1_y;
    }
    if (normalizedPayload.dock.end_2_y && !normalizedPayload.dock.end_condition_2_y) {
      normalizedPayload.dock.end_condition_2_y = normalizedPayload.dock.end_2_y;
    }
    if (normalizedPayload.dock.load_axial) {
      if (!normalizedPayload.dock.axial_load) normalizedPayload.dock.axial_load = normalizedPayload.dock.load_axial;
      if (!normalizedPayload.dock.axial_force) normalizedPayload.dock.axial_force = normalizedPayload.dock.load_axial;
    }

    const prof = normalizedPayload.dock.section_profile;
    if (prof && (prof === "Channels" || prof === "Back to Back Channels")) {
      normalizedPayload.dock.location = "Web";
    } else if (prof && (prof.includes("Angle") && normalizedPayload.dock.location !== "Short Leg")) {
      normalizedPayload.dock.location = "Long Leg";
    }
  }

  const baseDefaults = moduleConfig.defaultInputs || {};
  const normalized = { ...baseDefaults, ...normalizedPayload.dock };

  if (setDesignPrefOverrides) {
    setDesignPrefOverrides(normalizedPayload.pref || {});
  }

  const targetAllSelected = {};
  const targetSelectionStates = {};
  const targetSelectedItems = {};

  Object.entries(normalizedPayload.dock).forEach(([inputKey, value]) => {
    if (value === undefined || value === null) return;

    const selectionItems = (moduleConfig.selectionConfig || []).filter(
      (item) => item.inputKey === inputKey
    );

    const isArrayField = selectionItems.length > 0;
    if (isArrayField) {
      const listVal = Array.isArray(value) ? value : [value];
      const normalizedList = listVal.map(item => String(item));
      normalized[inputKey] = normalizedList;

      selectionItems.forEach(selectionItem => {
        const dynamicListKey = INPUT_KEY_TO_LIST[inputKey];
        const dynamicOptions = dynamicListKey ? safeModuleData[dynamicListKey] : [];

        let isAll = false;
        if (Array.isArray(dynamicOptions) && dynamicOptions.length > 0 && dynamicOptions.length === normalizedList.length) {
          const optSet = new Set(dynamicOptions.map(o => String(o.id || o.Grade || o)));
          isAll = normalizedList.every(x => optSet.has(x));
        }

        if (isAll) {
          targetAllSelected[inputKey] = true;
          targetSelectionStates[selectionItem.key] = "All";
          targetSelectedItems[inputKey] = [];
        } else {
          targetAllSelected[inputKey] = false;
          targetSelectionStates[selectionItem.key] = "Customized";
          targetSelectedItems[inputKey] = normalizedList;
        }
      });
    } else {
      let finalVal = String(value);

      if (inputKey === "bolt_type") {
        let boltTypeField = null;
        for (const sec of moduleConfig.inputSections || []) {
          const found = sec.fields?.find(f => f.key === "bolt_type");
          if (found) {
            boltTypeField = found;
            break;
          }
        }
        if (boltTypeField && Array.isArray(boltTypeField.options)) {
          const optionValues = boltTypeField.options.map(o => typeof o === "object" ? o.value : o);
          if (!optionValues.includes(finalVal)) {
            const valWithUnderscore = finalVal.replace(/\s+/g, "_");
            const valWithSpace = finalVal.replace(/_/g, " ");
            if (optionValues.includes(valWithUnderscore)) {
              finalVal = valWithUnderscore;
            } else if (optionValues.includes(valWithSpace)) {
              finalVal = valWithSpace;
            }
          }
        }
      }

      if (inputKey === "bolt_tension_type") {
        if (/non[- ]?pretensioned/i.test(finalVal) || /non pre-tensioned/i.test(finalVal)) {
          finalVal = baseDefaults[inputKey]?.includes("pre-tensioned") ? "Non pre-tensioned" : "Non Pre-tensioned";
        } else if (/pretensioned/i.test(finalVal) || /pre-tensioned/i.test(finalVal)) {
          finalVal = "Pre-tensioned";
        }
      }

      if (inputKey === "bolt_hole_type") {
        if (/oversized/i.test(finalVal) || /over-sized/i.test(finalVal)) {
          finalVal = "Over-Sized";
        } else if (/standard/i.test(finalVal)) {
          finalVal = "Standard";
        }
      }

      if (inputKey === "material" && safeModuleData.materialList) {
        const matList = safeModuleData.materialList;
        const matched = matList.find(m => {
          const g = String(m.Grade || m.value || m).trim();
          return g === finalVal.trim() || finalVal.trim().startsWith(g) || g.startsWith(finalVal.trim());
        });
        if (matched) {
          finalVal = String(matched.Grade || matched.value || matched);
        }
      }

      normalized[inputKey] = finalVal;
    }
  });

  if (normalized.load_axial !== undefined && normalized.axial_force === undefined) {
    normalized.axial_force = normalized.load_axial;
  }
  if (normalized.axial_force !== undefined && normalized.load_axial === undefined) {
    normalized.load_axial = normalized.axial_force;
  }
  if (normalized.load_shear !== undefined && normalized.shear_force === undefined) {
    normalized.shear_force = normalized.load_shear;
  }
  if (normalized.shear_force !== undefined && normalized.load_shear === undefined) {
    normalized.load_shear = normalized.shear_force;
  }
  if (normalized.load_moment !== undefined && normalized.moment === undefined) {
    normalized.moment = normalized.load_moment;
  }
  if (normalized.moment !== undefined && normalized.load_moment === undefined) {
    normalized.load_moment = normalized.moment;
  }

  if (setInputs) {
    setInputs(normalized);
  }
  if (setAllSelected && Object.keys(targetAllSelected).length > 0) {
    setAllSelected(prev => ({ ...prev, ...targetAllSelected }));
  }
  if (setSelectionStates && Object.keys(targetSelectionStates).length > 0) {
    setSelectionStates(prev => ({ ...prev, ...targetSelectionStates }));
  }
  if (setSelectedItems && Object.keys(targetSelectedItems).length > 0) {
    setSelectedItems(prev => ({ ...prev, ...targetSelectedItems }));
  }

  if (setExtraState) {
    if (normalized.connectivity) {
      setExtraState(prev => ({
        ...prev,
        selectedOption: normalized.connectivity
      }));
    }
    if (normalized.section_profile) {
      const img = typeof moduleConfig?.getSectionImage === "function"
        ? moduleConfig.getSectionImage(normalized.section_profile)
        : null;
      setExtraState(prev => ({
        ...prev,
        selectedProfile: normalized.section_profile,
        ...(img ? { imageSource: img } : {})
      }));
    }
  }
}
