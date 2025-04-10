




// import React, { useState } from "react";
// import Draggable from "react-draggable";
// import closeIcon from "../assets/close.png";
// import minimizeIcon from "../assets/minimize.png";
// import { useDock } from '../context/DockContext';

// function OutputDock() {
//   const { isOutputDockVisible } = useDock();
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [isClosed, setIsClosed] = useState(false);

//   if (!isOutputDockVisible || isClosed) return null;

//   return (
//     <div className="h-full relative">
//       {isMinimized ? (
//         <Draggable 
//           bounds="parent"
//           handle=".drag-handle"
//           defaultPosition={{x: -20, y: 20}}
//         >
//           <div className="absolute bg-[#f0f0f0] p-2 border border-gray-400 rounded-[2px] shadow-md w-60 z-50">
//             <div className="flex justify-between items-center bg-[#f0f0f0] p-2 drag-handle cursor-move">
//               <h2 className="text-[11px]">Output Dock</h2>
//               <div className="flex gap-2">
//                 <button title="Restore" onClick={() => setIsMinimized(false)}>
//                   <img src={minimizeIcon} alt="Restore" className="w-4 h-4" />
//                 </button>
//                 <button title="Close" onClick={() => setIsClosed(true)}>
//                   <img src={closeIcon} alt="Close" className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </Draggable>
//       ) : (
//         <div className="h-fit bg-[#f1f1f1] overflow-auto">
//           <div className="flex justify-between items-center bg-[#f0f0f0] p-3">
//             <h2 className="text-[11px]">Output Dock</h2>
//             <div className="flex gap-2">
//               <button title="Minimize" onClick={() => setIsMinimized(true)}>
//                 <img src={minimizeIcon} alt="Minimize" className="w-4 h-4" />
//               </button>
//               <button title="Close" onClick={() => setIsClosed(true)}>
//                 <img src={closeIcon} alt="Close" className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//           <div className="bg-[#f0f0f0] p-2 border border-gray-400 rounded-[2px] shadow-md w-80 max-w-md relative">
//             <div className="overflow-y-auto" style={{ maxHeight: "75vh" }}>
//               <h2 className="text-[14px] font-bold mb-2">Critical Bolt Design</h2>

//               <div className="space-y-0">
//                 {/* Input Fields */}
//                 <div className="space-y-2">
//                   <div className="flex flex-row gap-[55px]">
//                     <label className="font-medium text-[12px]">Diameter (mm)</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500 rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[60px]">
//                     <label className="font-medium text-[12px]">Property Class</label>
//                     <input
//                       type="text"
//                       className="border w-28 border-blue-500 rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[32px]">
//                     <label className="font-medium text-[12px]">
//                       Shear Demand (kN)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[30px]">
//                     <label className="font-medium text-[12px]">
//                       Shear Capacity (kN)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[22px]">
//                     <label className="font-medium text-[12px]">
//                       Bearing Capacity (kN)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[123px]">
//                     <label className="font-medium text-[12px]">βlg</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[69px]">
//                     <label className="font-medium text-[12px]">Bolt Capacity</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[0px]">
//                     <label className="font-medium text-[12px]">
//                       Tension Due to Moment (kN)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[45px]">
//                     <label className="font-medium text-[12px]">
//                       Prying Force (kN)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[23px]">
//                     <label className="font-medium text-[12px]">
//                       Tension Demand (kN)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[23px]">
//                     <label className="font-medium text-[12px]">
//                       Tension Capacity (kN)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[15px]">
//                     <label className="font-medium text-[12px]">
//                       Combined Capacity, I.R
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>

//                   {/* New Fields */}
//                   <h2 className="text-[14px] font-bold mt-4">Detailing</h2>
//                   <div className="flex flex-row gap-[75px]">
//                     <label className="font-medium text-[12px]">No. of Bolts</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[55px]">
//                     <label className="font-medium text-[12px]">
//                       No. of Columns
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[75px]">
//                     <label className="font-medium text-[12px]">No. of Rows</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[31px]">
//                     <label className="font-medium text-[12px]">
//                       Pitch Distance (mm)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[22px]">
//                     <label className="font-medium text-[12px]">
//                       Gauge Distance (mm)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[0px]">
//                     <label className="font-medium text-[12px]">
//                       Cross-centre Gauge (mm)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[37px]">
//                     <label className="font-medium text-[12px]">
//                       End Distance (mm)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[30px]">
//                     <label className="font-medium text-[12px]">
//                       Edge Distance (mm)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[50px]">
//                     <label className="font-medium text-[12px]">
//                       Typical Detailing
//                     </label>
//                     <button className="bg-gray-400 text-black px-2 w-28 rounded hover:bg-gray-300 transition-colors text-[12px]">
//                       Details
//                     </button>
//                   </div>

