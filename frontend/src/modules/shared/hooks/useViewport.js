import { useState, useEffect, useRef } from "react";

export const useViewport = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight && window.innerWidth < 1280
  );

  const checkViewportRef = useRef(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const mobile = width < 1280;
    setIsMobile(mobile);
    setIsLandscape(width > height && mobile);
  });

  useEffect(() => {
    const handleCheck = () => checkViewportRef.current();
    handleCheck();
    window.addEventListener("resize", handleCheck);
    window.addEventListener("orientationchange", handleCheck);
    return () => {
      window.removeEventListener("resize", handleCheck);
      window.removeEventListener("orientationchange", handleCheck);
    };
  }, []);

  return { isMobile, isLandscape };
};
