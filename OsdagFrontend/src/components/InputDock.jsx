// import React, { useState } from 'react';
// import Draggable from 'react-draggable';
// import { useDock } from '../context/DockContext';
// import CustomizedPopup from './CustomizedPopup';
// import closeIcon from "../assets/close.png";
// import minimizeIcon from "../assets/minimize.png";
// import { designAPI } from '../api/designAPI';

// function InputDock() {
//   const { isInputDockVisible } = useDock();
//   const [showPopup, setShowPopup] = useState(false);
//   const [popupData, setPopupData] = useState([]);
//   const [selectedEndPlateType, setSelectedEndPlateType] = useState('Flushed - Reversib Moment'); // Default option
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [isClosed, setIsClosed] = useState(false);
//   const [inputs, setInputs] = useState({
//     connectivity: "Coplanar Tension-Compression Flange",
//     endPlateType: "Flushed - Reversib Moment",
//     beamSection: "",
//     material: "E 165 (Fe 290)",
//     bendingMoment: "",
//     shearForce: "",
//     axialForce: "",
//     boltDiameter: [],
//     boltType: "Bearing Bolt",
//     propertyClass: [],
//     endPlateThickness: [],
//     weldType: "Groove Weld"
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [currentCustomType, setCurrentCustomType] = useState('');

//   const data = {
//     thickness: ['8', '10', '12', '14', '16', '18', '20', '24', '27', '30', '33', '36', '39', '42', '45', '48', '52', '56', '60', '64'],
//     diameter: ['8', '10', '12', '14', '16', '18', '20', '24', '27', '30', '33', '36', '39', '42', '45', '48', '52', '56', '60', '64'], // Corrected
//     propertyClass: ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9'] // Corrected
//   };

//   const handleCustomizedSelection = (type) => {
//     setCurrentCustomType(type);
//     setPopupData(data[type]);
//     setShowPopup(true);
//   };

//   const handleCustomizedSelectionComplete = (type, selectedValues) => {
//     console.log(`Selected ${type} values:`, selectedValues); // Add logging
//     const fieldMap = {
//       'diameter': 'boltDiameter',
//       'propertyClass': 'propertyClass',
//       'thickness': 'endPlateThickness'
//     };

//     const field = fieldMap[type];
//     if (field) {
//       handleInputChange(field, selectedValues);
//     }
//     setShowPopup(false);
//   };

//   const handleEndPlateTypeChange = (e) => {
//     const value = e.target.value;
//     setSelectedEndPlateType(value);
//     handleInputChange('endPlateType', value);
//   };

//   const handleInputChange = (field, value) => {
//     setInputs(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const validateInputFormat = (inputs) => {
//     if (!inputs.beamSection) {
//         throw new Error('Please select a Beam Section');
//     }

//     if (typeof inputs.shearForce !== 'number' || inputs.shearForce <= 0) {
//         throw new Error('Shear Force must be a positive number');
//     }

//     if (inputs.bendingMoment && isNaN(inputs.bendingMoment)) {
//         throw new Error('Bending Moment must be a valid number');
//     }

//     if (inputs.axialForce && isNaN(inputs.axialForce)) {
//         throw new Error('Axial Force must be a valid number');
//     }

//     if (inputs.boltDiameter.length === 0) {
//         throw new Error('Please select Bolt Diameter');
//     }

//     if (inputs.propertyClass.length === 0) {
//         throw new Error('Please select Property Class');
//     }

//     if (inputs.endPlateThickness.length === 0) {
//         throw new Error('Please select End Plate Thickness');
//     }
//   };

//   const handleDesign = async () => {
//     try {
//       setError(null);
//       setLoading(true);

//       // Validate required fields
//       const requiredFields = validateInputs();
//       if (requiredFields.length > 0) {
//         throw new Error(`Missing required fields: ${requiredFields.join(', ')}`);
//       }

//       // Validate input format
//       validateInputFormat(inputs);

