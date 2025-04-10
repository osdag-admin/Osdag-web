// import axios from 'axios';

// const BASE_URL = 'http://127.0.0.1:8000/api/';

// const handleApiError = (error) => {
//   if (error.response) {
//     throw error;
//   } else if (error.request) {
//     throw new Error('Network error - no response received');
//   } else {
//     throw new Error('Error setting up request');
//   }
// };

// // Add timeout configuration
// const axiosConfig = {
//   timeout: 30000, // 30 seconds timeout
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// };

// export const designAPI = {
//   createSession: async () => {
//     try {
//       const response = await axios.post(
//         `${BASE_URL}sessions/create/`,  // Make sure this matches the URL pattern
//         { module_id: 'End Plate Connection' },
//         axiosConfig
//       );
//       return response.data;
//     } catch (error) {
//       handleApiError(error);
//     }
//   },

//   submitDesign: async (designData) => {
//     try {
//       // Use BASE_URL instead of relative path
//       const response = await axios.post(
//         `${BASE_URL}design/end-plate/`,
//         designData,
//         axiosConfig
//       );
//       return response;
//     } catch (error) {
//       console.error('API Error:', error);
//       throw error;
//     }
//   },

//   getOutput: async () => {
//     try {
//         const response = await axios.get(
//             `${BASE_URL}design/end-plate/`,
//             {
//                 ...axiosConfig,
//                 responseType: 'blob' // For handling 3D model files
//             }
//         );

//         // Create blob URL from response
//         const blob = new Blob([response.data], { 
//             type: response.headers['content-type'] 
//         });
//         const url = window.URL.createObjectURL(blob);
        
//         // Return both the blob URL and raw data
//         return {
//             modelUrl: url,
//             data: response.data
//         };
//     } catch (error) {
//         handleApiError(error);
//     }
//   }
// };


import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api/';

const handleApiError = (error) => {
  if (error.response) {
    throw error;
  } else if (error.request) {
    throw new Error('Network error - no response received');
  } else {
    throw new Error('Error setting up request');
  }
};

// Add timeout configuration
const axiosConfig = {
  timeout: 30000, // 30 seconds timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
};

export const designAPI = {
  createSession: async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}sessions/create/`,  // Make sure this matches the URL pattern
        { module_id: 'End Plate Connection' },
        axiosConfig
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  submitDesign: async (designData) => {
    try {
      // Use BASE_URL instead of relative path
      const response = await axios.post(
        `${BASE_URL}design/end-plate/`,
        designData,
        axiosConfig
      );
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getOutput: async () => {
    try {
        const response = await axios.get(
            `${BASE_URL}design/end-plate/`,
            {
                ...axiosConfig,
                responseType: 'blob' // For handling 3D model files
            }
        );

        // Create blob URL from response
        const blob = new Blob([response.data], { 
            type: response.headers['content-type'] 
        });
        const url = window.URL.createObjectURL(blob);
        
        // Return both the blob URL and raw data
        return {
            modelUrl: url,
            data: response.data
        };
    } catch (error) {
        handleApiError(error);
    }
  }
};
