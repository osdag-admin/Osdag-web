/* eslint-disable react/prop-types */
import React, { useRef } from "react";
import { message } from "antd";
import { InputSection } from "./InputSection";
import { canOpenAdditionalInputs } from "../utils/designPrefOpenGuard";

export const BaseInputDock = React.memo(({
  moduleConfig,
  inputs,
  setInputs,
  isInputLocked,
  lockBtnRef: externalLockBtnRef,
  lockZoom,
  setLockZoom,
  showUnlockWarning,
  confirmUnlock,
  cancelUnlock,
  handleSaveInputs,
  handleSubmitEnhanced,
  isGuest,
  setDesignPrefModalStatus,
  handleLockToggle,
  selectionStates,
  updateSelectionState,
  updateModalState,
  toggleAllSelected,
  contextData,
  extraState,
  setExtraState,
  updateSelectedItems,
  setModalDynamicSrc,
  onRefetchModuleOptions,
  isOpen,
  loadingOptions,
}) => {
  // Use external ref if provided, otherwise create internal one
  const internalLockBtnRef = useRef(null);
  const lockBtnRef = externalLockBtnRef || internalLockBtnRef;

  const openAdditionalInputs = () => {
    const guard = canOpenAdditionalInputs(
      moduleConfig,
      inputs,
      extraState,
      contextData,
      selectionStates
    );
    if (!guard.ok) {
      message.warning(guard.message);
      return;
    }
    setDesignPrefModalStatus(true);
  };

  return (
    <div
      className={`
        flex
        fixed xl:relative inset-0 xl:inset-auto xl:left-auto xl:right-auto xl:top-auto xl:bottom-auto z-50 xl:z-auto
        w-full xl:w-[400px] h-full
        pt-[100px] xl:pt-0 pb-14 xl:pb-0
        bg-white dark:bg-osdag-dark-color
        flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-osdag-dark-color border-b border-gray-200 dark:border-gray-700 flex items-center justify-between inputRow">
        <span className="flex justify-center items-center w-32 my-2 ml-4 py-1 px-1 text-sm text-center rounded-xl font-medium bg-osdag-green text-white flex-shrink-0">
          Basic Inputs
        </span>
        <div className="flex items-center gap-2 mr-4">
          <button
            onClick={openAdditionalInputs}
            // onClick={openDesignPrefModal}
            disabled={loadingOptions}
            className={`flex items-center justify-center px-4 py-1 my-2 text-sm font-medium rounded-lg transition-colors text-white ${
              loadingOptions 
                ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                : 'bg-osdag-green hover:bg-osdag-dark-green'
            }`}
            title={isInputLocked ? 'Unlock the dock to edit additional inputs' : 'Open Additional Inputs'}
          >
            Additional Inputs
          </button>

          <button
            ref={lockBtnRef}
            onClick={handleLockToggle}
            className={`my-2 p-2 rounded-lg transition-all duration-200 ${lockZoom ? "scale-110" : "scale-100"} ${isInputLocked ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'} relative z-40`}
            title={isInputLocked ? 'Unlock input dock' : 'Lock input dock'}
            type="button"
            style={{ pointerEvents: 'auto' }}
          >
            {isInputLocked ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 5a3 3 0 016 0v3H9V7zm3 6a2 2 0 11-2 2 2 2 0 012-2z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M18 10h-1V7a5 5 0 10-10 0h2a3 3 0 116 0v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2zm-6 6a2 2 0 112-2 2 2 0 01-2 2z" />
              </svg>
            )}
          </button>

          {/* Unlock Warning Modal */}
          {showUnlockWarning && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  width: "300px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.25)",
                }}
              >
                <h2 className="text-lg font-semibold mb-4">Warning</h2>
                <p className="mb-6">
                  The current designs will be lost.
                  You can save them by clicking on <strong>Save Input</strong>.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelUnlock}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmUnlock}
                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    Unlock
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Input Sections */}
      <div className="flex-1 overflow-y-auto subMainBody scroll-data dark:bg-osdag-dark-color bg-white relative">
        {loadingOptions && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/70 dark:bg-osdag-dark-color/70 backdrop-blur-sm">
            <div className="w-8 h-8 border-4 border-osdag-green border-t-transparent rounded-full animate-spin"></div>
            <span className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Loading Module...</span>
          </div>
        )}

        {/* Lock overlay */}
        {isInputLocked && (
          <div
            className="absolute inset-0 z-20 cursor-not-allowed"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              // Prevent clicks from reaching content
              e.stopPropagation();
              if (!lockBtnRef.current) return;
              // Trigger zoom-in animation
              setLockZoom(true);
              setTimeout(() => setLockZoom(false), 1000);

              const rect = lockBtnRef.current.getBoundingClientRect();

              const tooltip = document.createElement("div");
              tooltip.className =
                "fixed px-3 py-1 text-base font-bold bg-black text-white rounded-md opacity-0 transition-opacity z-[9999]";
              tooltip.textContent = "Unlock to edit";

              document.body.appendChild(tooltip);

              // Position tooltip just to the RIGHT of the Lock button
              tooltip.style.left = `${rect.right + 8}px`;
              tooltip.style.top = `${rect.top + rect.height / 2}px`;
              tooltip.style.transform = "translateY(-50%)";

              requestAnimationFrame(() => {
                tooltip.style.opacity = 1;
              });

              setTimeout(() => {
                tooltip.style.opacity = 0;
                setTimeout(() => tooltip.remove(), 150);
              }, 3000);
            }}
          />
        )}

        {/* Input Sections */}
        <div className={`${isInputLocked ? "pointer-events-none opacity-60" : ""}`}>
          {moduleConfig.inputSections.map((section, index) => (
            <InputSection
              key={section?.id || section?.name || index}
              section={section}
              inputs={inputs}
              setInputs={setInputs}
              isInputLocked={isInputLocked}
              selectionStates={selectionStates}
              updateSelectionState={updateSelectionState}
              updateModalState={updateModalState}
              toggleAllSelected={toggleAllSelected}
              contextData={contextData}
              extraState={extraState}
              setExtraState={setExtraState}
              updateSelectedItems={updateSelectedItems}
              setModalDynamicSrc={setModalDynamicSrc}
              onRefetchModuleOptions={onRefetchModuleOptions}
            />
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 z-10 bg-white dark:bg-osdag-dark-color border-t border-gray-200 dark:border-gray-700 flex items-center justify-between w-full gap-x-4 px-4 py-2">
        {/* Save Inputs Button */}
        <button
          onClick={handleSaveInputs}
          className="flex flex-1 items-center gap-x-2 bg-osdag-green text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-opacity-90 transition-opacity"
          disabled={!inputs || Object.keys(inputs).length === 0}
          title={isGuest ? "Download OSI file (guest users cannot save to database)" : "Save current inputs to OSI file"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
            <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
          </svg>
          {isGuest ? "Download OSI" : "Save Inputs"}
        </button>

        {/* Design Button */}
        <button
          onClick={handleSubmitEnhanced}
          disabled={isInputLocked || loadingOptions}
          title={isInputLocked ? 'Unlock the dock to redesign' : 'Run Design'}
          className={`flex flex-1 items-center justify-center gap-x-2 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-opacity ${
            (isInputLocked || loadingOptions)
              ? 'bg-gray-400 cursor-not-allowed opacity-70' 
              : 'bg-osdag-green hover:bg-opacity-90'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
            <path d="m352-522 86-87-56-57-44 44-56-56 43-44-45-45-87 87 159 158Zm328 329 87-87-45-45-44 43-56-56 43-44-57-56-86 86 158 159Zm24-567 57 57-57-57ZM290-120H120v-170l175-175L80-680l200-200 216 216 151-152q12-12 27-18t31-6q16 0 31 6t27 18l53 54q12 12 18 27t6 31q0 16-6 30.5T816-647L665-495l215 215L680-80 465-295 290-120Zm-90-80h56l392-391-57-57-391 392v56Zm420-419-29-29 57 57-28-28Z" />
          </svg>
          Design
        </button>
      </div>
    </div>
  );
});
BaseInputDock.displayName = "BaseInputDock";
