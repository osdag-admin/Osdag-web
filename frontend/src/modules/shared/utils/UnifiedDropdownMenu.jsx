/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { useEngineeringService } from "../hooks/useEngineeringService";
import { MODULE_KEY_FIN_PLATE } from '../../../constants/DesignKeys';
import { message } from 'antd';
import { apiBase } from "../../../api"; // eslint-disable-line no-unused-vars
import { openOsiFile } from "../../../datasources/osiDataSource";
import { loadStateFromOsi } from "./osiLoader";
import { downloadSectionCatalog } from "../../../datasources/sectionsDataSource";
import { getModuleConfig } from "./moduleConfig";
import { expandAllSelectedInputs } from "./osiInputSerializer";
import { buildLogFileContent } from "./logExport";
import {
  downloadCachedModelByFormat,
  downloadExportCadResponse,
} from "./cadExport";
import { canOpenAdditionalInputs } from "./designPrefOpenGuard";
import { isGuestUser } from "../../../utils/auth";

function UnifiedDropdownMenu({
  label,
  dropdown,
  setDesignPrefModalStatus,
  inputs,
  allSelected,
  setInputs,
  setAllSelected = () => { },
  setDesignPrefOverrides = () => { },
  setExtraState = () => { },
  setSelectionStates = () => { },
  setSelectedItems = () => { },
  logs,
  triggerScreenshotCapture,
  selectedOption = null,
  boltDiameterList = [],
  propertyClassList = [],
  thicknessList = [],
  angleList = [],
  topAngleList = [],
  cadModelPaths = null,
  contextData = null,
  selectionStates = {},
  onMenuClick,
  onCreateProject = null,
  isExistingProject = false,
  hasOutput = false,
  moduleConfig = null,
  extraState = {},
  setCreateDesignReportBool = null,
}) {
  const service = useEngineeringService();

  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const parentRef = useRef(null);

  const getLocalModuleConfig = () => {
    const moduleName = inputs?.module;
    return getModuleConfig(moduleName);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) setOpenSubmenu(null);
  };

  const loadInput = () => {
    let element = document.createElement("input");

    element.setAttribute("type", "file");
    element.accept = ".osi";
    element.style.display = "none";
    parentRef.current.appendChild(element);
    element.click();

    element.addEventListener("change", async (e) => {
      const file = e.target.files[0];

      if (!file) {
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
          loadStateFromOsi(data.inputs || {}, {
            setInputs,
            setDesignPrefOverrides,
            setExtraState,
            setSelectionStates,
            setAllSelected,
            setSelectedItems,
            moduleConfig,
            safeModuleData: contextData || {},
          });
          message.success('Input loaded from OSI');
        } else {
          message.error(data.error || 'Failed to open OSI file');
        }
      } catch (err) {
        console.error('Error loading OSI file:', err);
        message.error('Failed to open OSI file');
      } finally {
        if (parentRef.current && element && parentRef.current.contains(element)) {
          parentRef.current.removeChild(element);
        }
      }
    });
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

    const module_id = inputs?.module || MODULE_KEY_FIN_PLATE;
    const projectName = inputs?.project_name || inputs?.name || 'project';

    try {
      const result = await service.saveOSIFromInputs(projectName, module_id, inputsForSave, true);

      if (result.success && result.content_base64) {
        try {
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
      case "Create Project":
        if (isExistingProject) {
          message.info("This project is already saved. To create a new project, start a new design.");
          setIsOpen(false);
          return;
        }
        if (onCreateProject) {
          onCreateProject();
        }
        break;
      case "Create Design Report":
      case "Save Design Report":
        if (setCreateDesignReportBool) {
          setCreateDesignReportBool(true);
        } else if (onMenuClick) {
          onMenuClick(option.name);
        }
        break;
      case "Load Input":
        loadInput();
        break;

      case "Download Osi":
      case "Download Inputs OSI":
      case "Save Inputs (.osi)":
      case "Download Inputs CSV":
      case "Save Inputs (.csv)":
      case "Download Outputs CSV":
      case "Save Outputs (.csv)":
        if (onMenuClick) {
          onMenuClick(option.name);
        } else if (option.name === "Download Osi" || option.name === "Save Inputs (.osi)" || option.name === "Download Inputs OSI") {
          saveInput();
        }
        break;
      case "Save Log Messages":
        saveLogMessages();
        break;
      case "Save 3D Model":
        console.log("[DEBUG UnifiedDropdownMenu] Clicked Save 3D Model", { hasOutput, onMenuClick: !!onMenuClick });
        if (onMenuClick) {
          onMenuClick(option.name);
        }
        break;
      case "Export BREP":
      case "Export STL":
      case "Export STEP":
      case "Export IGS":
      case "Export IFC":
        console.log("[DEBUG UnifiedDropdownMenu] Clicked Export CAD format", option.name);
        if (onMenuClick) {
          onMenuClick(option.name);
        }
        break;
      case "Save Cad Image":
        console.log("[DEBUG UnifiedDropdownMenu] Clicked Save Cad Image");
        triggerScreenshotCapture();
        break;
      case "Quit":
        window.location.href = '/home';
        break;
      case "Design Preferences": {
        const mod = getLocalModuleConfig();
        const guard = canOpenAdditionalInputs(
          mod,
          inputs,
          { selectedOption },
          contextData,
          selectionStates
        );
        if (!guard.ok) {
          message.warning(guard.message);
          setIsOpen(false);
          return;
        }
        setDesignPrefModalStatus(true);
        break;
      }
      case "Zoom In":
        document.dispatchEvent(new CustomEvent('cad-camera-action', { detail: 'zoom-in' }));
        break;
      case "Zoom Out":
        document.dispatchEvent(new CustomEvent('cad-camera-action', { detail: 'zoom-out' }));
        break;
      case "Pan":
        document.dispatchEvent(new CustomEvent('cad-camera-action', { detail: 'pan-left' }));
        break;
      case "Rotate 3D Model":
        document.dispatchEvent(new CustomEvent('cad-camera-action', { detail: 'auto-rotate' }));
        break;
      case "Show Front View":
        document.dispatchEvent(new CustomEvent('cad-camera-action', { detail: 'front-view' }));
        break;
      case "Show Top View":
        document.dispatchEvent(new CustomEvent('cad-camera-action', { detail: 'top-view' }));
        break;
      case "Show Side View":
        document.dispatchEvent(new CustomEvent('cad-camera-action', { detail: 'side-view' }));
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

  const handleDatabaseTemplateDownload = async (label) => {
    const tableMap = {
      Column: "Columns",
      Beam: "Beams",
      Angle: "Angles",
      Channel: "Channels",
    };
    const table = tableMap[label];
    if (!table) return;
    try {
      await downloadSectionCatalog(table);
      message.success(`${label} database downloaded.`);
      setOpenSubmenu(null);
      setIsOpen(false);
    } catch (err) {
      message.error(err?.message || `Failed to download ${label} template.`);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (parentRef.current && !parentRef.current.contains(event.target)) {
        setIsOpen(false);
        setOpenSubmenu(null);
      }
    };

    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative flex justify-center items-stretch hover:bg-[#91b014] hover:text-white h-full" ref={parentRef}>
      <div
        className="font-medium cursor-pointer px-4 flex items-center h-full select-none"
        onClick={handleToggle}
      >
        {label}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 bg-white border border-[#ccc] border-t-0 min-w-52 z-[1]">
          {dropdown.map((option, index) => {
            const isGuest = isGuestUser();
            const isCreateProject = option.name === "Create Project";
            const isDesignReport = option.name === "Create Design Report" || option.name === "Save Design Report";
            const isSave3dModel = option.name === "Save 3D Model";
            const isSaveCadImage = option.name === "Save Cad Image";
            const isPlateGirder =
              moduleConfig?.designType === "Plate-Girder" ||
              moduleConfig?.sessionName === "Plate Girder Design" ||
              moduleConfig?.routePath?.includes("plate_girder") ||
              inputs?.module === "Plate-Girder";
            const isOptimizationGraph = option.name === "Show Optimization Graph";
            const isSaveOutputsCsv = option.name === "Download Outputs CSV" || option.name === "Save Outputs (.csv)";

            const isDisabled =
              (isCreateProject && (isGuest || isExistingProject || !hasOutput)) ||
              (isDesignReport && !hasOutput) ||
              ((isSave3dModel || isSaveCadImage) && !hasOutput) ||
              (isSaveOutputsCsv && !hasOutput) ||
              (isOptimizationGraph && !isPlateGirder);

            const getTooltipTitle = () => {
              if (isCreateProject) {
                if (isGuest) return "Only for authenticated users. Please log in to create projects.";
                if (isExistingProject) return "This project is already created/saved.";
                if (!hasOutput) return "Run design calculation first before creating a project.";
              }
              if (isDesignReport && !hasOutput) {
                return "Run design calculation first before generating a report.";
              }
              if ((isSave3dModel || isSaveCadImage) && !hasOutput) {
                return "Run design calculation first to enable CAD export.";
              }
              if (isSaveOutputsCsv && !hasOutput) {
                return "Run design calculation first before exporting outputs CSV.";
              }
              if (isOptimizationGraph && !isPlateGirder) {
                return "Optimization graph is only available for Plate Girder module.";
              }
              return undefined;
            };
            const itemTitle = getTooltipTitle();

            const hasSubmenu = Array.isArray(option.options) && option.options.length > 0;
            const isSubmenuOpen = openSubmenu === option.name;
            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => hasSubmenu && setOpenSubmenu(option.name)}
                onMouseLeave={() => hasSubmenu && setOpenSubmenu((prev) => (prev === option.name ? null : prev))}
              >
                <div
                  title={itemTitle}
                  className={`flex w-full justify-between text-sm p-1 ${isDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black hover:text-white hover:bg-osdag-green cursor-pointer"
                    }`}
                  onClick={() => {
                    if (isDisabled) {
                      if (isCreateProject && isGuest) {
                        message.warning("Guest users cannot create projects. Please log in to create projects.");
                      } else if ((isSave3dModel || isSaveCadImage) && !hasOutput) {
                        message.warning("Run design calculation first to enable CAD export.");
                      } else if (isDesignReport && !hasOutput) {
                        message.warning("Run design calculation first before generating a report.");
                      }
                      return;
                    }
                    if (hasSubmenu) {
                      setOpenSubmenu((prev) => (prev === option.name ? null : option.name));
                      return;
                    }
                    handleClick(option);
                  }}
                >
                  {option.name}
                  <span className="flex items-center gap-2">
                    {option.shortcut && (
                      <span className="shortcut">{option.shortcut}</span>
                    )}
                    {hasSubmenu && <span aria-hidden="true">›</span>}
                  </span>
                </div>
                {hasSubmenu && isSubmenuOpen && (
                  <div className="absolute top-0 left-full ml-[1px] bg-white border border-[#ccc] min-w-26 z-[2]">
                    {option.options.map((subOption) => (
                      <div
                        key={`${option.name}-${subOption}`}
                        className="flex w-full justify-between text-sm px-3 py-1 text-black hover:text-white hover:bg-osdag-green cursor-pointer"
                        onClick={() => {
                          if (option.name === "Download Database") {
                            handleDatabaseTemplateDownload(subOption);
                            return;
                          }
                          handleClick({ name: subOption });
                          setOpenSubmenu(null);
                          setIsOpen(false);
                        }}
                      >
                        <span>{subOption}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>

  );
}

export default UnifiedDropdownMenu;
