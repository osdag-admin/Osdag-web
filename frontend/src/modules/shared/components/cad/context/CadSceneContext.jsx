import React, { createContext, useContext, useState, useMemo } from "react";

const DEFAULT_ORBIT_TARGET = [0, 0, 0];

const CadSceneContext = createContext({
  orbitTarget: DEFAULT_ORBIT_TARGET,
  setOrbitTarget: () => { },
});

export function CadSceneProvider({ children }) {
  const [orbitTarget, setOrbitTarget] = useState(DEFAULT_ORBIT_TARGET);
  const value = useMemo(
    () => ({ orbitTarget, setOrbitTarget }),
    [orbitTarget]
  );
  return (
    <CadSceneContext.Provider value={value}>
      {children}
    </CadSceneContext.Provider>
  );
}

export function useCadSceneContext() {
  const ctx = useContext(CadSceneContext);
  return ctx || { orbitTarget: DEFAULT_ORBIT_TARGET, setOrbitTarget: () => { } };
}
