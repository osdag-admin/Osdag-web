/* eslint-disable react-refresh/only-export-components, react/prop-types */
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

const ShortcutContext = createContext(null);

const isMacPlatform = () => {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || "");
};

const isEditableTarget = (target) => {
  if (!target) return false;
  const tag = target.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return !!target.isContentEditable;
};

const isEscapeEvent = (event) => event.code === "Escape" || event.key === "Escape";

const isSubmitEvent = (event) =>
  (event.code === "Enter" || event.key === "Enter") && (event.ctrlKey || event.metaKey);

const shouldBlockInEditable = (event) => {
  if (!isEditableTarget(event.target)) return false;
  if (isEscapeEvent(event) || isSubmitEvent(event)) return false;
  // Block single key and Alt/Shift combos while typing.
  // Ctrl/Cmd combos remain allowed.
  if (event.ctrlKey || event.metaKey) return false;
  return true;
};

const splitCombo = (combo) => {
  if (combo === "+" || combo === "-" || combo === "/" || combo === "?") return [combo];
  return combo.split("+").map((token) => token.trim()).filter(Boolean);
};

const modsForCombo = (combo) => {
  const tokens = splitCombo(combo);
  return {
    ctrl: tokens.includes("Ctrl"),
    meta: tokens.includes("Cmd"),
    alt: tokens.includes("Alt") || tokens.includes("Option"),
    shift: tokens.includes("Shift"),
  };
};

const keyMatcher = (event, combo) => {
  const tokens = splitCombo(combo);
  const keyToken = tokens[tokens.length - 1];

  if (keyToken === "?") {
    return event.code === "Slash" && event.shiftKey;
  }
  if (keyToken === "/") {
    return event.code === "Slash" && !event.shiftKey;
  }
  if (keyToken === "+") {
    return event.key === "+" || event.code === "NumpadAdd";
  }
  if (keyToken === "-") {
    return event.key === "-" || event.code === "Minus" || event.code === "NumpadSubtract";
  }
  if (keyToken === "Enter") {
    return event.code === "Enter" || event.code === "NumpadEnter" || event.key === "Enter";
  }
  if (keyToken === "Escape") {
    return isEscapeEvent(event);
  }
  if (/^[0-9]$/.test(keyToken)) {
    return event.code === `Digit${keyToken}` || event.code === `Numpad${keyToken}` || event.key === keyToken;
  }
  if (keyToken.length === 1) {
    const lowered = keyToken.toLowerCase();
    return event.key?.toLowerCase() === lowered || event.code === `Key${lowered.toUpperCase()}`;
  }

  return event.key === keyToken || event.code === keyToken;
};

const comboMatches = (event, combo) => {
  const mods = modsForCombo(combo);
  const tokens = splitCombo(combo);
  const keyToken = tokens[tokens.length - 1];
  // Exact modifier matching for deterministic behavior.
  if (event.ctrlKey !== mods.ctrl) return false;
  if (event.metaKey !== mods.meta) return false;
  if (event.altKey !== mods.alt) return false;
  if (keyToken !== "+" && event.shiftKey !== mods.shift && keyToken !== "?") return false;
  return keyMatcher(event, combo);
};

export const ShortcutProvider = ({ children }) => {
  const layersRef = useRef([]);

  const registerLayer = (layer) => {
    layersRef.current.push(layer);
    return () => {
      layersRef.current = layersRef.current.filter((entry) => entry !== layer);
    };
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (shouldBlockInEditable(event)) return;

      const layers = [...layersRef.current]
        .filter((layer) => layer.enabled())
        .sort((a, b) => b.priority - a.priority);

      for (const layer of layers) {
        const handled = layer.onKeyDown(event, { comboMatches, isMac: isMacPlatform() });
        if (handled) {
          event.preventDefault();
          break;
        }
        if (layer.blockLower) {
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      registerLayer,
      isMacPlatform,
    }),
    []
  );

  return <ShortcutContext.Provider value={value}>{children}</ShortcutContext.Provider>;
};

export const useShortcutEngine = () => {
  const ctx = useContext(ShortcutContext);
  if (!ctx) {
    throw new Error("useShortcutEngine must be used inside ShortcutProvider.");
  }
  return ctx;
};

export const useShortcutLayer = ({
  id,
  priority,
  enabled = true,
  blockLower = false,
  bindings = [],
}) => {
  const { registerLayer, isMacPlatform: detectMac } = useShortcutEngine();
  const bindingsRef = useRef(bindings);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const unregister = registerLayer({
      id,
      priority,
      blockLower,
      enabled: () => !!enabledRef.current,
      onKeyDown: (event, helpers) => {
        const isMac = helpers.isMac;
        const platformKey = isMac ? "mac" : "winLinux";

        for (const binding of bindingsRef.current) {
          if (!binding?.handler) continue;
          if (binding.when && !binding.when()) continue;
          const combos = binding.combos?.[platformKey] || [];
          if (!combos.length) continue;

          const matched = combos.some((combo) => helpers.comboMatches(event, combo));
          if (!matched) continue;
          binding.handler(event, { isMac, detectMac });
          return true;
        }
        return false;
      },
    });
    return unregister;
  }, [blockLower, id, priority, registerLayer, detectMac]);
};

