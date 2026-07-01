import { BaseInputDock } from "./BaseInputDock";
import { BaseOutputDock } from "./BaseOutputDock";
import { CadViewer } from "./CadViewer";
import FloatingNavBar from "./FloatingNavBar";
import Logs from "./Logs";
import { DESIGN_STATUS } from "../hooks/useDesignSubmission";
import { UI_STRINGS } from "../../../constants/UIStrings";
import { useEngineeringContext } from "../context/EngineeringContext";
import OptimizationGraph from "./OptimizationGraph";

export const EngineeringLayout = () => {
  const {
    form,
    moduleData,
    uiContext,
    designStatus,
    actions,
    isMobile,
    toggleInputDock,
    toggleOutputDock,
    setDocks,
    title,
    isInputLocked,
    lockBtnRef,
    lockZoom,
    setLockZoom,
    showUnlockWarning,
    confirmUnlock,
    cancelUnlock,
    handleSaveInputs,
    handleSubmitEnhanced,
    isGuest,
    handleLockToggle,
    showOptionsContainer,
    options,
    selectedSection,
    setSelectedSection,
    setSelectedCameraView,
    selectedCameraView,
    isRedesigning,
    cameraPos,
    normalizedCadModelPaths,
    cameraSettings,
    getConnectivity,
    hoverDict,
    handleHoverLabel,
    handleHoverEnd,
    moduleConfig,
    docks,
    outputConfig,
    hoverText,
    hoverPos,
    showOptimizationGraph,
    setShowOptimizationGraph,
    optimizationPlotData,
    optimizationDone,
  } = useEngineeringContext();

  const {
    inputs,
    setInputs,
    selectionStates,
    updateSelectionState,
    toggleAllSelected,
    updateSelectedItems,
    setModalDynamicSrc,
  } = form;

  const { contextData, loadingOptions } = moduleData;

  const {
    updateModalState,
    setDesignPrefModalStatus,
  } = uiContext;

  const {
    output,
    logs,
    loading,
    status,
    renderBoolean,
    modelKey,
    screenshotTrigger,
    setScreenshotTrigger,
    cadModelPaths,
  } = designStatus;

  const {
    refetchModuleOptions,
    saveOutput,
    handleCreateDesignReport,
  } = actions;

  return (
    <div className="relative flex flex-row flex-1 overflow-hidden w-full">
      {!docks.input && !isMobile && (
        <button
          onClick={toggleInputDock}
          className="hidden xl:flex absolute left-0 top-0 h-full w-10 bg-white dark:bg-osdag-dark-color border-r border-gray-300 dark:border-osdag-border items-center justify-center z-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          title="Open Input Dock"
          type="button"
        />
      )}

      {!docks.output && output && !isMobile && (
        <button
          onClick={toggleOutputDock}
          className="hidden xl:flex absolute right-0 top-0 h-full w-10 bg-white dark:bg-osdag-dark-color border-l border-gray-300 dark:border-gray-700 items-center justify-center z-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          title="Open Output Dock"
          type="button"
        />
      )}

      {docks.input ? (
        <BaseInputDock
          moduleConfig={moduleConfig}
          inputs={inputs}
          setInputs={setInputs}
          isInputLocked={isInputLocked}
          lockBtnRef={lockBtnRef}
          lockZoom={lockZoom}
          setLockZoom={setLockZoom}
          showUnlockWarning={showUnlockWarning}
          confirmUnlock={confirmUnlock}
          cancelUnlock={cancelUnlock}
          handleSaveInputs={handleSaveInputs}
          handleSubmitEnhanced={handleSubmitEnhanced}
          isGuest={isGuest}
          setDesignPrefModalStatus={setDesignPrefModalStatus}
          handleLockToggle={handleLockToggle}
          selectionStates={selectionStates}
          updateSelectionState={updateSelectionState}
          updateModalState={updateModalState}
          toggleAllSelected={toggleAllSelected}
          contextData={contextData}
          extraState={form.extraState}
          setExtraState={form.setExtraState}
          updateSelectedItems={updateSelectedItems}
          setModalDynamicSrc={setModalDynamicSrc}
          onRefetchModuleOptions={refetchModuleOptions}
          isOpen={docks.input}
          loadingOptions={loadingOptions}
        />
      ) : (
        <div className="fixed left-0 top-[50%] -translate-y-1/2 h-fit w-[40px] hidden xl:flex flex-col items-center justify-center font-bold z-[1000]">
          <div className="relative flex flex-col items-center w-[30px] py-[10px] gap-[14px]">
            <span className="inline-block rotate-[270deg]"><b>T</b></span>
            <span className="inline-block rotate-[270deg]"><b>U</b></span>
            <span className="inline-block rotate-[270deg]"><b>P</b></span>
            <span className="inline-block rotate-[270deg]"><b>N</b></span>
            <span className="inline-block rotate-[270deg]"><b>I</b></span>
          </div>
        </div>
      )}

      <FloatingNavBar />

      <div
        className={`absolute top-0 h-screen w-[40px] z-[1000] hidden xl:block ${docks.input ? "left-[400px]" : "left-[30px]"
          }`}
      >
        <div className="absolute left-0 top-0 w-[8px] h-full bg-[#84bd00]">
          <div
            onClick={toggleInputDock}
            className="
              absolute right-0 top-[50%]
              -translate-y-1/2
              w-[8px] h-[80px]
              bg-[#6a8f00]
              flex items-center justify-center
              cursor-pointer
            "
          >
            <span className="text-white text-[14px]">
              {docks.input ? "❮" : "❯"}
            </span>
          </div>
        </div>
      </div>

      <div className={`
        flex-1 flex flex-col relative min-w-0
        ${isMobile && (docks.input || docks.output) ? 'hidden' : 'flex'}
        ${!isMobile && !(docks.output && outputConfig && status.step !== DESIGN_STATUS.ERROR) ? 'xl:pr-[40px]' : ''}
      `}>
        {showOptionsContainer && output && (isMobile ? docks.cad : true) && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40 max-w-[95%] w-fit overflow-x-auto overflow-y-hidden flex flex-row items-center gap-2 p-1 bg-white/90 dark:bg-osdag-dark-color/90 rounded-md border border-gray-200 dark:border-gray-700 shadow-md">
            <div className="flex flex-row items-center gap-2 whitespace-nowrap">
              {options.map((option) => {
                const isChecked = selectedSection.includes(option);
                const isModel = option === "Model";
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-xs font-medium text-black dark:text-white`}
                  >
                    <div
                      className={`
                        rounded-md p-[2px] transition-colors
                        ${isChecked
                          ? "bg-osdag-green/20 dark:bg-osdag-dark-green/30"
                          : "bg-transparent"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-gray-400 text-osdag-green focus:ring-osdag-green"
                        checked={isChecked}
                        onChange={(event) => {
                          if (isModel) {
                            if (event.target.checked) {
                              setSelectedSection(["Model"]);
                              setSelectedCameraView("Model");
                            } else {
                              if (selectedSection.length === 1 && selectedSection[0] === "Model") {
                                  return;
                              }
                            }
                          } else {
                            if (event.target.checked) {
                              const newSelection = selectedSection.filter(s => s !== "Model");
                              if (!newSelection.includes(option)) {
                                newSelection.push(option);
                              }
                              setSelectedSection(newSelection);
                              setSelectedCameraView(newSelection[0]);
                            } else {
                              const newSelection = selectedSection.filter(s => s !== option);
                              if (newSelection.length === 0) {
                                setSelectedSection(["Model"]);
                                setSelectedCameraView("Model");
                              } else {
                                setSelectedSection(newSelection);
                                setSelectedCameraView(newSelection[0]);
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <CadViewer
          isMobile={isMobile}
          showCad={docks.cad}
          showLogs={docks.logs}
          loading={loading}
          isRedesigning={isRedesigning}
          renderBoolean={renderBoolean}
          cameraPos={cameraPos}
          normalizedCadModelPaths={normalizedCadModelPaths}
          selectedSection={selectedSection}
          modelKey={modelKey}
          cameraSettings={cameraSettings}
          getConnectivity={getConnectivity}
          hoverDict={hoverDict}
          handleHoverLabel={handleHoverLabel}
          handleHoverEnd={handleHoverEnd}
          moduleConfig={moduleConfig}
          selectedCameraView={selectedCameraView}
          screenshotTrigger={screenshotTrigger}
          setScreenshotTrigger={setScreenshotTrigger}
          showOutputDock={docks.output}
          hasOutput={!!output}
        />

        {docks.logs && (output || (logs && logs.length > 0)) && (
          <div className={`
            ${isMobile
              ? (docks.cad ? 'h-[30%]' : 'fixed inset-0 z-50 h-full pt-[52px]')
              : 'h-[40%]'
            }
            ${isMobile && !docks.cad ? 'bg-white dark:bg-osdag-dark-color' : ''}
            ${!isMobile ? (docks.input ? 'pl-0' : 'pl-[40px]') : ''}
            ${!isMobile ? (docks.output ? 'pr-0' : 'pr-[40px]') : ''}
           `}>
            <Logs logs={logs} />
          </div>
        )}
      </div>

      {docks.output && outputConfig && status.step !== DESIGN_STATUS.ERROR ? (
        <div
          className={`
            fixed inset-0 z-50 h-full pt-[52px] pb-14
            xl:relative xl:inset-auto xl:z-auto xl:h-auto xl:pt-0 xl:pb-0
            w-full xl:w-[400px]
            flex flex-col bg-white dark:bg-osdag-dark-color
          `}
        >
          <BaseOutputDock
            output={output}
            outputConfig={outputConfig}
            title={title || UI_STRINGS.OUTPUT_DOCK}
            extraState={{
              ...form.extraState,
              cadModelPaths,
              renderCadModel: renderBoolean,
              connectivity: inputs?.connectivity,
              member_designation: inputs?.member_designation,
              designation: inputs?.member_designation,
              weld_type: inputs?.weld_type
            }}
            handleCreateDesignReport={handleCreateDesignReport}
            saveOutput={saveOutput}
          />

          <div className="absolute top-0 left-0 h-full w-[40px] z-[50]">
            <div className="absolute left-0 top-0 w-[8px] h-full bg-[#84bd00]">
              <div
                onClick={() => toggleOutputDock(!!output)}
                className="
                  absolute left-0 top-[50%]
                  -translate-y-1/2
                  w-[8px] h-[80px]
                  bg-[#6a8f00]
                  flex items-center justify-center
                  cursor-pointer
                "
              >
                <span className="text-white text-[14px]">
                  ❯
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="
          fixed right-0 top-0 h-screen w-[40px]
          z-10 bg-white hidden xl:block
          ">
          <div className="absolute left-0 top-0 w-[8px] h-full bg-[#84bd00]">
            <div
              onClick={() => setDocks({ output: true })}
              className="
                absolute left-0 top-[50%]
                -translate-y-1/2
                w-[8px] h-[80px]
                bg-[#6a8f00]
                flex items-center justify-center
                cursor-pointer
              "
            >
              <span className="text-white text-[14px]">
                ❮
              </span>
            </div>
          </div>

          <div className="absolute right-[10px] top-[50%] -translate-y-1/2 flex flex-col items-center gap-[14px]">
            {"OUTPUT".split("").map((ch, i) => (
              <span key={i} className="rotate-90 font-bold">
                {ch}
              </span>
            ))}
          </div>
        </div>
      )}

      {showOptimizationGraph && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full h-full sm:w-[92vw] sm:h-[88vh] max-w-[1400px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-300">
            <OptimizationGraph
              data={optimizationPlotData}
              optimizationDone={optimizationDone}
              onClose={() => setShowOptimizationGraph(false)}
            />
          </div>
        </div>
      )}

      {hoverText && (
        <div
          style={{
            position: "fixed",
            left: hoverPos.x,
            top: hoverPos.y,
            background: "rgba(0, 0, 0, 0.75)",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: 6,
            pointerEvents: "none",
            fontSize: 12,
            zIndex: 1000,
          }}
          dangerouslySetInnerHTML={{ __html: hoverText }}
        />
      )}
    </div>
  );
};
