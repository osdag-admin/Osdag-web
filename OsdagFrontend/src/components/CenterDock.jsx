// import React from 'react';
// import { useDock } from '../context/DockContext';

// const CenterDock = () => {
//   const { toggleInputDock, toggleOutputDock } = useDock();

//   return (
//     <div className="h-screen flex flex-col">
//       {/* Top Controls */}
//       <div className=" px-4 border-b bg-[#f0f0f0] flex items-center gap-4">
//         <div className="flex gap-1 p-2 bg-[#f0f0f0]">
//           <img
//             src="/src/assets/Leftsidebar.svg"
//             className="h-4 w-4 cursor-pointer"
//             onClick={toggleInputDock}
//             alt="Toggle Input Dock"
//           />
//           <img
//             src="/src/assets/Rightsidebar.svg"
//             className="h-4 w-4 cursor-pointer"
//             onClick={toggleOutputDock}
//             alt="Toggle Output Dock"
//           />
//         </div>
//         <div className="flex gap-1 p-2 bg-[#f0f0f0]">
//           <img src="/src/assets/zx.png" className="h-6 w-6 cursor-pointer" alt="ZX View" />
//           <img src="/src/assets/zy.png" className="h-6 w-6 cursor-pointer" alt="ZY View" />
//           <img src="/src/assets/yx.png" className="h-6 w-6 cursor-pointer" alt="YX View" />
//         </div>

//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <input type="checkbox" className="h-3 w-3" id="model" />
//             <label htmlFor="model" className="text-gray-500 text-sm">Model</label>
//           </div>
//           <div className="flex items-center gap-2">
//             <input type="checkbox" className="h-3 w-3" id="beam" />
//             <label htmlFor="beam" className="text-gray-500 text-sm">Beam</label>
//           </div>
//           <div className="flex items-center gap-2">
//             <input type="checkbox" className="h-3 w-3" id="endplate" />
//             <label htmlFor="endplate" className="text-gray-500 text-sm">End Plate</label>
//           </div>
//         </div>
//       </div>

//       {/* Center Area */}
//       <div className="flex-1 grid grid-rows-2">
//         {/* Violet Area */}
//         <div className="bg-[#4b0055] border border-gray-500 overflow-auto p-4 h-[60vh]">
//           {/* Add your 3D model or content here */}
//         </div>

//         {/* White Area */}
//         <div className="bg-white border border-blue-500 overflow-y-scroll " style={{ height: '30vh' }}>
//           <p className="text-black text-lg"></p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CenterDock;


// import React, { useState } from "react";
// import { useDock } from "../context/DockContext";
// import ModelViewer from './ModelViewer';

// const CenterDock = () => {
//   const { toggleInputDock, toggleOutputDock } = useDock();
//   const [currentView, setCurrentView] = useState("/src/assets/xyz.png"); // Default image

//   const handleViewChange = (view) => {
//     setCurrentView(view); // Update the current view image
//   };

//   return (
//     <div className="h-screen flex flex-col ">
//       {/* Top Controls */}
//       <div className="px-4 border-b bg-[#f1f1f1] flex items-center gap-4">
//         <div className="flex gap-1 p-2 bg-[#f0f0f0]">
//           <img
//             src="/src/assets/Leftsidebar.svg"
//             className="h-4 w-4 cursor-pointer"
//             onClick={toggleInputDock}
//             alt="Toggle Input Dock"
//             title="Left Dock"
//             style={{ backgroundColor: "white", borderRadius: "4px" }}
//           />
//           {/* <div className="relative group">
//             <img
//               src="/src/assets/Rightsidebar.svg"
//               className="h-4 w-4 cursor-pointer"
//               onClick={toggleOutputDock}
//               alt="Toggle Output Dock"
//             />
           
//             <div className="absolute  w-20 text-[13px] text-center top-4 border border-black left-8 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-yellow-100 text-black ">
//               Right Dock
//             </div>
//           </div> */}
//            <img
//               src="/src/assets/Rightsidebar.svg"
//               className="h-4 w-4 cursor-pointer"
//               onClick={toggleOutputDock}
//               alt="Toggle Output Dock"
//               title="Right Dock"
//             />
//         </div>
//         <div className="flex gap-1 p-2 bg-[#f0f0f0]">
//           <img
//             src="/src/assets/zx.png"
//             className="h-6 w-6 cursor-pointer"
//             alt="ZX View"
//             onClick={() => handleViewChange("/src/assets/zxview.png")}
//             title="Fornt View"
//           />
//           <img
//             src="/src/assets/zy.png"
//             className="h-6 w-6 cursor-pointer"
//             alt="ZY View"
//             onClick={() => handleViewChange("/src/assets/zyview.png")}
//             title="Side View"
//           />
//           <img
//             src="/src/assets/yx.png"
//             className="h-6 w-6 cursor-pointer"
//             alt="YX View"
//             onClick={() => handleViewChange("/src/assets/yxview.png")}
//             title="Top View"
//           />
//         </div>

