import { createContext, useReducer } from 'react';
import ModuleReducer from './ModuleReducer'

/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    ######################################################### 
*/

import axios from 'axios';

//initial state
let initialValue = {
    error_msg : '',
    currentModuleName : '',
    connectivityList : [],
    columnList : [],
    beamList : [],
    materialList : []
}

const BASE_URL = 'http://127.0.0.1:8000/'


//create context
export const ModuleContext = createContext(initialValue);

//provider component
export const ModuleProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ModuleReducer, initialValue);

    // actions
    const getConnectivityList = async (moduleName) => {
        try {
            state.currentModuleName = moduleName
            const response = await axios.get(`${BASE_URL}populate?moduleName=${moduleName}`);
            const data = response.data.connectivityList
            console.log('data : ' , data)
            // dispatch the action to set the connectivityList 
            dispatch({type : 'SET_CONNECTIVITY_LIST' , payload : data})

        }catch(error){
            dispatch({type : 'SET_ERR_MSG_LEAF' , payload : ''})
            console.log('error' , error)
        }
    }

    const getColumnBeamMaterialList = async (moduleName , connectivity) => {
        try{
            const response = await axios.get(`${BASE_URL}populate?moduleName=${moduleName}&connectivity=${connectivity}`)
            const data = response.data
            console.log('data : ' , data)
            // diaptch the action 
            if(connectivity!=='Beam-Beam'){
                dispatch({type : 'SET_COLUMN_BEAM_MATERIAL_LIST' , payload : data})
            }else if(connectivity==='Beam-Beam'){
                dispatch({type : 'SET_BEAM_MATERIAL_LIST' , payload : data})
            }
        }catch(error){
            dispatch({type : 'SET_ERR_MSG_COLUMN_BEAM_MATERIAL' , payload : ''})
            console.log('error : ' , error)
        }
    }

    return (
        <ModuleContext.Provider value={{
            // State variables 
            connectivityList : state.connectivityList,
            beamList : state.beamList,
            columnList : state.columnList,
            materialList : state.materialList,
            currentModuleName : state.currentModuleName,
            error_msg : state.error_msg,
            
            // Thunks
            getConnectivityList,
            getColumnBeamMaterialList
        }}>
            {children}
        </ModuleContext.Provider>
    )
}
