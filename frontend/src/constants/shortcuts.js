export const SHORTCUT_PLATFORM = {
  WIN_LINUX: 'winLinux',
  MAC: 'mac',
};

export const SHORTCUT_SCOPE = {
  GLOBAL: 'global',
  ENGINEERING: 'engineering',
  MODULE_SELECTION: 'moduleSelection',
  MODAL: 'modal',
};

/**:
 * - One source of truth for action IDs, scopes, per-platform mappings,
 *   enablement conditions, and conflict notes.
 * - Runtime engine wiring is centralized via the shortcut provider/layers.
 */
export const SHORTCUT_ACTIONS = [
  // Global shortcuts
  {
    id: 'global.search.focus',
    label: 'Focus Search',
    scope: SHORTCUT_SCOPE.GLOBAL,
    shortcuts: {
      winLinux: ['/', 'Ctrl+K'],
      mac: ['/', 'Cmd+K'],
    },
    whenEnabled: 'Search UI exists on current page.',
    blockedWhen: 'Single-key "/" while typing in editable fields.',
    conflictRisk: 'low',
  },
  {
    id: 'global.shortcuts.help',
    label: 'Shortcuts Help',
    scope: SHORTCUT_SCOPE.GLOBAL,
    shortcuts: {
      winLinux: ['?'],
      mac: ['?'],
    },
    whenEnabled: 'Always.',
    blockedWhen: 'Never.',
    conflictRisk: 'low',
  },
  {
    id: 'global.nav.home',
    label: 'Go Home',
    scope: SHORTCUT_SCOPE.GLOBAL,
    shortcuts: {
      winLinux: ['Alt+Shift+H'],
      mac: ['Option+Shift+H'],
    },
    whenEnabled: 'Always.',
    blockedWhen: 'Blocking confirmation modal is active.',
    conflictRisk: 'low',
  },

  // Engineering shortcuts
  {
    id: 'eng.dock.input.toggle',
    label: 'Toggle Input Dock',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['Alt+Shift+I'],
      mac: ['Option+Shift+I'],
    },
    whenEnabled: 'Engineering module route is active.',
    blockedWhen: 'Modal context is active.',
    conflictRisk: 'low',
  },
  {
    id: 'eng.dock.output.toggle',
    label: 'Toggle Output Dock',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['Alt+Shift+O'],
      mac: ['Option+Shift+O'],
    },
    whenEnabled: 'Engineering module route is active and output exists.',
    blockedWhen: 'Modal context is active.',
    conflictRisk: 'low',
  },
  {
    id: 'eng.logs.toggle',
    label: 'Toggle Logs',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['Alt+Shift+L'],
      mac: ['Option+Shift+L'],
    },
    whenEnabled: 'Engineering module route is active and output exists.',
    blockedWhen: 'Modal context is active.',
    conflictRisk: 'low',
  },
  {
    id: 'eng.design.submit',
    label: 'Submit Design',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['Ctrl+Enter'],
      mac: ['Cmd+Enter'],
    },
    whenEnabled: 'Design is submittable and not currently processing.',
    blockedWhen: 'Blocking confirmation/status modal is active.',
    conflictRisk: 'low',
  },
  {
    id: 'eng.design.reset',
    label: 'Reset Design',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['Alt+Shift+R'],
      mac: ['Option+Shift+R'],
    },
    whenEnabled: 'Engineering module route is active.',
    blockedWhen: 'Reset confirmation already open.',
    conflictRisk: 'low',
  },
  {
    id: 'eng.input.lockToggle',
    label: 'Lock / Unlock',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['Alt+Shift+U'],
      mac: ['Option+Shift+U'],
    },
    whenEnabled: 'Engineering module route is active.',
    blockedWhen: 'Blocking status modal is active.',
    conflictRisk: 'low',
  },
  {
    id: 'eng.cad.zoomIn',
    label: 'CAD Zoom In',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['+', 'Alt+='],
      mac: ['+', 'Option+='],
    },
    whenEnabled: 'CAD viewport is visible.',
    blockedWhen: 'Single-key mode while typing in editable fields.',
    conflictRisk: 'medium',
  },
  {
    id: 'eng.cad.zoomOut',
    label: 'CAD Zoom Out',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['-', 'Alt+-'],
      mac: ['-', 'Option+-'],
    },
    whenEnabled: 'CAD viewport is visible.',
    blockedWhen: 'Single-key mode while typing in editable fields.',
    conflictRisk: 'medium',
  },
  {
    id: 'eng.cad.view.front',
    label: 'CAD Front View',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['Alt+1'],
      mac: ['Option+1'],
    },
    whenEnabled: 'CAD context is active.',
    blockedWhen: 'Modal context is active.',
    conflictRisk: 'low',
  },
  {
    id: 'eng.cad.view.top',
    label: 'CAD Top View',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['Alt+2'],
      mac: ['Option+2'],
    },
    whenEnabled: 'CAD context is active.',
    blockedWhen: 'Modal context is active.',
    conflictRisk: 'low',
  },
  {
    id: 'eng.cad.view.side',
    label: 'CAD Side View',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: {
      winLinux: ['Alt+3'],
      mac: ['Option+3'],
    },
    whenEnabled: 'CAD context is active.',
    blockedWhen: 'Modal context is active.',
    conflictRisk: 'low',
  },

  // Module selection/navigation shortcuts
  {
    id: 'modsel.focus.moveLeft',
    label: 'Move Focus Left',
    scope: SHORTCUT_SCOPE.MODULE_SELECTION,
    shortcuts: { winLinux: ['ArrowLeft'], mac: ['ArrowLeft'] },
    whenEnabled: 'Module selection tabs/cards are focused.',
    blockedWhen: 'Typing in editable fields.',
    conflictRisk: 'low',
  },
  {
    id: 'modsel.focus.moveRight',
    label: 'Move Focus Right',
    scope: SHORTCUT_SCOPE.MODULE_SELECTION,
    shortcuts: { winLinux: ['ArrowRight'], mac: ['ArrowRight'] },
    whenEnabled: 'Module selection tabs/cards are focused.',
    blockedWhen: 'Typing in editable fields.',
    conflictRisk: 'low',
  },
  {
    id: 'modsel.focus.moveUp',
    label: 'Move Focus Up',
    scope: SHORTCUT_SCOPE.MODULE_SELECTION,
    shortcuts: { winLinux: ['ArrowUp'], mac: ['ArrowUp'] },
    whenEnabled: 'Module selection cards are focused.',
    blockedWhen: 'Typing in editable fields.',
    conflictRisk: 'low',
  },
  {
    id: 'modsel.focus.moveDown',
    label: 'Move Focus Down',
    scope: SHORTCUT_SCOPE.MODULE_SELECTION,
    shortcuts: { winLinux: ['ArrowDown'], mac: ['ArrowDown'] },
    whenEnabled: 'Module selection cards are focused.',
    blockedWhen: 'Typing in editable fields.',
    conflictRisk: 'low',
  },
  {
    id: 'modsel.activate',
    label: 'Select / Open',
    scope: SHORTCUT_SCOPE.MODULE_SELECTION,
    shortcuts: { winLinux: ['Enter', 'Space'], mac: ['Enter', 'Space'] },
    whenEnabled: 'Module selection target is focused.',
    blockedWhen: 'Modal context is active.',
    conflictRisk: 'low',
  },
  {
    id: 'modsel.tab.prev',
    label: 'Previous Tab',
    scope: SHORTCUT_SCOPE.MODULE_SELECTION,
    shortcuts: { winLinux: ['['], mac: ['['] },
    whenEnabled: 'Module selection tab set is visible.',
    blockedWhen: 'Typing in editable fields.',
    conflictRisk: 'medium',
  },
  {
    id: 'modsel.tab.next',
    label: 'Next Tab',
    scope: SHORTCUT_SCOPE.MODULE_SELECTION,
    shortcuts: { winLinux: [']'], mac: [']'] },
    whenEnabled: 'Module selection tab set is visible.',
    blockedWhen: 'Typing in editable fields.',
    conflictRisk: 'medium',
  },
  {
    id: 'global.dismiss',
    label: 'Close Modal / Search',
    scope: SHORTCUT_SCOPE.GLOBAL,
    shortcuts: { winLinux: ['Escape'], mac: ['Escape'] },
    whenEnabled: 'At least one dismissible overlay/context is open.',
    blockedWhen: 'Never.',
    conflictRisk: 'low',
  },

  // Extended shortcuts
  {
    id: 'eng.project.create',
    label: 'Create Project',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: { winLinux: ['Alt+Shift+N'], mac: ['Option+Shift+N'] },
    whenEnabled: 'Project creation is allowed by auth/verification rules.',
    blockedWhen: 'Current project is already persisted.',
    conflictRisk: 'low',
    menuActionName: 'Create Project',
  },
  {
    id: 'eng.input.load',
    label: 'Load Input',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: { winLinux: ['Alt+Shift+M'], mac: ['Option+Shift+M'] },
    whenEnabled: 'Engineering module route is active.',
    blockedWhen: 'Blocking modal is active.',
    conflictRisk: 'low',
    menuActionName: 'Load Input',
  },
  {
    id: 'eng.model.save3d',
    label: 'Save 3D Model',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: { winLinux: ['Alt+Shift+S'], mac: ['Option+Shift+S'] },
    whenEnabled: 'CAD data/model paths are available.',
    blockedWhen: 'Blocking modal is active.',
    conflictRisk: 'low',
    menuActionName: 'Save 3D Model',
  },
  {
    id: 'eng.report.download',
    label: 'Download Report',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: { winLinux: ['Alt+Shift+D'], mac: ['Option+Shift+D'] },
    whenEnabled: 'Output exists and report prerequisites are met.',
    blockedWhen: 'Blocking modal is active.',
    conflictRisk: 'low',
  },
  {
    id: 'eng.pref.open',
    label: 'Design Preferences',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: { winLinux: ['Alt+Shift+P'], mac: ['Option+Shift+P'] },
    whenEnabled: 'Design preferences guard allows opening.',
    blockedWhen: 'Blocking modal is active.',
    conflictRisk: 'low',
  },
  {
    id: 'global.theme.toggle',
    label: 'Toggle Theme',
    scope: SHORTCUT_SCOPE.GLOBAL,
    shortcuts: { winLinux: ['Alt+Shift+T'], mac: ['Option+Shift+T'] },
    whenEnabled: 'Theme toggle control is available in current page shell.',
    blockedWhen: 'Never.',
    conflictRisk: 'low',
  },
  // Complete map staging policy
  {
    id: 'eng.menu.completeMap',
    label: 'Menubar Complete Map',
    scope: SHORTCUT_SCOPE.ENGINEERING,
    shortcuts: { winLinux: [], mac: [] },
    whenEnabled: 'After core shortcut set validation and QA sign-off.',
    blockedWhen: 'Before engine hardening and discoverability UX are complete.',
    conflictRisk: 'n/a',
  },
];

