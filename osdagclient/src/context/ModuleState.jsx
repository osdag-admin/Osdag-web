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
    materialList : [],
    sessionCreated : false
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

    const createSession = async () => {
        try{
            const requestData = {'module_id' : 'Fin Plate Connection'}
            const response = await fetch(`${BASE_URL}sessions/create` , {
                method : 'POST',
                mode : 'cors',
                headers : {
                    'Content-Type' : 'application/json'
                },
                credentials : 'include',
                body : JSON.stringify(requestData)
            })

            if (response.status==201){
                console.log('The Session has been set in the cookie')
                state.sessionCreated = true
            }else if(response.status==200){
                console.log('Already in the editing module')
                state.sessionCreated = true
            }else{
                console.log('There is an error in setting a session in the cookie')
                state.sessionCreated = false
            }
        }catch(err){
            console.log('Error in creating a session')
            state.sessionCreated = false
        }
    }

    const deleteSession = async() => {
        try{
            console.log('deleting the session')
            const response = await fetch(`${BASE_URL}sessions/delete` , {
                method : 'POST',
                mode : 'cors',
                headers : {
                    'Content-Type' : 'application/json'
                },
                credentials : 'include'
            })

            const data = await response?.data
            console.log('data : ' , data)
            if(response.status==200){
                console.log('The session has been deleted')
            }else{
                console.log('Error in deleting the session')
            }
        }catch(err){
            console.log('Error in deleting the session from the catch block')
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
            sessionCreated : state.sessionCreated,
            error_msg : state.error_msg,
            
            // Thunks
            getConnectivityList,
            getColumnBeamMaterialList,
            createSession,
            deleteSession
        }}>
            {children}
        </ModuleContext.Provider>
    )
}
