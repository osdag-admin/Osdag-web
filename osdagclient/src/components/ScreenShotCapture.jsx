import { useThree, useFrame } from "@react-three/fiber";
import { useEffect } from "react";

async function saveImageWithDialog(canvas) {
  try {
    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
      const options = {
        types: [
          {
            description: "PNG Image",
            accept: { "image/png": [".png"] },
          },
          {
            description: "JPEG Image",
            accept: { "image/jpeg": [".jpeg", ".jpg"] },
          },
          {
            description: "BMP Image",
            accept: { "image/bmp": [".bmp"] },
          },
          {
            description: "TIFF Image",
            accept: { "image/tiff": [".tiff"] },
          },
        ],
        suggestedName: "cad_model_snapshot",
      };

      const handle = await window.showSaveFilePicker(options);
      const fileExtension = handle.name.split(".").pop().toLowerCase();

      const mimeTypes = {
        png: "image/png",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        bmp: "image/bmp",
        tiff: "image/tiff",
      };

      const mimeType = mimeTypes[fileExtension] || "image/png";

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType);
      });

      if (blob) {
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        console.error("Failed to create image blob.");
      }
    } else {
      // Fallback for browsers that don't support File System Access API
      const format = prompt("Enter image format (png, jpeg, jpg, bmp):", "png");
      if (!format) return;
      
      const allowedFormats = ["png", "jpeg", "jpg", "bmp"];
      if (!allowedFormats.includes(format.toLowerCase())) {
        alert("Invalid format. Please choose from: png, jpeg, jpg, bmp");
        return;
      }

      const mimeTypes = {
        png: "image/png",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        bmp: "image/bmp",
      };

      const mimeType = mimeTypes[format.toLowerCase()] || "image/png";

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cad_model_snapshot.${format.toLowerCase()}`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`${format.toUpperCase()} image saved successfully.`);
      } else {
        console.error("Failed to create image blob.");
      }
    }
  } catch (error) {
    console.error("Save CAD Image cancelled or failed", error);
  }
}

const ScreenshotCapture = ({ screenshotTrigger, setScreenshotTrigger, selectedView }) => {
  const { gl, scene, camera, invalidate } = useThree();

  useEffect(() => {
    const runScreenshot = async () => {
      if (selectedView !== "Model") {
        alert("Switch to 'Model' view first.");
        setScreenshotTrigger(false);
        return;
      }

      invalidate(); // 🔥 Force R3F to re-render the next frame properly

      await new Promise((resolve) => requestAnimationFrame(resolve)); // 🔥 wait until the frame is ready

      await saveImageWithDialog(gl.domElement);

      setScreenshotTrigger(false); // Reset
    };

    if (screenshotTrigger) {
      runScreenshot();
    }
  }, [screenshotTrigger, gl, scene, camera, selectedView, setScreenshotTrigger, invalidate]);

  return null;
};

export default ScreenshotCapture;