//                   <h2 className="text-[14px] font-bold mt-4">End Plate</h2>
//                   <div className="flex flex-row gap-[55px]">
//                     <label className="font-medium text-[12px]">
//                       Thickness (mm)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[70px]">
//                     <label className="font-medium text-[12px]">Height (mm)</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[75px]">
//                     <label className="font-medium text-[12px]">Width (mm)</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[7px]">
//                     <label className="font-medium text-[12px]">
//                       Moment Capacity (kNm)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>

//                   <h2 className="text-[14px] font-bold mt-4">Stiffener Plate</h2>
//                   <div className="flex flex-row gap-[72px]">
//                     <label className="font-medium text-[12px]">Dimensions</label>
//                     <button className="bg-gray-400 text-black px-2 w-28 rounded hover:bg-gray-300 transition-colors text-[12px]">
//                       Details
//                     </button>
//                   </div>
//                   <div className="flex flex-row gap-[60px]">
//                     <label className="font-medium text-[12px]">
//                       Typical Sketch
//                     </label>
//                     <button className="bg-gray-400 text-black px-2 w-28 rounded hover:bg-gray-300 transition-colors text-[12px]">
//                       Details
//                     </button>
//                   </div>

//                   <h2 className="text-[14px] font-bold mt-4">Weld </h2>
//                   <h2 className="text-[14px] font-bold mt-4">Weld at web</h2>
//                   <div className="flex flex-row gap-[85px]">
//                     <label className="font-medium text-[12px]">Size (mm)</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[40px]">
//                     <label className="font-medium text-[12px]">
//                       Total Length (mm)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[60px]">
//                     <label className="font-medium text-[12px]">Stress (N/mm)</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[13px]">
//                     <label className="  font-medium text-[12px]">
//                       Combined Stress (N/mm²)
//                     </label>
//                     <input
//                       type="number"
//                       className="border border-blue-500 w-24 rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[42px]">
//                     <label className="font-medium text-[12px]">
//                       Strength (N/mm²)
//                     </label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <h2 className="text-[14px] font-bold mt-4">Weld at Flange</h2>
//                   <div className="flex flex-row gap-[115px]">
//                     <label className="font-medium text-[12px]">Type</label>
//                     <input
//                       type="number"
//                       className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
//                     />
//                   </div>
//                   <div className="flex flex-row gap-[60px]">
//                     <label className="font-medium text-[12px]">
//                       Typical Sketch
//                     </label>
//                     <button className="bg-gray-400 text-black px-2 w-28 rounded hover:bg-gray-300 transition-colors text-[12px]">
//                       Details
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col gap-3 my-4 mx-12">
//               <button className="bg-[#a36666] text-white px-2 rounded hover:bg-[#8c5555] transition-colors w-full">
//                 Create Design Report
//               </button>
//               <button className="bg-[#a36666] text-white px-2 rounded hover:bg-[#8c5555] transition-colors w-full">
//                 Save Output
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default OutputDock;









import React, { useState } from "react";
import Draggable from "react-draggable";
import closeIcon from "../assets/close.png";
import minimizeIcon from "../assets/minimize.png";
import { useDock } from '../context/DockContext';

