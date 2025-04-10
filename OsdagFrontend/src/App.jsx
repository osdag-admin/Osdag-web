
// import React from 'react';
// import { DockProvider } from './context/DockContext';
// import InputDock from './components/InputDock';
// import OutputDock from './components/OutputDock';
// import CenterDock from './components/CenterDock';
// import Endplate from './pages/Endplate';

// function App() {
//   return (
//     <DockProvider>
//                  <Endplate />
//       <div className="flex h-screen w-full">
          
//         <div className="flex-none">
//           <InputDock />
//         </div>
        
//         <div className="flex-grow">
//           <CenterDock />
//         </div>
//         <div className="flex-none">
//           <OutputDock />
//         </div>
//       </div>
//     </DockProvider>
//   );
// }

// export default App;


import React from 'react';
import { DockProvider } from './context/DockContext';
import InputDock from './components/InputDock';
import OutputDock from './components/OutputDock';
import CenterDock from './components/CenterDock';
import Endplate from './pages/Endplate';

function App() {
  return ( 
            
    <DockProvider>
                 <Endplate />
      <div className="flex h-screen w-full bg-[#f1f1f1]">
          
        <div className="flex-none">
          <InputDock />
        </div>
        
        <div className="flex-grow">
          <CenterDock />
        </div>
        <div className="flex-none">
          <OutputDock />
        </div>
      </div>
    </DockProvider>
  );
}

export default App;