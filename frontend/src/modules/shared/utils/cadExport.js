import {
  parseContentDispositionFilename,
  triggerBrowserDownload,
} from "../../../datasources/sectionsDataSource";

const decodeBase64ToBlob = (base64Data) => {
  const base64String =
    typeof base64Data === "string" && base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: "application/octet-stream" });
};

const resolveModelDataForFormat = (cadModelPaths, format) => {
  if (!cadModelPaths || typeof cadModelPaths !== "object") return null;
  const keys = Object.keys(cadModelPaths);
  if (keys.length === 0) return null;

  const lowerMap = Object.fromEntries(keys.map((k) => [k.toLowerCase(), k]));
  const fmt = format.toLowerCase();
  const modelCandidates = [
    `model_${fmt}`,
    `model-${fmt}`,
    `model.${fmt}`,
    `model${fmt}`,
    "model",
  ];

  for (const candidate of modelCandidates) {
    const realKey = lowerMap[candidate];
    if (!realKey) continue;
    const value = cadModelPaths[realKey];
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      const nestedKey = Object.keys(value).find((k) => k.toLowerCase() === fmt);
      if (nestedKey && typeof value[nestedKey] === "string") return value[nestedKey];
    }
  }
  return null;
};

export const downloadCachedModelByFormat = async ({
  cadModelPaths,
  format,
  moduleId,
  message,
}) => {
  const modelData = resolveModelDataForFormat(cadModelPaths, format);
  if (!modelData) {
    return false;
  }

  try {
    const blob = decodeBase64ToBlob(modelData);
    triggerBrowserDownload(blob, `${moduleId}_Model.${format.toLowerCase()}`);
    message.success(`${format.toUpperCase()} exported successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to export cached ${format}:`, error);
    message.error(`Failed to export ${format.toUpperCase()}`);
    return false;
  }
};

export const downloadExportCadResponse = ({ blob, disposition, fallbackFilename }) => {
  const filenameFromHeader = parseContentDispositionFilename(disposition || null);
  triggerBrowserDownload(blob, filenameFromHeader || fallbackFilename);
};

export const downloadCadSectionsAsStl = async (cadModelPaths, message) => {
  if (!cadModelPaths || Object.keys(cadModelPaths).length === 0) {
    message.warning('No 3D model available. Please run a design calculation first to generate the CAD model.');
    return;
  }

  const availableSections = Object.keys(cadModelPaths).filter((key) => cadModelPaths[key]);

  if (availableSections.length === 0) {
    message.warning('No CAD model sections available to download.');
    return;
  }

  try {
    for (const section of availableSections) {
      const base64Data = cadModelPaths[section];
      if (!base64Data) {
        console.warn(`No data available for section: ${section}`);
        continue;
      }

      try {
        const blob = decodeBase64ToBlob(base64Data);
        triggerBrowserDownload(blob, `${section.toLowerCase()}_model.stl`);

        if (availableSections.indexOf(section) < availableSections.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (decodeError) {
        console.error(`Error decoding base64 data for ${section}:`, decodeError);
        message.error(`Failed to decode CAD model data for ${section}: ${decodeError.message}`);
      }
    }

    message.success(
      `Downloaded ${availableSections.length} CAD model file(s): ${availableSections.join(', ')}`
    );
  } catch (error) {
    console.error('Save 3D model error:', error);
    message.error(`Failed to save 3D model: ${error.message || 'Unknown error'}`);
  }
};

