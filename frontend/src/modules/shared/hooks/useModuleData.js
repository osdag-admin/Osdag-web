import { useEffect, useState } from "react";
import { MODULE_DATA_LIST_KEYS, API_KEY_MAP } from "../constants/moduleDataKeys";

/**
 * Data layer for engineering modules.
 * Fetches dropdown/static lists for the given design type.
 */
export const useModuleData = (getModuleData, designType, optionsRefetchKey = 0) => {
  const initialState = MODULE_DATA_LIST_KEYS.reduce((acc, k) => ({ ...acc, [k]: [] }), {});
  const [moduleData, setModuleData] = useState(initialState);

  useEffect(() => {
    const loadModuleData = async () => {
      if (!designType) return;
      try {
        const result = await getModuleData(designType);
        if (result && result.success && result.data) {
          const data = result.data || {};
          const pick = (camel, snake) => data[camel] ?? data[snake] ?? [];
          const next = MODULE_DATA_LIST_KEYS.reduce((acc, camel) => {
            acc[camel] = pick(camel, API_KEY_MAP[camel]);
            return acc;
          }, {});
          setModuleData(next);
        }
      } catch (error) {
        console.error("Failed to load module data:", error);
      }
    };

    loadModuleData();
  }, [designType, getModuleData, optionsRefetchKey]);

  return moduleData;
};