export const SHORTCUT_ACTION_BY_ID = SHORTCUT_ACTIONS.reduce((acc, action) => {
  acc[action.id] = action;
  return acc;
}, {});

export const MENU_ACTION_TO_SHORTCUT_ID = {
  'Create Project': 'eng.project.create',
  'Load Input': 'eng.input.load',
  'Create Design Report': 'eng.report.download',
  'Save 3D Model': 'eng.model.save3d',
  'Zoom In': 'eng.cad.zoomIn',
  'Zoom Out': 'eng.cad.zoomOut',
  'Show front view': 'eng.cad.view.front',
  'Show top view': 'eng.cad.view.top',
  'Show side view': 'eng.cad.view.side',
  'Reset': 'eng.design.reset',
  'Show optimization graph': '',
};

export const getShortcutDisplayLabel = (
  actionId,
  platform = SHORTCUT_PLATFORM.WIN_LINUX
) => {
  const action = SHORTCUT_ACTION_BY_ID[actionId];
  if (!action) return '';
  const keyList = action.shortcuts?.[platform] || [];
  return keyList.length ? keyList[0] : '';
};

export const getShortcutCombos = (
  actionId,
  platform = SHORTCUT_PLATFORM.WIN_LINUX
) => {
  const action = SHORTCUT_ACTION_BY_ID[actionId];
  if (!action) return [];
  return action.shortcuts?.[platform] || [];
};

export const getMenuShortcutLabel = (
  menuActionName,
  platform = SHORTCUT_PLATFORM.WIN_LINUX
) => {
  const shortcutId = MENU_ACTION_TO_SHORTCUT_ID[menuActionName];
  if (!shortcutId) return '';
  return getShortcutDisplayLabel(shortcutId, platform);
};