//       // Log the input values
//       console.log('Design Input Values:', {
//         connectivity: inputs.connectivity,
//         endPlateType: inputs.endPlateType,
//         beamSection: inputs.beamSection,
//         material: inputs.material,
//         loads: {
//           bendingMoment: inputs.bendingMoment,
//           shearForce: inputs.shearForce,
//           axialForce: inputs.axialForce
//         },
//         bolt: {
//           diameter: inputs.boltDiameter,
//           type: inputs.boltType,
//           propertyClass: inputs.propertyClass
//         },
//         endPlate: {
//           thickness: inputs.endPlateThickness
//         },
//         weldType: inputs.weldType
//       });

//       // Create session
//       await designAPI.createSession();

//       // Submit design inputs
//       const designResponse = await designAPI.submitDesign(inputs);

//       // Get output
//       const output = await designAPI.getOutput();

//       // Handle successful output
//       console.log('Design output:', output);

//     } catch (error) {
//       setError(error.message || 'An unexpected error occurred');
//       console.error('Design process failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateInputs = () => {
//     const required = [];

//     if (!inputs.connectivity) required.push('Connectivity');
//     if (!inputs.endPlateType) required.push('End Plate Type');
//     if (!inputs.beamSection) required.push('Beam Section');
//     if (!inputs.material) required.push('Material');
//     if (!inputs.shearForce) required.push('Shear Force');
//     if (!inputs.boltDiameter.length) required.push('Bolt Diameter');
//     if (!inputs.boltType) required.push('Bolt Type');
//     if (!inputs.propertyClass.length) required.push('Property Class');
//     if (!inputs.endPlateThickness.length) required.push('End Plate Thickness');
//     if (!inputs.weldType) required.push('Weld Type');

//     return required;
//   };

//   const handleReset = () => {
//     setInputs({
//       connectivity: "Coplanar Tension-Compression Flange",
//       endPlateType: "Flushed - Reversib Moment",
//       beamSection: "",
//       material: "E 165 (Fe 290)",
//       bendingMoment: "",
//       shearForce: "",
//       axialForce: "",
//       boltDiameter: [],
//       boltType: "Bearing Bolt",
//       propertyClass: [],
//       endPlateThickness: [],
//       weldType: "Groove Weld"
//     });
//   };

//   if (!isInputDockVisible || isClosed) return null;

//   return (
//     <div className="h-full relative ">
//       {isMinimized ? (
//         <Draggable
//           bounds="parent"
//           handle=".drag-handle"
//           defaultPosition={{x: 20, y: 20}}
//         >
//           <div className="absolute bg-[#f1f1f1] p-2 border border-gray-400 rounded-[2px] shadow-md w-60 z-50">
//             <div className="flex justify-between items-center bg-[#f0f0f0] p-2 drag-handle cursor-move">
//               <h2 className="text-[11px]">Input Dock</h2>
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
//             <h2 className="text-[11px]">Input Dock</h2>
//             <div className="flex gap-2">
//               <button title="Minimize" onClick={() => setIsMinimized(true)}>
//                 <img src={minimizeIcon} alt="Minimize" className="w-4 h-4" />
//               </button>
//               <button title="Close" onClick={() => setIsClosed(true)}>
//                 <img src={closeIcon} alt="Close" className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//           <div className="bg-[#f1f1f1] p-2 border border-gray-400 rounded-[2px] shadow-md w-80 max-w-md relative">
//             <div className="overflow-y-scroll" style={{ maxHeight: "70vh" }}>
//               <h2 className="text-[14px] font-bold mb-2">Connecting Members</h2>

//               <div className="space-y-0">
//                 {/* Connectivity */}
//                 <div className="flex flex-row gap-[40px]">
//                   <label className="font-medium mb-2 text-[12px]">
//                     Connectivity <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                     value={inputs.connectivity}
//                     onChange={(e) => handleInputChange('connectivity', e.target.value)}
//                   >
//                     <option>Coplanar Tension-Compression Flange</option>
//                     <option>Coplanar Tension Flange</option>
//                     <option>Coplanar Compression Flange</option>
//                   </select>
//                 </div>