function OutputDock() {
  const { isOutputDockVisible } = useDock();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (!isOutputDockVisible || isClosed) return null;

  return (
    <div className="h-full relative">
      {isMinimized ? (
        <Draggable 
          bounds="parent"
          handle=".drag-handle"
          defaultPosition={{x: -20, y: 20}}
        >
          <div className="absolute bg-[#f1f1f1] p-2 border border-gray-400 rounded-[2px] shadow-md w-60 z-50">
            <div className="flex justify-between items-center bg-[#f0f0f0] p-2 drag-handle cursor-move">
              <h2 className="text-[11px]">Output Dock</h2>
              <div className="flex gap-2">
                <button title="Restore" onClick={() => setIsMinimized(false)}>
                  <img src={minimizeIcon} alt="Restore" className="w-4 h-4" />
                </button>
                <button title="Close" onClick={() => setIsClosed(true)}>
                  <img src={closeIcon} alt="Close" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Draggable>
      ) : (
        <div className="h-fit bg-[#f1f1f1] overflow-auto">
          <div className="flex justify-between items-center bg-[#f0f0f0] p-3">
            <h2 className="text-[11px]">Output Dock</h2>
            <div className="flex gap-2">
              <button title="Minimize" onClick={() => setIsMinimized(true)}>
                <img src={minimizeIcon} alt="Minimize" className="w-4 h-4" />
              </button>
              <button title="Close" onClick={() => setIsClosed(true)}>
                <img src={closeIcon} alt="Close" className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-[#f1f1f1] p-2 border border-gray-400 rounded-[2px] shadow-md w-80 max-w-md relative">
            <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
              <h2 className="text-[14px] font-bold mb-2">Critical Bolt Design</h2>

              <div className="space-y-0">
                {/* Input Fields */}
                <div className="space-y-2">
                  <div className="flex flex-row gap-[55px]">
                    <label className="font-medium text-[12px]">Diameter (mm)</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500 rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[60px]">
                    <label className="font-medium text-[12px]">Property Class</label>
                    <input
                      type="text"
                      className="border w-28 border-blue-500 rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[32px]">
                    <label className="font-medium text-[12px]">
                      Shear Demand (kN)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[30px]">
                    <label className="font-medium text-[12px]">
                      Shear Capacity (kN)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[22px]">
                    <label className="font-medium text-[12px]">
                      Bearing Capacity (kN)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[123px]">
                    <label className="font-medium text-[12px]">βlg</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[69px]">
                    <label className="font-medium text-[12px]">Bolt Capacity</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[0px]">
                    <label className="font-medium text-[12px]">
                      Tension Due to Moment (kN)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[45px]">
                    <label className="font-medium text-[12px]">
                      Prying Force (kN)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[23px]">
                    <label className="font-medium text-[12px]">
                      Tension Demand (kN)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[23px]">
                    <label className="font-medium text-[12px]">
                      Tension Capacity (kN)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[15px]">
                    <label className="font-medium text-[12px]">
                      Combined Capacity, I.R
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>

                  {/* New Fields */}
                  <h2 className="text-[14px] font-bold mt-4">Detailing</h2>
                  <div className="flex flex-row gap-[75px]">
                    <label className="font-medium text-[12px]">No. of Bolts</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[55px]">
                    <label className="font-medium text-[12px]">
                      No. of Columns
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[75px]">
                    <label className="font-medium text-[12px]">No. of Rows</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[31px]">
                    <label className="font-medium text-[12px]">
                      Pitch Distance (mm)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[22px]">
                    <label className="font-medium text-[12px]">
                      Gauge Distance (mm)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[0px]">
                    <label className="font-medium text-[12px]">
                      Cross-centre Gauge (mm)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[37px]">
                    <label className="font-medium text-[12px]">
                      End Distance (mm)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[30px]">
                    <label className="font-medium text-[12px]">
                      Edge Distance (mm)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[50px]">
                    <label className="font-medium text-[12px]">
                      Typical Detailing
                    </label>
                    <button className="bg-gray-400 text-black px-2 w-28 rounded hover:bg-gray-300 transition-colors text-[12px]">
                      Details
                    </button>
                  </div>

                  <h2 className="text-[14px] font-bold mt-4">End Plate</h2>
                  <div className="flex flex-row gap-[55px]">
                    <label className="font-medium text-[12px]">
                      Thickness (mm)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[70px]">
                    <label className="font-medium text-[12px]">Height (mm)</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[75px]">
                    <label className="font-medium text-[12px]">Width (mm)</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[7px]">
                    <label className="font-medium text-[12px]">
                      Moment Capacity (kNm)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>

                  <h2 className="text-[14px] font-bold mt-4">Stiffener Plate</h2>
                  <div className="flex flex-row gap-[72px]">
                    <label className="font-medium text-[12px]">Dimensions</label>
                    <button className="bg-gray-400 text-black px-2 w-28 rounded hover:bg-gray-300 transition-colors text-[12px]">
                      Details
                    </button>
                  </div>
                  <div className="flex flex-row gap-[60px]">
                    <label className="font-medium text-[12px]">
                      Typical Sketch
                    </label>
                    <button className="bg-gray-400 text-black px-2 w-28 rounded hover:bg-gray-300 transition-colors text-[12px]">
                      Details
                    </button>
                  </div>

                  <h2 className="text-[14px] font-bold mt-4">Weld </h2>
                  <h2 className="text-[14px] font-bold mt-4">Weld at web</h2>
                  <div className="flex flex-row gap-[85px]">
                    <label className="font-medium text-[12px]">Size (mm)</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[40px]">
                    <label className="font-medium text-[12px]">
                      Total Length (mm)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[60px]">
                    <label className="font-medium text-[12px]">Stress (N/mm)</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[13px]">
                    <label className="  font-medium text-[12px]">
                      Combined Stress (N/mm²)
                    </label>
                    <input
                      type="number"
                      className="border border-blue-500 w-24 rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[42px]">
                    <label className="font-medium text-[12px]">
                      Strength (N/mm²)
                    </label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <h2 className="text-[14px] font-bold mt-4">Weld at Flange</h2>
                  <div className="flex flex-row gap-[115px]">
                    <label className="font-medium text-[12px]">Type</label>
                    <input
                      type="number"
                      className="border w-28 border-blue-500  rounded-[4px] p-0 text-[12px]"
                    />
                  </div>
                  <div className="flex flex-row gap-[60px]">
                    <label className="font-medium text-[12px]">
                      Typical Sketch
                    </label>
                    <button className="bg-gray-400 text-black px-2 w-28 rounded hover:bg-gray-300 transition-colors text-[12px]">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 my-4 mx-12">
              <button className="bg-[#a36666] text-white px-2 rounded hover:bg-[#8c5555] transition-colors w-full">
                Create Design Report
              </button>
              <button className="bg-[#a36666] text-white px-2 rounded hover:bg-[#8c5555] transition-colors w-full">
                Save Output
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutputDock;


