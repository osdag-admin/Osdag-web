import { useShortcutLayer } from "../../../utils/shortcuts/ShortcutProvider";
import { SHORTCUT_ACTION_BY_ID } from "../../../constants/shortcuts";
import { DESIGN_STATUS } from "../hooks/useDesignSubmission";
import { message } from "antd";

export const useEngineeringShortcuts = ({
  navigate,
  toggleInputDock,
  toggleOutputDock,
  toggleLogs,
  handleSubmitEnhanced,
  handleResetEnhanced,
  handleLockToggle,
  showCad,
  setSelectedCameraView,
  hasModalContext,
  output,
  status,
  handleCreateProject,
  projectIdFromUrl,
  handleLoadInputFromShortcut,
  cadModelPaths,
  setSelectedSave3dType,
  setShowSave3dTypeModal,
  setCreateDesignReportBool,
  handleOpenDesignPrefFromShortcut,
  toggleTheme,
}) => {
  useShortcutLayer({
    id: "engineering-modal-blocker",
    priority: 100,
    enabled: hasModalContext,
    blockLower: true,
    bindings: [],
  });

  useShortcutLayer({
    id: "engineering-core-shortcuts",
    priority: 50,
    enabled: true,
    bindings: [
      {
        combos: SHORTCUT_ACTION_BY_ID["global.nav.home"]?.shortcuts,
        handler: () => navigate("/home"),
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.dock.input.toggle"]?.shortcuts,
        handler: () => toggleInputDock(),
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.dock.output.toggle"]?.shortcuts,
        when: () => !!output,
        handler: () => toggleOutputDock(!!output),
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.logs.toggle"]?.shortcuts,
        when: () => !!output,
        handler: () => toggleLogs(!!output),
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.design.submit"]?.shortcuts,
        when: () =>
          status.step !== DESIGN_STATUS.CALCULATING &&
          status.step !== DESIGN_STATUS.CAD_GENERATING,
        handler: () => {
          handleSubmitEnhanced();
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.design.reset"]?.shortcuts,
        handler: () => {
          handleResetEnhanced();
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.input.lockToggle"]?.shortcuts,
        handler: () => {
          handleLockToggle();
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.cad.zoomIn"]?.shortcuts,
        when: () => !!showCad,
        handler: () => {
          document.dispatchEvent(new CustomEvent("cad-camera-action", { detail: "zoom-in" }));
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.cad.zoomOut"]?.shortcuts,
        when: () => !!showCad,
        handler: () => {
          document.dispatchEvent(new CustomEvent("cad-camera-action", { detail: "zoom-out" }));
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.cad.view.front"]?.shortcuts,
        when: () => !!showCad,
        handler: () => {
          setSelectedCameraView("XY");
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.cad.view.top"]?.shortcuts,
        when: () => !!showCad,
        handler: () => {
          setSelectedCameraView("ZX");
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.cad.view.side"]?.shortcuts,
        when: () => !!showCad,
        handler: () => {
          setSelectedCameraView("YZ");
        },
      },
    ],
  });

  useShortcutLayer({
    id: "engineering-extended-shortcuts",
    priority: 45,
    enabled: true,
    bindings: [
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.project.create"]?.shortcuts,
        when: () => !projectIdFromUrl,
        handler: () => {
          handleCreateProject();
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.input.load"]?.shortcuts,
        handler: () => {
          handleLoadInputFromShortcut();
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.model.save3d"]?.shortcuts,
        handler: () => {
          const hasModelOrOutput = !!output || (cadModelPaths && Object.keys(cadModelPaths).length > 0);
          if (!hasModelOrOutput) {
            message.warning("No 3D model available. Run design first to enable Save 3D Model.");
            return;
          }
          setSelectedSave3dType("Export STL");
          setShowSave3dTypeModal(true);
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.report.download"]?.shortcuts,
        when: () => !!output,
        handler: () => {
          setCreateDesignReportBool(true);
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["eng.pref.open"]?.shortcuts,
        handler: () => {
          handleOpenDesignPrefFromShortcut();
        },
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["global.theme.toggle"]?.shortcuts,
        handler: () => {
          toggleTheme();
        },
      },
    ],
  });
};