//                 {/* End Plate Type */}
//                 <div className="flex flex-row gap-[30px] ">
//                   <label className="font-medium  mb-2 text-[12px]">
//                     End Plate Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     className="border border-gray-300 text-gray-800 w-32 rounded-[4px] p-0 size-1/4 text-[12px] "
//                     value={selectedEndPlateType}
//                     onChange={handleEndPlateTypeChange}
//                   >
//                     <option>Flushed - Reversib Moment</option>
//                     <option>Extended one Way - Irresversible Moment</option>
//                     <option>Extended both Way - Resversible Moment</option>
//                   </select>
//                 </div>
//                 <div className="felx mt-4 w-[80px]">
//                   <img
//                     src={`/src/assets/${selectedEndPlateType}.png`}
//                     alt={selectedEndPlateType}
//                     className="w-full h-20 object-contain border rounded-[4px]"
//                   />
//                 </div>

//                 {/* Beam Section */}
//                 <div className="flex flex-row gap-[40px] ">
//                   <label className="font-medium mb-2 text-[12px]">
//                     Beam Section <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     className="border border-gray-300 text-gray-800 w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                     value={inputs.beamSection}
//                     onChange={(e) => handleInputChange('beamSection', e.target.value)}
//                   >
//                     <option value="">Select Section</option>
//                     <option value="JB 150">JB 150</option>
//                     <option value="JB 175">JB 175</option>
//                     <option value="JB 200">JB 200</option>
//                     <option value="JB 225">JB 225</option>
//                   </select>
//                 </div>

//                 {/* Material */}
//                 <div className="flex flex-row gap-[70px]">
//                   <label className="font-medium mb-2 text-[12px]">
//                     Material <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                     value={inputs.material}
//                     onChange={(e) => handleInputChange('material', e.target.value)}
//                   >
//                     <option value="E 165 (Fe 290)">E 165 (Fe 290)</option>
//                     <option value="E 250 (Fe 410W)A">E 250 (Fe 410W)A</option>
//                     <option value="E 250 (Fe 410)B">E 250 (Fe 410)B</option>
//                     <option value="E 250 (Fe 410)C">E 250 (Fe 410)C</option>
//                     <option value="E 300 (Fe 440)">E 300 (Fe 440)</option>
//                   </select>
//                 </div>

//                 {/* Factored Loads */}
//                 <div>
//                   <h3 className="font-bold text-[12px] mb-3">Factored Loads</h3>
//                   <div className="space-y-3">
//                     <div className="flex flex-row gap-[0px]">
//                       <label className="font-medium mb-1 text-[12px]">Bending Moment (kNm)</label>
//                       <input
//                         type="number"
//                         value={inputs.bendingMoment}
//                         onChange={(e) => handleInputChange('bendingMoment', Number(e.target.value))}
//                         className="border border-blue-500 w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                       />
//                     </div>
//                     <div className="flex flex-row gap-[25px]">
//                       <label className="font-medium mb-1 text-[12px]">
//                         Shear Force (kN) <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="number"
//                         className="border border-blue-500 w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                         value={inputs.shearForce}
//                         onChange={(e) => handleInputChange('shearForce', Number(e.target.value))}
//                       />
//                     </div>
//                     <div className="flex flex-row gap-[38px]">
//                       <label className="font-medium mb-1 text-[12px]">Axial Force (kN)</label>
//                       <input
//                         type="number"
//                         value={inputs.axialForce}
//                         onChange={(e) => handleInputChange('axialForce', Number(e.target.value))}
//                         className="border border-blue-500 w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Bolt */}
//                 <div>
//                   <h3 className="font-bold text-[12px]  mb-3">Bolt</h3>
//                   <div className="space-y-3">
//                     <div className="flex flex-row gap-[32px]">
//                       <label className="font-medium mb-1 text-[12px]">
//                         Diameter (mm) <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                         onChange={(e) => e.target.value === 'Customized' && handleCustomizedSelection('diameter')}
//                       >
//                         <option>All</option>
//                         <option>Customized</option>
//                       </select>
//                     </div>
//                     <div className="flex flex-row gap-[90px]">
//                       <label className="font-medium mb-1 text-[12px]">
//                         Type <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                         value={inputs.boltType}
//                         onChange={(e) => handleInputChange('boltType', e.target.value)}
//                       >
//                         <option value="Bearing Bolt">Bearing Bolt</option>
//                         <option value="Friction Grip Bolt">Friction Grip Bolt</option>
//                       </select>
//                     </div>
//                     <div className="flex flex-row gap-[37px]">
//                       <label className="font-medium mb-1 text-[12px]">
//                         Property Class <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                         onChange={(e) => e.target.value === 'Customized' && handleCustomizedSelection('propertyClass')}
//                       >
//                         <option>All</option>
//                         <option>Customized</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 {/* End Plate */}
//                 <div>
//                   <h3 className="font-bold text-[12px]  mb-3">End Plate</h3>
//                   <div className="flex flex-row gap-[30px]">
//                     <label className="font-medium mb-1 text-[12px]">
//                       Thickness (mm) <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
//                       onChange={(e) => e.target.value === 'Customized' && handleCustomizedSelection('thickness')}
//                     >
//                       <option>All</option>
//                       <option>Customized</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Weld */}
//                 <div>
//                   <h3 className="font-bold text-[12px]  mb-3">Weld</h3>
//                   <div className="flex flex-row gap-[90px]">
//                     <label className="font-medium mb-1 text-[12px]">
//                       Type <span className="text-red-500">*</span>
//                     </label>
//                     <select className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]">
//                       <option>Groove Weld</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
//                 <span className="block sm:inline">{error}</span>
//               </div>
//             )}

