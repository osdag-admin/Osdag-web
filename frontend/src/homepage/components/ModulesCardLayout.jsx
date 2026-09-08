import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MODULE_SUBMODULES,
  CONNECTIONS_TAB_CONTENT,
  GENERIC_SUBMODULE_CONTENT,
  MODULE_ROUTES,
} from "../../constants/modules";

import SectionCards from "./SectionCards";
import { toast } from "react-toastify";

const TabbedModulePage = () => {
  const moduleName = window.location.pathname.split("/")[1] || "";
  const navigate = useNavigate();

  const submodules = useMemo(() => MODULE_SUBMODULES[moduleName] || [], [moduleName]);
  const [activeSubmodule, setActiveSubmodule] = useState(submodules[0]?.key);
  const [activeSubSubmodule, setActiveSubSubmodule] = useState("");
  const submoduleTabRefs = useRef({});

  // Update activeSubmodule when moduleName or submodules change
  useEffect(() => {
    setActiveSubmodule(submodules[0]?.key);
  }, [moduleName, submodules]);

  // Derive content based on activeSubmodule
  const content = useMemo(() => {
    return moduleName === "Connections"
      ? CONNECTIONS_TAB_CONTENT[activeSubmodule] || []
      : GENERIC_SUBMODULE_CONTENT[activeSubmodule] || [];
  }, [moduleName, activeSubmodule]);

  // Sync activeSubSubmodule to first section label when activeSubmodule or content changes
  useEffect(() => {
    const firstLabel = content[0]?.label || "";
    setActiveSubSubmodule(firstLabel);
  }, [activeSubmodule, content]);

  const handleModuleClick = (optionKey) => {
    const route = MODULE_ROUTES[optionKey] || "";

    if (route) {
      navigate(route);
    } else {
      let optionLabel = "";
      const allContents = [
        ...Object.values(CONNECTIONS_TAB_CONTENT).flat(),
        ...Object.values(GENERIC_SUBMODULE_CONTENT).flat(),
      ];
      for (const section of allContents) {
        const option = section.options?.find((o) => o.key === optionKey);
        if (option) {
          optionLabel = option.label;
          break;
        }
      }
      const labelToShow = optionLabel || optionKey;
      toast.info(`${labelToShow} module is under development.`);
    }
  };

  const toDomId = (value) =>
    String(value || "default")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");

  const isEditableTarget = (target) => {
    if (!target) return false;
    const tag = target.tagName?.toLowerCase();
    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      target.isContentEditable
    );
  };

  const handleSubmoduleKeyDown = (event, index) => {
    if (!submodules.length) return;
    const isPrev = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const isNext = event.key === "ArrowRight" || event.key === "ArrowDown";
    if (!isPrev && !isNext) return;

    const delta = isNext ? 1 : -1;
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= submodules.length) return;
    event.preventDefault();
    const next = submodules[nextIndex];
    if (!next) return;

    setActiveSubmodule(next.key);
    requestAnimationFrame(() => {
      submoduleTabRefs.current[next.key]?.focus();
    });
  };



  const handleWrapperKeyDown = (event) => {
    if (isEditableTarget(event.target)) return;
    const isPrev = event.key === "[" || event.code === "BracketLeft";
    const isNext = event.key === "]" || event.code === "BracketRight";
    if (!isPrev && !isNext) return;
    const delta = isNext ? 1 : -1;
    if (!submodules.length) return;
    const currentSubmoduleIndex = submodules.findIndex(({ key }) => key === activeSubmodule);
    const fallbackSubmoduleIndex = currentSubmoduleIndex === -1 ? 0 : currentSubmoduleIndex;
    const nextSubmoduleIndex = fallbackSubmoduleIndex + delta;
    if (nextSubmoduleIndex < 0 || nextSubmoduleIndex >= submodules.length) return;
    event.preventDefault();
    const nextSubmodule = submodules[nextSubmoduleIndex];
    if (!nextSubmodule) return;

    setActiveSubmodule(nextSubmodule.key);
    requestAnimationFrame(() => {
      submoduleTabRefs.current[nextSubmodule.key]?.focus();
    });
  };

  if (!moduleName || !MODULE_SUBMODULES[moduleName]) {
    return <div className="p-8">Module not found</div>;
  }

  // Filter content to show only the section matching activeSubSubmodule
  const filteredContent = content.filter((section) => section.label === activeSubSubmodule);

  return (
    <div className="w-full p-4 sm:p-8 dark:text-gray-300" onKeyDown={handleWrapperKeyDown}>
      {/* Submodules Tabs */}
      <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row mb-8 gap-2" role="tablist" aria-label="Submodules">
        {submodules.map(({ key, label, status }, index) => {
          const isDisabled = status === "development";

          return (
            <button
              key={key}
              onClick={() => !isDisabled && setActiveSubmodule(key)}
              onFocus={() => !isDisabled && setActiveSubmodule(key)}
              onKeyDown={(event) => handleSubmoduleKeyDown(event, index)}
              ref={(element) => {
                submoduleTabRefs.current[key] = element;
              }}
              role="tab"
              aria-selected={activeSubmodule === key}
              aria-controls={`submodule-panel-${toDomId(key)}`}
              id={`submodule-tab-${toDomId(key)}`}
              tabIndex={isDisabled ? -1 : activeSubmodule === key ? 0 : -1}
              disabled={isDisabled}
              className={`flex-shrink-0 flex-1 py-2 sm:py-3 text-base sm:text-lg font-semibold border rounded-md transition-colors duration-150
                ${
                  isDisabled
                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    : activeSubmodule === key
                    ? "bg-osdag-green text-white border-osdag-green"
                    : "text-black border-gray-300 hover:bg-osdag-light-green/20"
                }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Sub-SubModules Tabs */}
      {activeSubmodule === "Moment" && (
        <div className="flex flex-row mb-8 gap-3">
          {content.map(({ label, status }) => (
            <button
              key={label}
              onClick={() => status !== "development" && setActiveSubSubmodule(label)}
              disabled={status === "development"}
              className={`flex-1 py-2 sm:py-3 text-base sm:text-lg font-semibold border rounded-md transition-colors duration-150
              ${
                status === "development"
                ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                : activeSubSubmodule === label
                ? "bg-osdag-green text-white border-osdag-green"
                : "text-black border-gray-300 hover:bg-osdag-light-green/20"
                }`}
            >
              {label}
            </button>
          ))}
          </div>
      )}
      {/* Section Cards */}
      <div
        className="flex flex-col sm:flex-col md:flex-row lg:flex-row flex-wrap gap-4 justify-center md:justify-start"
        role="region"
        id={`submodule-panel-${toDomId(activeSubmodule)}`}
        aria-labelledby={activeSubmodule ? `submodule-tab-${toDomId(activeSubmodule)}` : undefined}
      >
        {filteredContent.map((section) => (
          <SectionCards key={section.label} section={section} onModuleClick={handleModuleClick} />
        ))}
      </div>

    </div>
  );
};

export default TabbedModulePage;
