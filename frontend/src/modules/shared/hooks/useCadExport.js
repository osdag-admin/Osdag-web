import { downloadCachedModelByFormat, downloadExportCadResponse, downloadCadSectionsAsStl } from "../utils/cadExport";
import { message } from "antd";

export const useCadExport = ({ form, moduleData, designStatus, actions }, moduleConfig) => {
  const { inputs, allSelected, extraState } = form;
  const { contextData } = moduleData;
  const { cadModelPaths } = designStatus;
  const { service } = actions;

  const exportCadByType = async (optionName) => {
    const formatMap = {
      "Export BREP": "brep",
      "Export STL": "stl",
      "Export STEP": "step",
      "Export IGS": "iges",
      "Export IFC": "ifc",
    };
    const format = formatMap[optionName];
    if (!format) {
      message.error("Unsupported export type.");
      return;
    }

    const moduleId = moduleConfig?.designType || inputs?.module;
    if (!moduleId) {
      message.error("Module ID is missing. Unable to export CAD.");
      return;
    }

    const hasModelOrOutput = !!designStatus?.output || (cadModelPaths && Object.keys(cadModelPaths).length > 0);
    if (!hasModelOrOutput) {
      message.warning("Run design first to generate CAD output.");
      return;
    }

    if (format === "brep" || format === "stl") {
      const downloaded = await downloadCachedModelByFormat({
        cadModelPaths,
        format,
        moduleId,
        message,
      });
      if (downloaded) return;
    }

    if (format === "stl" && cadModelPaths && Object.keys(cadModelPaths).length > 0) {
      await downloadCadSectionsAsStl(cadModelPaths, message);
      return;
    }

    if (typeof moduleConfig?.buildSubmissionParams !== "function") {
      message.error("Module export configuration is missing.");
      return;
    }

    try {
      const inputValues = moduleConfig.buildSubmissionParams(
        inputs,
        allSelected,
        contextData || {},
        extraState || {}
      );

      const result = await service.exportCADModel(
        moduleId,
        inputValues,
        format,
        "Model"
      );

      if (!result?.success || !result?.blob) {
        message.error(result?.error || "CAD export failed");
        return;
      }

      downloadExportCadResponse({
        blob: result.blob,
        disposition: result.disposition,
        fallbackFilename: `${moduleId}_Model.${format}`,
      });
      message.success(`${format.toUpperCase()} exported successfully`);
    } catch (error) {
      message.error(error?.message || "Failed to export CAD");
    }
  };

  return {
    exportCadByType,
  };
};