//             <div className="flex gap-4 mt-6 py-4 w-full max-w-md">
//               <button
//                 className="bg-[#a36666] text-white px-2 rounded hover:bg-[#8c5555] transition-colors w-full"
//                 onClick={handleReset}
//                 disabled={loading}
//               >
//                 Reset
//               </button>
//               <button
//                 className={`bg-[#a36666] text-white px-2 rounded hover:bg-[#8c5555] transition-colors w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                 onClick={handleDesign}
//                 disabled={loading}
//               >
//                 {loading ? 'Calculating...' : 'Design'}
//               </button>
//             </div>

//             {showPopup && (
//               <CustomizedPopup
//                 onClose={() => setShowPopup(false)}
//                 initialData={popupData}
//                 onSelect={(values) => handleCustomizedSelectionComplete(currentCustomType, values)}
//               />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default InputDock;

import React, { useState } from "react";
import Draggable from "react-draggable";
import { useDock } from "../context/DockContext";
import CustomizedPopup from "./CustomizedPopup";
import closeIcon from "../assets/close.png";
import minimizeIcon from "../assets/minimize.png";
import { designAPI } from "../api/designAPI";

function InputDock() {
  const { isInputDockVisible } = useDock();
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState([]);
  const [selectedEndPlateType, setSelectedEndPlateType] = useState(
    "Flushed - Reversib Moment"
  ); // Default option
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [inputs, setInputs] = useState({
    connectivity: "Coplanar Tension-Compression Flange",
    endPlateType: "Flushed - Reversib Moment",
    beamSection: "",
    material: "E 165 (Fe 290)",
    bendingMoment: "",
    shearForce: "",
    axialForce: "",
    boltDiameter: [],
    boltType: "Bearing Bolt",
    propertyClass: [],
    endPlateThickness: [],
    weldType: "Groove Weld",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentCustomType, setCurrentCustomType] = useState("");

  const data = {
    thickness: [
      "8",
      "10",
      "12",
      "14",
      "16",
      "18",
      "20",
      "24",
      "27",
      "30",
      "33",
      "36",
      "39",
      "42",
      "45",
      "48",
      "52",
      "56",
      "60",
      "64",
    ],
    diameter: [
      "8",
      "10",
      "12",
      "14",
      "16",
      "18",
      "20",
      "24",
      "27",
      "30",
      "33",
      "36",
      "39",
      "42",
      "45",
      "48",
      "52",
      "56",
      "60",
      "64",
    ], // Corrected
    propertyClass: [
      "3.6",
      "4.6",
      "4.8",
      "5.6",
      "5.8",
      "6.8",
      "8.8",
      "9.8",
      "10.9",
      "12.9",
    ], // Corrected
  };

  const handleCustomizedSelection = (type) => {
    setCurrentCustomType(type);
    setPopupData(data[type]);
    setShowPopup(true);
  };

  const handleCustomizedSelectionComplete = (type, selectedValues) => {
    console.log(`Selected ${type} values:`, selectedValues); // Add logging
    const fieldMap = {
      diameter: "boltDiameter",
      propertyClass: "propertyClass",
      thickness: "endPlateThickness",
    };

    const field = fieldMap[type];
    if (field) {
      handleInputChange(field, selectedValues);
    }
    setShowPopup(false);
  };

  const handleEndPlateTypeChange = (e) => {
    const value = e.target.value;
    setSelectedEndPlateType(value);
    handleInputChange("endPlateType", value);
  };

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateInputFormat = (inputs) => {
    if (!inputs.beamSection) {
      throw new Error("Please select a Beam Section");
    }

    if (typeof inputs.shearForce !== "number" || inputs.shearForce <= 0) {
      throw new Error("Shear Force must be a positive number");
    }

    if (inputs.bendingMoment && isNaN(inputs.bendingMoment)) {
      throw new Error("Bending Moment must be a valid number");
    }

    if (inputs.axialForce && isNaN(inputs.axialForce)) {
      throw new Error("Axial Force must be a valid number");
    }

    if (inputs.boltDiameter.length === 0) {
      throw new Error("Please select Bolt Diameter");
    }

    if (inputs.propertyClass.length === 0) {
      throw new Error("Please select Property Class");
    }

    if (inputs.endPlateThickness.length === 0) {
      throw new Error("Please select End Plate Thickness");
    }
  };

  const handleDesign = async () => {
    try {
      setError(null);
      setLoading(true);

      // Validate inputs
      const { isValid, missingFields, inputData } = validateAndGetInput(inputs);

      if (!isValid) {
        setError(`Please provide the following required fields: ${missingFields.join(", ")}`);
        return;
      }

      // Format data for API
      const designData = {
        connectivity: inputData.connectivity,
        endPlateType: inputData.endPlateType,
        beamSection: inputData.beamSection,
        material: inputData.material,
        bendingMoment: inputData.bendingMoment,
        shearForce: inputData.shearForce,
        axialForce: inputData.axialForce,
        boltDiameter: inputData.boltDiameter,
        boltType: inputData.boltType,
        propertyClass: inputData.propertyClass,
        endPlateThickness: inputData.endPlateThickness,
        weldType: inputData.weldType
      };

      // Log the request payload
      console.log('Submitting design with data:', designData);

      // Make API call
      const response = await designAPI.submitDesign(designData);

      // Handle successful response
      console.log('Design response:', response);

      if (response.data && response.data.status === 'success') {
        // Handle success
        console.log('Design output:', response.data.data);
      } else {
        throw new Error(response.data?.error || 'Design calculation failed');
      }

    } catch (error) {
      console.error('Design process failed:', error);
      setError(error.response?.data?.error || error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateAndGetInput = (inputs) => {
    const missingFields = [];

    // Validate numeric values
    const validateNumber = (value) => {
        return value !== null && value !== undefined && value !== "" && !isNaN(value);
    };

    // Required field validations with proper type checking
    if (!validateNumber(inputs.shearForce)) missingFields.push("Shear Force");
    if (!validateNumber(inputs.bendingMoment)) missingFields.push("Bending Moment");
    if (!validateNumber(inputs.axialForce)) missingFields.push("Axial Force");
    if (!inputs.beamSection) missingFields.push("Beam Section");
    if (!inputs.material) missingFields.push("Material");
    if (!inputs.boltType) missingFields.push("Bolt Type");
    if (!inputs.weldType) missingFields.push("Weld Type");

    // Array validations
    if (!inputs.boltDiameter || !Array.isArray(inputs.boltDiameter) || inputs.boltDiameter.length === 0) {
        missingFields.push("Bolt Diameter");
    }
    if (!inputs.propertyClass || !Array.isArray(inputs.propertyClass) || inputs.propertyClass.length === 0) {
        missingFields.push("Property Class");
    }
    if (!inputs.endPlateThickness || !Array.isArray(inputs.endPlateThickness) || inputs.endPlateThickness.length === 0) {
        missingFields.push("End Plate Thickness");
    }

    // Format validation ensuring arrays contain strings that can be converted to numbers
    const inputData = {
        connectivity: inputs.connectivity || "Coplanar Tension-Compression Flange",
        endPlateType: inputs.endPlateType || "Flushed - Reversib Moment",
        beamSection: inputs.beamSection,
        material: inputs.material,
        bendingMoment: validateNumber(inputs.bendingMoment) ? inputs.bendingMoment.toString() : "0",
        shearForce: validateNumber(inputs.shearForce) ? inputs.shearForce.toString() : "0",
        axialForce: validateNumber(inputs.axialForce) ? inputs.axialForce.toString() : "0",
        boltDiameter: inputs.boltDiameter.map(String),
        boltType: inputs.boltType,
        propertyClass: inputs.propertyClass.map(String),
        endPlateThickness: inputs.endPlateThickness.map(String),
        weldType: inputs.weldType
    };

    return { isValid: missingFields.length === 0, missingFields, inputData };
};

  const handleReset = () => {
    setInputs({
      connectivity: "Coplanar Tension-Compression Flange",
      endPlateType: "Flushed - Reversib Moment",
      beamSection: "",
      material: "E 165 (Fe 290)",
      bendingMoment: "",
      shearForce: "",
      axialForce: "",
      boltDiameter: [],
      boltType: "Bearing Bolt",
      propertyClass: [],
      endPlateThickness: [],
      weldType: "Groove Weld",
    });
  };

  if (!isInputDockVisible || isClosed) return null;

  return (
    <div className="h-full relative ">
      {isMinimized ? (
        <Draggable
          bounds="parent"
          handle=".drag-handle"
          defaultPosition={{ x: 20, y: 20 }}
        >
          <div className="absolute bg-[#f1f1f1] p-2 border border-gray-400 rounded-[2px] shadow-md w-60 z-50">
            <div className="flex justify-between items-center bg-[#f0f0f0] p-2 drag-handle cursor-move">
              <h2 className="text-[11px]">Input Dock</h2>
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
            <h2 className="text-[11px]">Input Dock</h2>
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
            <div className="overflow-y-scroll" style={{ maxHeight: "70vh" }}>
              <h2 className="text-[14px] font-bold mb-2">Connecting Members</h2>

              <div className="space-y-0">
                {/* Connectivity */}
                <div className="flex flex-row gap-[40px]">
                  <label className="font-medium mb-2 text-[12px]">
                    Connectivity <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                    value={inputs.connectivity}
                    onChange={(e) =>
                      handleInputChange("connectivity", e.target.value)
                    }
                  >
                    <option>Coplanar Tension-Compression Flange</option>
                    <option>Coplanar Tension Flange</option>
                    <option>Coplanar Compression Flange</option>
                  </select>
                </div>

                {/* End Plate Type */}
                <div className="flex flex-row gap-[30px] ">
                  <label className="font-medium  mb-2 text-[12px]">
                    End Plate Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="border border-gray-300 text-gray-800 w-32 rounded-[4px] p-0 size-1/4 text-[12px] "
                    value={selectedEndPlateType}
                    onChange={handleEndPlateTypeChange}
                  >
                    <option>Flushed - Reversib Moment</option>
                    <option>Extended one Way - Irresversible Moment</option>
                    <option>Extended both Way - Resversible Moment</option>
                  </select>
                </div>
                <div className="felx mt-4 w-[80px]">
                  <img
                    src={`/src/assets/${selectedEndPlateType}.png`}
                    alt={selectedEndPlateType}
                    className="w-full h-20 object-contain border rounded-[4px]"
                  />
                </div>

                {/* Beam Section */}
                <div className="flex flex-row gap-[40px] ">
                  <label className="font-medium mb-2 text-[12px]">
                    Beam Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="border border-gray-300 text-gray-800 w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                    value={inputs.beamSection}
                    onChange={(e) =>
                      handleInputChange("beamSection", e.target.value)
                    }
                  >
                    <option value="">Select Section</option>
                    <option value="JB 150">JB 150</option>
                    <option value="JB 175">JB 175</option>
                    <option value="JB 200">JB 200</option>
                    <option value="JB 225">JB 225</option>
                  </select>
                </div>

                {/* Material */}
                <div className="flex flex-row gap-[70px]">
                  <label className="font-medium mb-2 text-[12px]">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                    value={inputs.material}
                    onChange={(e) =>
                      handleInputChange("material", e.target.value)
                    }
                  >
                    <option value="E 165 (Fe 290)">E 165 (Fe 290)</option>
                    <option value="E 250 (Fe 410W)A">E 250 (Fe 410W)A</option>
                    <option value="E 250 (Fe 410)B">E 250 (Fe 410)B</option>
                    <option value="E 250 (Fe 410)C">E 250 (Fe 410)C</option>
                    <option value="E 300 (Fe 440)">E 300 (Fe 440)</option>
                  </select>
                </div>

                {/* Factored Loads */}
                <div>
                  <h3 className="font-bold text-[12px] mb-3">Factored Loads</h3>
                  <div className="space-y-3">
                    <div className="flex flex-row gap-[0px]">
                      <label className="font-medium mb-1 text-[12px]">
                        Bending Moment (kNm)
                      </label>
                      <input
                        type="number"
                        value={inputs.bendingMoment}
                        onChange={(e) =>
                          handleInputChange(
                            "bendingMoment",
                            Number(e.target.value)
                          )
                        }
                        className="border border-blue-500 w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                      />
                    </div>
                    <div className="flex flex-row gap-[25px]">
                      <label className="font-medium mb-1 text-[12px]">
                        Shear Force (kN) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="border border-blue-500 w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                        value={inputs.shearForce}
                        onChange={(e) =>
                          handleInputChange(
                            "shearForce",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="flex flex-row gap-[38px]">
                      <label className="font-medium mb-1 text-[12px]">
                        Axial Force (kN)
                      </label>
                      <input
                        type="number"
                        value={inputs.axialForce}
                        onChange={(e) =>
                          handleInputChange(
                            "axialForce",
                            Number(e.target.value)
                          )
                        }
                        className="border border-blue-500 w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bolt */}
                <div>
                  <h3 className="font-bold text-[12px]  mb-3">Bolt</h3>
                  <div className="space-y-3">
                    <div className="flex flex-row gap-[32px]">
                      <label className="font-medium mb-1 text-[12px]">
                        Diameter (mm) <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                        onChange={(e) =>
                          e.target.value === "Customized" &&
                          handleCustomizedSelection("diameter")
                        }
                      >
                        <option>All</option>
                        <option>Customized</option>
                      </select>
                    </div>
                    <div className="flex flex-row gap-[90px]">
                      <label className="font-medium mb-1 text-[12px]">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                        value={inputs.boltType}
                        onChange={(e) =>
                          handleInputChange("boltType", e.target.value)
                        }
                      >
                        <option value="Bearing Bolt">Bearing Bolt</option>
                        <option value="Friction Grip Bolt">
                          Friction Grip Bolt
                        </option>
                      </select>
                    </div>
                    <div className="flex flex-row gap-[37px]">
                      <label className="font-medium mb-1 text-[12px]">
                        Property Class <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                        onChange={(e) =>
                          e.target.value === "Customized" &&
                          handleCustomizedSelection("propertyClass")
                        }
                      >
                        <option>All</option>
                        <option>Customized</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* End Plate */}
                <div>
                  <h3 className="font-bold text-[12px]  mb-3">End Plate</h3>
                  <div className="flex flex-row gap-[30px]">
                    <label className="font-medium mb-1 text-[12px]">
                      Thickness (mm) <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]"
                      onChange={(e) =>
                        e.target.value === "Customized" &&
                        handleCustomizedSelection("thickness")
                      }
                    >
                      <option>All</option>
                      <option>Customized</option>
                    </select>
                  </div>
                </div>

                {/* Weld */}
                <div>
                  <h3 className="font-bold text-[12px]  mb-3">Weld</h3>
                  <div className="flex flex-row gap-[90px]">
                    <label className="font-medium mb-1 text-[12px]">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select className="border w-32 rounded-[4px] p-0 size-1/4 text-[12px]">
                      <option>Groove Weld</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="flex gap-4 mt-6 py-4 w-full max-w-md">
              <button
                className="bg-[#a36666] text-white px-2 rounded hover:bg-[#8c5555] transition-colors w-full"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </button>
              <button
                className={`bg-[#a36666] text-white px-2 rounded hover:bg-[#8c5555] transition-colors w-full ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleDesign}
                disabled={loading}
              >
                {loading ? "Calculating..." : "Design"}
              </button>
            </div>

            {showPopup && (
              <CustomizedPopup
                onClose={() => setShowPopup(false)}
                initialData={popupData}
                onSelect={(values) =>
                  handleCustomizedSelectionComplete(currentCustomType, values)
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InputDock;
