import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import {
  computeSceneBoundingBox,
  distanceForFov,
  DEFAULT_DISTANCE,
} from "./utils/sceneBbox";

async function saveImageWithDialog(canvas) {
  try {
    if ("showSaveFilePicker" in window) {
      const options = {
        types: [
          { description: "PNG Image", accept: { "image/png": [".png"] } },
          { description: "JPEG Image", accept: { "image/jpeg": [".jpeg", ".jpg"] } },
          { description: "BMP Image", accept: { "image/bmp": [".bmp"] } },
          { description: "TIFF Image", accept: { "image/tiff": [".tiff"] } },
        ],
        suggestedName: "cad_model_snapshot",
      };
      const handle = await window.showSaveFilePicker(options);
      const fileExtension = handle.name.split(".").pop().toLowerCase();
      const mimeTypes = { png: "image/png", jpeg: "image/jpeg", jpg: "image/jpeg", bmp: "image/bmp", tiff: "image/tiff" };
      const mimeType = mimeTypes[fileExtension] || "image/png";
      const blob = await new Promise((resolve) => { canvas.toBlob(resolve, mimeType); });
      if (blob) {
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        console.error("Failed to create image blob.");
      }
    } else {
      const format = prompt("Enter image format (png, jpeg, jpg, bmp):", "png");
      if (!format) return;
      const allowedFormats = ["png", "jpeg", "jpg", "bmp"];
      if (!allowedFormats.includes(format.toLowerCase())) {
        alert("Invalid format. Please choose from: png, jpeg, jpg, bmp");
        return;
      }
      const mimeTypes = { png: "image/png", jpeg: "image/jpeg", jpg: "image/jpeg", bmp: "image/bmp" };
      const mimeType = mimeTypes[format.toLowerCase()] || "image/png";
      const blob = await new Promise((resolve) => { canvas.toBlob(resolve, mimeType); });
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
      } else {
        console.error("Failed to create image blob.");
      }
    }
  } catch (error) {
    console.error("Save CAD Image cancelled or failed", error);
  }
}

export const ScreenshotCapture = ({
  screenshotTrigger,
  setScreenshotTrigger,
  selectedView,
}) => {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const runScreenshot = async () => {
      if (selectedView !== "Model") {
        alert("Switch to 'Model' view first.");
        setScreenshotTrigger(false);
        return;
      }
      invalidate();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await saveImageWithDialog(gl.domElement);
      setScreenshotTrigger(false);
    };
    if (screenshotTrigger) runScreenshot();
  }, [screenshotTrigger, gl, selectedView, setScreenshotTrigger, invalidate]);

  return null;
};

/**
 * Development helper: register window.captureReportViews(), downloadReportViews(), setCameraToTopView().
 */
export const ReportCaptureDev = () => {
  const { gl, camera, scene, invalidate } = useThree();

  useEffect(() => {
    const captureSingle = async (direction, center, distance, viewLabel = "") => {
      camera.position.set(
        center.x + direction.x * distance,
        center.y + direction.y * distance,
        center.z + direction.z * distance
      );
      camera.lookAt(center.x, center.y, center.z);
      camera.updateProjectionMatrix();
      console.log("[captureSingle]", viewLabel, "pos:", camera.position.clone(), "lookAt:", center.x, center.y, center.z);
      invalidate();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    };

    const captureReportViews = async () => {
      try {
        const originalPos = camera.position.clone();
        const bbox = computeSceneBoundingBox(scene);
        if (!bbox) {
          console.warn(
            "[captureReportViews] computeSceneBoundingBox returned null/undefined — scene may be empty; captures may be blank."
          );
        }
        const center = bbox ? bbox.center : new THREE.Vector3(0, 0, 0);
        const fovDeg = typeof camera.fov === "number" ? camera.fov : 13;
        const computedDistance = bbox ? distanceForFov(bbox.size, fovDeg) : DEFAULT_DISTANCE;
        const distance = Math.max(computedDistance, DEFAULT_DISTANCE);
        console.log("[captureReportViews] bbox center:", center, "distance:", distance, "bbox.size:", bbox?.size);
        const dir = (x, y, z) => {
          const v = new THREE.Vector3(x, y, z);
          v.normalize();
          return v;
        };
        const images = {};
        images.iso = await captureSingle(dir(1, 1, 1), center, distance, "iso");
        images.front = await captureSingle(dir(0, 0, 1), center, distance, "front");
        images.side = await captureSingle(dir(1, 0, 0), center, distance, "side");
        images.top = await captureSingle(dir(0, 1, 0), center, distance, "top");
        camera.position.copy(originalPos);
        camera.lookAt(center.x, center.y, center.z);
        camera.updateProjectionMatrix();
        console.log("[captureReportViews] captured views:", Object.keys(images));
        return images;
      } catch (e) {
        console.error("[captureReportViews] error capturing views", e);
        return {};
      }
    };

    const filenameMap = { iso: "3d.png", "3d": "3d.png", front: "front.png", side: "side.png", top: "top.png" };
    const downloadReportViews = async () => {
      const images = await captureReportViews();
      if (!images || Object.keys(images).length === 0) {
        console.warn("[downloadReportViews] no images captured");
        return;
      }
      Object.entries(images).forEach(([key, dataUrl]) => {
        if (!dataUrl) return;
        const filename = filenameMap[key] || `${key}.png`;
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      console.log("[downloadReportViews] downloaded:", Object.keys(images));
    };

    const setCameraToTopView = () => {
      const bbox = computeSceneBoundingBox(scene);
      const center = bbox ? bbox.center : new THREE.Vector3(0, 0, 0);
      const fovDeg = typeof camera.fov === "number" ? camera.fov : 13;
      const computedDistance = bbox ? distanceForFov(bbox.size, fovDeg) : DEFAULT_DISTANCE;
      const distance = Math.max(computedDistance, DEFAULT_DISTANCE);
      const dir = new THREE.Vector3(0, 1, 0).normalize();
      camera.position.set(center.x + dir.x * distance, center.y + dir.y * distance, center.z + dir.z * distance);
      camera.lookAt(center.x, center.y, center.z);
      camera.updateProjectionMatrix();
      invalidate();
      console.log("[setCameraToTopView] center:", center, "distance:", distance);
    };

    window.captureReportViews = async () => captureReportViews();
    window.downloadReportViews = downloadReportViews;
    window.setCameraToTopView = setCameraToTopView;
    return () => {
      delete window.captureReportViews;
      delete window.downloadReportViews;
      delete window.setCameraToTopView;
    };
  }, [gl, camera, scene, invalidate]);

  return null;
};

export default ScreenshotCapture;
