import { useState, useCallback } from "react";

export const useHover = () => {
  const [hoverText, setHoverText] = useState("");
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const handleHoverLabel = useCallback((label, clientX, clientY) => {
    if (!label) return;
    if (typeof clientX === "number" && typeof clientY === "number") {
      setHoverPos({ x: clientX + 12, y: clientY + 12 });
    }
    setHoverText(label);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoverText("");
  }, []);

  return { hoverText, setHoverText, hoverPos, setHoverPos, handleHoverLabel, handleHoverEnd };
};
