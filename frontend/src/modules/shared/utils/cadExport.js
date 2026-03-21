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

  if (!window.showSaveFilePicker) {
    message.error('File picker not supported in this browser. Please use a modern browser like Chrome or Edge.');
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
        const base64String =
          typeof base64Data === 'string' && base64Data.includes(',')
            ? base64Data.split(',')[1]
            : base64Data;

        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'application/octet-stream' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${section.toLowerCase()}_model.stl`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

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

