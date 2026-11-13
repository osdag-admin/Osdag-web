import { useMemo, useState, useEffect } from "react";
import {
  SHORTCUT_ACTIONS,
  SHORTCUT_ACTION_BY_ID,
} from "../constants/shortcuts";
import { useShortcutLayer } from "../utils/shortcuts/ShortcutProvider";

const SCOPE_LABELS = {
  global: "Global",
  engineering: "Engineering Module",
  moduleSelection: "Module Selection",
  modal: "Modal Context",
};

const scopeOrder = ["global", "engineering", "moduleSelection", "modal"];

const formatCombos = (shortcuts = {}) => {
  const winLinux = (shortcuts.winLinux || []).join(" / ") || "-";
  const mac = (shortcuts.mac || []).join(" / ") || "-";
  return { winLinux, mac };
};

const buildSections = () => {
  const visibleActions = SHORTCUT_ACTIONS.filter(
    (action) =>
      action.shortcuts &&
      ((action.shortcuts.winLinux || []).length ||
        (action.shortcuts.mac || []).length)
  );

  const byScope = {};
  visibleActions.forEach((action) => {
    if (!byScope[action.scope]) byScope[action.scope] = [];
    byScope[action.scope].push(action);
  });

  return byScope;
};

const ShortcutHelpModal = () => {
  const [open, setOpen] = useState(false);

  // Close on Escape key (supplemental — ShortcutLayer also handles this)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useShortcutLayer({
    id: "global-shortcut-help-open",
    priority: 20,
    enabled: !open,
    bindings: [
      {
        combos: SHORTCUT_ACTION_BY_ID["global.shortcuts.help"]?.shortcuts,
        handler: () => setOpen(true),
      },
    ],
  });

  useShortcutLayer({
    id: "global-shortcut-help-modal",
    priority: 200,
    enabled: open,
    blockLower: true,
    bindings: [
      {
        combos:
          SHORTCUT_ACTION_BY_ID["global.dismiss"]?.shortcuts || {
            winLinux: ["Escape"],
            mac: ["Escape"],
          },
        handler: () => setOpen(false),
      },
      {
        combos: SHORTCUT_ACTION_BY_ID["global.shortcuts.help"]?.shortcuts,
        handler: () => setOpen(false),
      },
    ],
  });

  const sections = useMemo(() => buildSections(), []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {scopeOrder.map((scopeKey) => {
            const actions = sections[scopeKey];
            if (!actions?.length) return null;
            return (
              <section key={scopeKey} className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {SCOPE_LABELS[scopeKey] || scopeKey}
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left font-semibold py-2 pr-3 text-gray-700 dark:text-gray-300">Action</th>
                          <th className="text-left font-semibold py-2 pr-3 text-gray-700 dark:text-gray-300">Win/Linux</th>
                          <th className="text-left font-semibold py-2 text-gray-700 dark:text-gray-300">Mac</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actions.map((action) => {
                          const combos = formatCombos(action.shortcuts);
                          return (
                            <tr
                              key={action.id}
                              className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 align-top"
                            >
                              <td className="py-2 pr-3 font-medium text-gray-900 dark:text-gray-100">
                                {action.label}
                              </td>
                              <td className="py-2 pr-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                                {combos.winLinux}
                              </td>
                              <td className="py-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                                {combos.mac}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShortcutHelpModal;
