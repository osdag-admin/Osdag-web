import { expandAllSelectedInputs } from "../utils/osiInputSerializer";
import { openOsiFile } from "../../../datasources/osiDataSource";
import { loadStateFromOsi } from "../utils/osiLoader";
import { MODULE_KEY_SEAT_ANGLE } from "../../../constants/DesignKeys";
import { message } from "antd";

export const useOsiFileHandlers = ({ form, moduleData, actions }, moduleConfig) => {
  const {
    inputs,
    setInputs,
    allSelected,
    designPrefOverrides,
    setDesignPrefOverrides,
    extraState,
    setExtraState,
    setSelectionStates,
    setSelectedItems,
  } = form;

  const { contextData } = moduleData;
  const { service } = actions;

  const handleSaveInputs = async () => {
    const module_id = moduleConfig?.designType || inputs?.module || moduleConfig?.cameraKey || MODULE_KEY_SEAT_ANGLE;
    const projectName = inputs?.project_name || inputs?.name || moduleConfig?.sessionName || 'project';

    try {
      const inputsForSave = expandAllSelectedInputs(inputs, allSelected, contextData);

      let flatInputs = {};
      if (moduleConfig && typeof moduleConfig.buildSubmissionParams === "function") {
        try {
          flatInputs = moduleConfig.buildSubmissionParams(
            inputsForSave,
            allSelected,
            contextData,
            extraState
          ) || {};
        } catch (e) {
          flatInputs = { ...inputsForSave };
        }
      } else {
        flatInputs = { ...inputsForSave };
      }

      Object.entries(designPrefOverrides || {}).forEach(([key, val]) => {
        flatInputs[`Pref.${key}`] = val;
      });

      const result = await service.saveOSIFromInputs(projectName, module_id, flatInputs, true);
      if (result.success && result.content_base64) {
        try {
          const binaryString = atob(result.content_base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename || `${projectName}.osi`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('OSI file downloaded successfully');
        } catch (err) {
          message.error('Failed to download OSI file');
        }
        return;
      }
      message.error(result.error || 'Failed to download OSI');
    } catch (err) {
      message.error('Failed to download OSI');
    }
  };

  const handleLoadInputFromShortcut = async () => {
    const element = document.createElement("input");
    element.setAttribute("type", "file");
    element.accept = ".osi";
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();

    element.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) {
        document.body.removeChild(element);
        return;
      }
      try {
        const formData = new FormData();
        formData.append("file", file);
        const data = await openOsiFile(formData);
        if (data.ok && data.success) {
          loadStateFromOsi(data.inputs || {}, {
            setInputs,
            setDesignPrefOverrides,
            setExtraState,
            setSelectionStates,
            setAllSelected: () => {},
            setSelectedItems,
            moduleConfig,
            safeModuleData: contextData || {},
          });
          message.success("Input loaded from OSI");
        } else {
          message.error(data.error || "Failed to open OSI file");
        }
      } catch (err) {
        message.error("Failed to open OSI file");
      } finally {
        if (document.body.contains(element)) {
          document.body.removeChild(element);
        }
      }
    });
  };

  return {
    handleSaveInputs,
    handleLoadInputFromShortcut,
  };
};
