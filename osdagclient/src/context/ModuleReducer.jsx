/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    ######################################################### 
*/

export default (state, action) => {
    switch (action.type) {
        case 'SET_CONNECTIVITY_LIST' : 
            return {
                ...state , 
                connectivityList : action.payload,
                error_msg : 'Error in fetching Connectivity List'
            }
        case 'SET_COLUMN_BEAM_MATERIAL_LIST' : 
            let prev = JSON.parse(localStorage.getItem("osdag-custom-materials"))
            state.materialList = action.payload.materialList
            if(prev == null){
                return{
                    ...state , 
                    columnList : action.payload.columnList,
                    beamList : action.payload.beamList,
                    error_msg : 'Error in fetching Column, Beam and Material List'
                }
            }
            return{
                ...state , 
                columnList : action.payload.columnList,
                beamList : action.payload.beamList,
                materialList : [...state.materialList, ...prev],
                error_msg : 'Error in fetching Column, Beam and Material List'
            }
        case 'SET_BEAM_MATERIAL_LIST':
            console.log("abhi reducer", action.payload);
            const prevCustomMaterials = JSON.parse(localStorage.getItem("osdag-custom-materials")) || [];
            // Remove direct state mutation!
            // state.materialList = action.payload.materialList;
            return {
                ...state,
                sectionProfileList: action.payload.sectionProfileList || [],
                beamList: action.payload.beamList || [],
                materialList: [
                    ...(action.payload.materialList || []),
                    ...prevCustomMaterials
                ],
                angleList: action.payload.angleList || [], 
                channelList: action.payload.channelList || [],
                error_msg: 'Error in fetching Beam and Material List'
            };

        case 'SET_COOKIE_FETCH' : 
            return{
                ...state,
                setTheCookie : !state.setTheCookie
            }
        
        case 'SET_BOLT_DIAMETER_LIST' : 
            console.log("boltList", action.payload)
            return{
                ...state,
                boltDiameterList : action.payload.boltList || [],
            }
           
        case 'SET_THICKNESS_LIST' : 
            return{
                ...state,
                thicknessList : action.payload.thicknessList
            }
        
        case 'SET_PROPERTY_CLASS_LIST' : 
            return{
                ...state,
                propertyClassList : action.payload.propertyClassList
            }
        case 'SET_CLEAT_ANGLE_LIST' : 
            console.log("angleList", action.payload)
            return{
                ...state,
                angleList : action.payload.angleList || [],
            }

    case "SET_BOLT_DIAMETER_LIST":
      return {
        ...state,
        boltDiameterList: action.payload.boltList,
      };

    case "SET_THICKNESS_LIST":
      return {
        ...state,
        thicknessList: action.payload.thicknessList,
      };

    case "SET_PROPERTY_CLASS_LIST":
      return {
        ...state,
        propertyClassList: action.payload.propertyClassList,
      };
    case "SET_CLEAT_ANGLE_LIST":
      console.log("angleList", action.payload);
      return {
        ...state,
        angleList: action.payload.angleList || [],
      };

    case "SET_TOP_ANGLE":
      console.log("topAngleList", action.payload);
      return {
        ...state,
        topAngleList: action.payload.topAngleList || [],
      };

    case "SET_CHANNEL_LIST":
      console.log("channelList", action.payload);
      return {
        ...state,
        channelList: action.payload.channelList || [],
      };

    case "SET_DESIGN_DATA_AND_LOGS":
      return {
        ...state,
        designData: action.payload.data,
        designLogs: action.payload.logs,
      };

    case "SET_RENDER_CAD_MODEL_BOOLEAN":
      return {
        ...state,
        renderCadModel: action.payload,
      };

    case "SET_CAD_MODEL_PATHS":
      return {
        ...state,
        cadModelPaths: action.payload,
      };

    case "SET_REPORT_ID_AND_DISPLAY_PDF":
      return {
        ...state,
        report_id: action.payload,
        displayPDF: true,
      };
    case "SET_BLOBL_URL":
      return {
        ...state,
        blobUrl: action.payload,
      };
    case "SAVE_DESIGN_PREF_DATA":
      return {
        ...state,
        designPrefData: action.payload,
      };
    case "UPDATE_SUPPORTING_ST_DATA":
      let { supporting_section_results } = state.designPrefData;
      supporting_section_results = supporting_section_results[0];

      if (action.payload.includes("Cus")) {
        supporting_section_results.Source = "Custom";
        supporting_section_results.Type = "Welded";
        return {
          ...state,
          designPrefData: {
            ...state.designPrefData,
            supporting_section_results: [supporting_section_results],
          },
        };
      }

      supporting_section_results.Source = "IS808_Rev";
      supporting_section_results.Type = "Rolled";
      return {
        ...state,
        designPrefData: {
          ...state.designPrefData,
          supporting_section_results: [supporting_section_results],
        },
      };
    case "UPDATE_SUPPORTED_ST_DATA":
      let { supported_section_results } = state.designPrefData;
      supported_section_results = supported_section_results[0];

      if (action.payload.includes("Cus")) {
        supported_section_results.Source = "Custom";
        supported_section_results.Type = "Welded";
        return {
          ...state,
          designPrefData: {
            ...state.designPrefData,
            supported_section_results: [supported_section_results],
          },
        };
      }

      supported_section_results.Source = "IS808_Rev";
      supported_section_results.Type = "Rolled";
      return {
        ...state,
        designPrefData: {
          ...state.designPrefData,
          supported_section_results: [supported_section_results],
        },
      };

    case "SAVE_CM_DETAILS":
      return {
        ...state,
        conn_material_details: action.payload,
      };
    case "SAVE_SDM_DETAILS":
      return {
        ...state,
        supported_material_details: action.payload,
      };
    case "SAVE_STM_DETAILS":
      return {
        ...state,
        supporting_material_details: action.payload,
      };
    case "UPDATE_MATERIAL_FROM_CACHES":
      return {
        ...state,
        materialList: [...state.materialList, ...action.payload],
      };
    case "RESET_MODULE_STATE":
      console.log("REDUCER: Resetting module state to initial values");
      return {
        ...state,
        // Reset all the design-related state that persists
        designData: {},
        designLogs: [],
        renderCadModel: false,
        cadModelPaths: {},
        displayPDF: false,
        report_id: "",
        blobUrl: "",
        designPrefData: {},
      };
    default:
      return state;
  }
};
