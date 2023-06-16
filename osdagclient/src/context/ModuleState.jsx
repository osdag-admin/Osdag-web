import { createContext, useReducer } from 'react';
import ModuleReducer from './ModuleReducer'

/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    ######################################################### 
*/


//initial state
let initialValue = {
    error_msg : '',
    currentModuleName : '',
    connectivityList : [],
    columnList : [],
    beamList : [],
    materialList : [],
    boltDiameterList : [],
    thicknessList : [],
    propertyClassList : [],
    sessionCreated : false,
    sendNextRequests : false,
    setTheCookie : false,
    connectivityListObtained : false
}

const BASE_URL = 'http://127.0.0.1:8000/'


//create context
export const ModuleContext = createContext(initialValue);

//provider component
export const ModuleProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ModuleReducer, initialValue);

    const cookieSetter = async () => {
        dispatch({type : 'SET_COOKIE_FETCH' , payload : '' })
    }

    // actions
    const getConnectivityList = async (moduleName) => {
        try {
            state.currentModuleName = moduleName
            const response = await fetch(`${BASE_URL}populate?moduleName=${moduleName}` , {
                method : 'GET',
                mode : 'cors',
                credentials : 'include'
            });
            const jsonResponse = await response?.json()
            const data = jsonResponse.connectivityList
            // dispatch the action to set the connectivityList 
            dispatch({type : 'SET_CONNECTIVITY_LIST' , payload : data})
            state.connectivityListObtained = true

        }catch(error){
            dispatch({type : 'SET_ERR_MSG_LEAF' , payload : ''})
            console.log('error' , error)
        }
    }

    const getColumnBeamMaterialList = async (moduleName , connectivity) => {
        try{
            const response = await fetch(`${BASE_URL}populate?moduleName=${moduleName}&connectivity=${connectivity}` , {
                method : 'GET',
                mode : 'cors',
                credentials : 'include'
            })
            const jsonResponse = await response?.json()

            // diaptch the action 
            if(connectivity!=='Beam-Beam'){
                dispatch({type : 'SET_COLUMN_BEAM_MATERIAL_LIST' , payload : jsonResponse})
            }else if(connectivity==='Beam-Beam'){
                dispatch({type : 'SET_BEAM_MATERIAL_LIST' , payload : jsonResponse})
            }
        }catch(error){
            dispatch({type : 'SET_ERR_MSG_COLUMN_BEAM_MATERIAL' , payload : ''})
            console.log('error : ' , error)
        }
    }

    const getBoltDiameterList = async () => {
        try{
            const response = await fetch(`${BASE_URL}populate?moduleName=${state.currentModuleName}&boltDiameter=Customized` , {
                method : 'GET',
                mode : 'cors',
                credentials : 'include'
            });
            const jsonResponse = await response?.json()
            dispatch({type : 'SET_BOLT_DIAMETER_LIST' , payload : jsonResponse})

        }catch(error){
            console.log('error : ' , error)
        }
        
    }

    const getThicknessList = async() => {
        try{
            const response = await fetch(`${BASE_URL}populate?moduleName=${state.currentModuleName}&thickness=Customized` , {
                method : 'GET',
                mode : 'cors',
                credentials : 'include'
            });
            const jsonResponse = await response?.json()
            dispatch({type : 'SET_THICKNESS_LIST', payload : jsonResponse})

        }catch(error){
            console.log('error : ' , error)
        }
    }

    const getPropertyClassList = async() => {
        try{
            const response = await fetch(`${BASE_URL}populate?moduleName=${state.currentModuleName}&propertyClass=Customized` , {
                method : 'GET',
                mode : 'cors',
                credentials : 'include'
            });
            const jsonResponse = await response?.json()
            console.log('propertyClassList : ' ,  jsonResponse)
            dispatch({type : 'SET_PROPERTY_CLASS_LIST' , payload : jsonResponse})
        }catch(error){
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

            const data = await response.json()
            if(data['status']=='set'){
                // fetch the connectivityList 
                getConnectivityList('Fin-Plate-Connection')
                getColumnBeamMaterialList(state.currentModuleName , 'Column-Flange-Beam-Web')
                getBoltDiameterList()
                getThicknessList()
                getPropertyClassList()

            }else{
                state.sendNextRequests = false
            }


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
            const response = await fetch(`${BASE_URL}sessions/delete` , {
                method : 'POST',
                mode : 'cors',
                headers : {
                    'Content-Type' : 'application/json'
                },
                credentials : 'include'
            })
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
            boltDiameterList : state.boltDiameterList,
            thicknessList : state.thicknessList,
            propertyClassList : state.propertyClassList,
            sessionCreated : state.sessionCreated,
            sendNextRequests : state.sendNextRequests,
            setTheCookie : state.setTheCookie,
            error_msg : state.error_msg,

            // actions
            cookieSetter,
            
            // Thunks
            getConnectivityList,
            getColumnBeamMaterialList,
            getThicknessList,
            getBoltDiameterList,
            getPropertyClassList,
            createSession,
            deleteSession
        }}>
            {children}
        </ModuleContext.Provider>
    )
}
