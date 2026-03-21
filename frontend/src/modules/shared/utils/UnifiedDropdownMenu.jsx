/* eslint-disable react/prop-types */
import React, { useRef, useState, useEffect } from "react";
import { useEngineeringService } from "../hooks/useEngineeringService";
import { MODULE_KEY_FIN_PLATE } from '../../../constants/DesignKeys';
import { message } from 'antd';
import { apiBase } from "../../../api";
import { openOsiFile } from "../../../datasources/osiDataSource";
import { getModuleConfig } from "./moduleConfig";
import { expandAllSelectedInputs, buildOsiContent } from "./osiInputSerializer";
import { buildLogFileContent } from "./logExport";
import { downloadCadSectionsAsStl } from "./cadExport";

function UnifiedDropdownMenu({
  label,
  dropdown,
  setDesignPrefModalStatus,
  inputs,
  allSelected,
  setInputs,
  setAllSelected = () => { },
  logs,
  setCreateDesignReportBool,
  setSaveInputFileName,
  triggerScreenshotCapture,
  selectedOption = null,
  setSelectedOption = () => { },
  boltDiameterList = [],
  propertyClassList = [],
  thicknessList = [],
  angleList = [],
  topAngleList = [],
  cadModelPaths = null,
  contextData = null, // moduleData from hook; used for expandAllSelectedInputs
  onMenuClick,
}) {
  const service = useEngineeringService();
  const BASE_URL = `${apiBase}`;


  const [isOpen, setIsOpen] = useState(false);
  const parentRef = useRef(null);

  const getModuleConfig = () => {
    const moduleName = inputs?.module;
    return getModuleConfig(moduleName);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const loadInput = () => {
    let element = document.createElement("input");
    element.setAttribute("type", "file");
    element.accept = ".osi,application/json";
    element.style.display = "none";
    parentRef.current.appendChild(element);
    element.click();

    element.addEventListener("change", async (e) => {
      const file = e.target.files[0];

      // Handle user cancellation
      if (!file) {
        // User cancelled file selection - silently return (expected behavior)
        if (parentRef.current && element && parentRef.current.contains(element)) {
          parentRef.current.removeChild(element);
        }
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        const data = await openOsiFile(formData);
        if (data.ok && data.success) {
          // data.inputs follows the backend schema — pass through
          setInputs(data.inputs || {});
          // reset flags conservatively
          setAllSelected({});
          message.success('Input loaded from OSI');
        } else {
          message.error(data.error || 'Failed to open OSI file');
        }
      } catch (err) {
        console.error('Error loading OSI file:', err);
        message.error('Failed to open OSI file');
      } finally {
        // Ensure we remove the temporary input element after handling the file
        if (parentRef.current && element && parentRef.current.contains(element)) {
          parentRef.current.removeChild(element);
        }
      }
    });
  };

  const buildContentString = () => {
    return buildOsiContent({
      inputs,
      allSelected,
      boltDiameterList,
      propertyClassList,
      thicknessList,
      angleList,
      topAngleList,
      selectedOption,
    });
  };

  const downloadInput = () => {
    const content = buildContentString();
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", "input_osdag.osi");
    element.style.display = "none";
    parentRef.current.appendChild(element);
    element.click();
    parentRef.current.removeChild(element);
  };

  const getContextData = () =>
    contextData || {
      boltDiameterList,
      propertyClassList,
      thicknessList,
      angleList,
      topAngleList: topAngleList || angleList,
    };

  const saveInput = async () => {
    if (!inputs || typeof inputs !== 'object') {
      message.error('No inputs to save');
      return;
    }
    const inputsForSave = expandAllSelectedInputs(inputs, allSelected, getContextData());

    // Determine module_id and projectName with defaults
    const module_id = inputs?.module || MODULE_KEY_FIN_PLATE;
    const projectName = inputs?.project_name || inputs?.name || 'project';

    try {
      // Call service to generate OSI file (inline=false for local download, no auth required)
      const result = await service.saveOSIFromInputs(projectName, module_id, inputsForSave, false);

      if (result.success && result.content_base64) {
        try {
          // Convert base64 to blob and download
          const binaryString = atob(result.content_base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
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
          setIsOpen(false);
        } catch (err) {
          console.error('Error downloading OSI file:', err);
          message.error('Failed to download OSI file');
        }
      } else {
        message.error(result.error || 'Failed to save OSI');
      }
    } catch (err) {
      console.error('Error saving inputs:', err);
      message.error('Failed to save OSI');
    }
  };

  const saveLogMessages = () => {
    const content = buildLogFileContent(logs);
    if (!content) {
      message.warning("No logs to save.");
      return;
    }
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", "logs_osdag.txt");
    element.style.display = "none";
    parentRef.current.appendChild(element);
    element.click();
    parentRef.current.removeChild(element);
    message.success('Log file downloaded successfully');
  };

  const handleClick = (option) => {
    switch (option.name) {
      case "Load Input":
        loadInput();
        break;
      // case "Download Input":
      //   downloadInput();
      //   break;
      case "Save Input":
        saveInput();
        break;
      case "Save Log Messages":
        saveLogMessages();
        break;
      // case "Create Design Report":
      //   setCreateDesignReportBool(true);
      //   break;
      case "Save 3D Model":
        (async () => {
          await downloadCadSectionsAsStl(cadModelPaths, message);
        })();
        break;
      case "Save Cad Image":
        triggerScreenshotCapture();
        break;
      case "Design Preferences":
        setDesignPrefModalStatus(true);
        break;
      default:
        if (onMenuClick) {
          onMenuClick(option.name);
        } else {
          // Default value - ensure inputs is an object before spreading
          setInputs({
            ...(inputs || {}),
            graphicsOption: option.name,
          });
        }
        break;
    }
  };

  // UTILITY FUNCTIONS
  const formatArrayForText = (arr) => {
    if (!arr || arr.length === 0) return "";
    let text = "";
    for (let i = 0; i < arr.length; i++) {
      if (i !== arr.length - 1) text += `- '${arr[i]}'\n`;
      else text += `- '${arr[i]}'`;
    }
    return text;
  };

  const getFormatedArrayFields = (arr, index) => {
    let res = [];
    for (let i = index + 1; i < arr.length; i++) {
      const line = arr[i].trim();
      if (!line.startsWith("-")) break;

      const match = line.match(/'([^']+)'/);
      if (match) {
        res.push(match[1]);
      }
    }
    return res;
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (parentRef.current && !parentRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative flex justify-center items-center hover:bg-[#91b014] hover:text-white p-1" ref={parentRef}>
      <div
        className="font-medium  cursor-pointer"
        onClick={handleToggle}
      >
        {label}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 bg-white border border-[#ccc] border-t-0 min-w-[350px] z-[1]">
          {dropdown.map((option, index) => (
            <div
              className="flex w-full justify-between text-sm text-black hover:text-white hover:bg-osdag-green cursor-pointer p-1"
              key={index}
              onClick={() => handleClick(option)}
            >
              {option.name}
              {option.shortcut && (
                <span className="shortcut">{option.shortcut}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

  );
}

export default UnifiedDropdownMenu;
