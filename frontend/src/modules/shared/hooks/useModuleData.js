import { useEffect, useState, useMemo } from "react";
import { MODULE_DATA_LIST_KEYS, API_KEY_MAP } from "../constants/moduleDataKeys";

const CUSTOM_SECTION_EVENT = "osdag:custom-section-added";

const SECTION_TABLE_TO_LIST_KEYS = {
  Columns: ["columnList", "sectionDesignation"],
  Beams: ["beamList", "sectionDesignation"],
  Angles: ["angleList", "topAngleList"],
  Channels: ["channelList"],
};

const appendUnique = (list = [], value) => {
  if (!value) return list || [];
  const safeList = Array.isArray(list) ? list : [];
  const stringValue = String(value);
  if (safeList.some((item) => String(item) === stringValue)) return safeList;
  return [...safeList, value];
};

const mergeLocalCustomSections = (data, localCustomSections) => {
  const next = { ...data };
  Object.entries(localCustomSections || {}).forEach(([table, designations]) => {
    const listKeys = SECTION_TABLE_TO_LIST_KEYS[table] || [];
    listKeys.forEach((key) => {
      designations.forEach((designation) => {
        next[key] = appendUnique(next[key], designation);
      });
    });
  });
  return next;
};

/**
 * Data layer for engineering modules.
 * Fetches dropdown/static lists for the given design type.
 */
export const useModuleData = (getModuleData, designType, optionsRefetchKey = 0) => {
  const initialState = MODULE_DATA_LIST_KEYS.reduce((acc, k) => ({ ...acc, [k]: [] }), {});
  const [baseModuleData, setBaseModuleData] = useState(initialState);
  const [localCustomSections, setLocalCustomSections] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const handleCustomSectionAdded = (event) => {
      const { table, designation } = event.detail || {};
      if (!table || !designation || !SECTION_TABLE_TO_LIST_KEYS[table]) return;
      setLocalCustomSections((prev) => ({
        ...prev,
        [table]: appendUnique(prev[table], designation),
      }));
    };

    window.addEventListener(CUSTOM_SECTION_EVENT, handleCustomSectionAdded);
    return () => window.removeEventListener(CUSTOM_SECTION_EVENT, handleCustomSectionAdded);
  }, []);

  useEffect(() => {
    const loadModuleData = async () => {
      if (!designType) return;
      setLoadingOptions(true);
      try {
        const result = await getModuleData(designType);
        if (result && result.success && result.data) {
          const data = result.data || {};
          const pick = (camel, snake) => data[camel] ?? data[snake] ?? [];
          const next = MODULE_DATA_LIST_KEYS.reduce((acc, camel) => {
            acc[camel] = pick(camel, API_KEY_MAP[camel]);
            return acc;
          }, {});
          setBaseModuleData(next);
        }
      } catch (error) {
        console.error("Failed to load module data:", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadModuleData();
  }, [designType, getModuleData, optionsRefetchKey]);

  const mergedOptions = useMemo(() => {
    return { ...mergeLocalCustomSections(baseModuleData, localCustomSections), loadingOptions };
  }, [baseModuleData, localCustomSections, loadingOptions]);

  return mergedOptions;
};

export const notifyCustomSectionAdded = ({ table, designation }) => {
  window.dispatchEvent(
    new CustomEvent(CUSTOM_SECTION_EVENT, {
      detail: { table, designation },
    })
  );
};
