



// import { createContext, useContext, useState } from 'react';

// const DockContext = createContext();

// export function DockProvider({ children }) {
//   const [isInputDockVisible, setIsInputDockVisible] = useState(true);
//   const [isOutputDockVisible, setIsOutputDockVisible] = useState(true);

//   const toggleInputDock = () => {
//     setIsInputDockVisible(prev => !prev);
//   };

//   const toggleOutputDock = () => {
//     setIsOutputDockVisible(prev => !prev);
//   };

//   return (
//     <DockContext.Provider 
//       value={{
//         isInputDockVisible,
//         isOutputDockVisible,
//         toggleInputDock,
//         toggleOutputDock
//       }}
//     >
//       {children}
//     </DockContext.Provider>
//   );
// }

// export function useDock() {
//   const context = useContext(DockContext);
//   if (!context) {
//     throw new Error('useDock must be used within a DockProvider');
//   }
//   return context;
// }






import { createContext, useContext, useState } from 'react';

const DockContext = createContext();

export function DockProvider({ children }) {
  const [isInputDockVisible, setIsInputDockVisible] = useState(true);
  const [isOutputDockVisible, setIsOutputDockVisible] = useState(true);

  const toggleInputDock = () => {
    setIsInputDockVisible(prev => !prev);
  };

  const toggleOutputDock = () => {
    setIsOutputDockVisible(prev => !prev);
  };

  return (
    <DockContext.Provider 
      value={{
        isInputDockVisible,
        isOutputDockVisible,
        toggleInputDock,
        toggleOutputDock
      }}
    >
      {children}
    </DockContext.Provider>
  );
}

export function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
}