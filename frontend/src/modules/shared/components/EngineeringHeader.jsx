import UnifiedDropdownMenu from "../utils/UnifiedDropdownMenu";
import { menuItems } from "../utils/moduleUtils";
import { useEngineeringContext } from "../context/EngineeringContext";

export const EngineeringHeader = () => {
  const {
    form,
    moduleData,
    uiContext,
    designStatus,
    projectIdFromUrl,
    moduleConfig,
    toggleInputDock,
    docks,
    toggleLogs,
    toggleOutputDock,
    navigate,
    toggleTheme,
    handleNavbarMenuClick,
    handleCreateProject,
    triggerScreenshotCapture,
  } = useEngineeringContext();

  const {
    inputs,
    setInputs,
    allSelected,
    setAllSelected,
    setDesignPrefOverrides,
    setExtraState,
    setSelectionStates,
    setSelectedItems,
    extraState,
    selectionStates,
    displaySaveInputPopup,
    saveInputFileName,
  } = form;

  const { contextData } = moduleData;
  const { setDesignPrefModalStatus, setCreateDesignReportBool } = uiContext;
  const { output, logs, cadModelPaths } = designStatus;

  return (
    <div className="sticky top-0 z-[60] h-[52px] flex flex-row justify-between items-center bg-[#d2d4d2] w-full text-sm flex-shrink-0 px-4">
      <div className="flex flex-row items-stretch h-full">
        {menuItems.map((item, index) => (
          <UnifiedDropdownMenu
            key={index}
            label={item.label}
            dropdown={item.dropdown}
            setDesignPrefModalStatus={setDesignPrefModalStatus}
            inputs={inputs}
            setInputs={setInputs}
            allSelected={allSelected}
            setAllSelected={setAllSelected}
            setDesignPrefOverrides={setDesignPrefOverrides}
            setExtraState={setExtraState}
            setSelectionStates={setSelectionStates}
            setSelectedItems={setSelectedItems}
            logs={logs}
            setCreateDesignReportBool={setCreateDesignReportBool}
            triggerScreenshotCapture={triggerScreenshotCapture}
            selectedOption={extraState.selectedOption}
            setSelectedOption={(value) =>
              setExtraState({ ...extraState, selectedOption: value })
            }
            cadModelPaths={cadModelPaths}
            contextData={contextData}
            selectionStates={selectionStates}
            hasOutput={!!output}
            onMenuClick={handleNavbarMenuClick}
            onCreateProject={handleCreateProject}
            isExistingProject={!!projectIdFromUrl}
            moduleConfig={moduleConfig}
            extraState={extraState}
          />
        ))}

        {displaySaveInputPopup && (
          <span id="save-input-style" className="self-center ml-4">
            <strong>Saved input file as &quot;{saveInputFileName}&quot;</strong>
          </span>
        )}
      </div>

      <div className="flex flex-row justify-center items-center gap-2 text-black dark:text-white pr-4">
        <button
          onClick={toggleInputDock}
          className="w-10 h-10 flex items-center justify-center rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white hidden xl:flex"
          title={`${docks.input ? 'Hide' : 'Show'} input dock`}
          type="button"
        >
          <svg viewBox="0 0 100 100" className="w-5 h-5">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="6" />
            <line x1="40" y1="10" x2="40" y2="90" stroke="currentColor" strokeWidth="6" />
            {docks.input && (
              <rect x="10" y="10" width="30" height="80" fill="currentColor" />
            )}
          </svg>
        </button>

        <button
          onClick={toggleLogs}
          disabled={!output && (!logs || logs.length === 0)}
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors hidden xl:flex ${(output || (logs && logs.length > 0))
            ? 'hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white'
            : 'opacity-40 cursor-not-allowed'
            }`}
          title={(output || (logs && logs.length > 0))
            ? `${docks.logs ? 'Hide' : 'Show'} logs`
            : 'Run a design to view logs'}
          type="button"
        >
          <svg
            viewBox="0 0 100 100"
            className="w-5 h-5"
            fill="none"
          >
            <rect
              x="10"
              y="10"
              width="80"
              height="80"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
            />
            <line
              x1="10"
              y1="60"
              x2="90"
              y2="60"
              stroke="currentColor"
              strokeWidth="6"
            />
            {docks.logs && (
              <rect
                x="10"
                y="60"
                width="80"
                height="30"
                fill="currentColor"
                stroke="none"
              />
            )}
          </svg>
        </button>

        <button
          onClick={toggleOutputDock}
          disabled={!output}
          title={output ? `${docks.output ? 'Hide' : 'Show'} output dock` : 'Run a design to view outputs'}
          type="button"
          className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors hidden xl:flex ${output
            ? 'hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white'
            : 'opacity-40 cursor-not-allowed'
            }`}
        >
          <svg viewBox="0 0 100 100" className="w-5 h-5">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="6" />
            <line x1="60" y1="10" x2="60" y2="90" stroke="currentColor" strokeWidth="6" />
            {docks.output && (
              <rect x="60" y="10" width="30" height="80" fill="currentColor" />
            )}
          </svg>
        </button>

        <button
          onClick={() => navigate('/home')}
          title="Home"
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>

        <button
          onClick={toggleTheme}
          disabled
          title="Dark mode is under development"
          className="w-10 h-10 flex items-center justify-center rounded-md transition-colors text-black dark:text-white opacity-40 cursor-not-allowed flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