//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <input type="checkbox" className="h-3 w-3" id="model" />
//             <label htmlFor="model" className="text-gray-500 text-sm">
//               Model
//             </label>
//           </div>
//           <div className="flex items-center gap-2">
//             <input type="checkbox" className="h-3 w-3" id="beam" />
//             <label htmlFor="beam" className="text-gray-500 text-sm">
//               Beam
//             </label>
//           </div>
//           <div className="flex items-center gap-2">
//             <input type="checkbox" className="h-3 w-3" id="endplate" />
//             <label htmlFor="endplate" className="text-gray-500 text-sm">
//               End Plate
//             </label>
//           </div>
//         </div>
//       </div>

//       {/* Center Area */}
//       <div className="flex-1 grid grid-rows-2">
//         {/* Violet Area */}
//         <div className="bg-[rgb(87,19,100)] border border-gray-500 h-[60vh] relative">
//           <ModelViewer modelUrl="/output-obj.obj" />
          
//           {/* XYZ Axes */}
//           <div className="absolute bottom-2 right-3">
//             <img src={currentView} alt="Current View" className="h-12 w-12" />
//           </div>
//         </div>

//         {/* White Area */}
//         <div
//           className="bg-white border border-blue-500 overflow-y-scroll"
//           style={{ height: "30vh" }}
//         >
//           <p className="text-black text-lg"></p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CenterDock;



import React, { useState ,useEffect} from "react";
import { useDock } from "../context/DockContext";
import ModelViewer from './ModelViewer.jsx';
import { designAPI } from "../api/designAPI";

const CenterDock = () => {
    const { toggleInputDock, toggleOutputDock } = useDock();
    const [currentView, setCurrentView] = useState("/src/assets/xyz.png");
    const [modelUrl, setModelUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchModel = async () => {
            setLoading(true);
            try {
                const response = await designAPI.getOutput();
                
                if (response?.data?.cad_model) {
                    const modelPath = response.data.cad_model;
                    // Check if we have an STL version
                    const stlPath = modelPath.replace('.step', '.stl');
                    
                    // Try STL first, fallback to original path
                    setModelUrl(stlPath);
                    console.log('Loading model from:', stlPath);
                } else {
                    console.warn('No model path in response');
                    setModelUrl(null);
                }
            } catch (error) {
                console.error('Error fetching model:', error);
                setModelUrl(null);
            } finally {
                setLoading(false);
            }
        };

        fetchModel();
    }, []);

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Top Controls */}
            <div className="px-4 border-b bg-[#f1f1f1] flex items-center gap-4">
                <div className="flex gap-1 p-2 bg-[#f0f0f0]">
                    <img
                        src="/src/assets/Leftsidebar.svg"
                        className="h-4 w-4 cursor-pointer bg-white rounded"
                        onClick={toggleInputDock}
                        alt="Toggle Input Dock"
                        title="Left Dock"
                    />
                    <img
                        src="/src/assets/Rightsidebar.svg"
                        className="h-4 w-4 cursor-pointer bg-white rounded"
                        onClick={toggleOutputDock}
                        alt="Toggle Output Dock"
                        title="Right Dock"
                    />
                </div>
                
                {/* View Controls */}
                <div className="flex gap-1 p-2 bg-[#f0f0f0]">
                    <img
                        src="/src/assets/zx.png"
                        className="h-6 w-6 cursor-pointer"
                        alt="ZX View"
                        onClick={() => handleViewChange("/src/assets/zxview.png")}
                        title="Front View"
                    />
                    <img
                        src="/src/assets/zy.png"
                        className="h-6 w-6 cursor-pointer"
                        alt="ZY View"
                        onClick={() => handleViewChange("/src/assets/zyview.png")}
                        title="Side View"
                    />
                    <img
                        src="/src/assets/yx.png"
                        className="h-6 w-6 cursor-pointer"
                        alt="YX View"
                        onClick={() => handleViewChange("/src/assets/yxview.png")}
                        title="Top View"
                    />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" className="h-3 w-3" id="model" />
                        <label htmlFor="model" className="text-gray-500 text-sm">
                            Model
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" className="h-3 w-3" id="beam" />
                        <label htmlFor="beam" className="text-gray-500 text-sm">
                            Beam
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" className="h-3 w-3" id="endplate" />
                        <label htmlFor="endplate" className="text-gray-500 text-sm">
                            End Plate
                        </label>
                    </div>
                </div>
            </div>

            {/* Center Area */}
            <div className="flex-1 grid grid-rows-2">
                {/* Violet Area */}
                <div className="bg-[rgb(87,19,100)] border border-gray-500 h-[60vh] relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
                                <div>Loading model...</div>
                            </div>
                        </div>
                    ) : modelUrl ? (
                        <>
                            <ModelViewer 
                                modelUrl={modelUrl}
                                onError={(error) => console.error("Model viewer error:", error)}
                            />
                            <div className="absolute top-2 left-2 text-white text-xs">
                                Model URL: {modelUrl}
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            No model available
                        </div>
                    )}
                    
                    {/* XYZ Axes */}
                    <div className="absolute bottom-2 right-3">
                        <img src={currentView} alt="Current View" className="h-12 w-12" />
                    </div>
                </div>

                {/* White Area */}
                <div className="bg-white border border-blue-500 overflow-y-scroll h-[30vh]">
                    <p className="text-black text-lg"></p>
                </div>
            </div>
        </div>
    );
};

export default CenterDock;
