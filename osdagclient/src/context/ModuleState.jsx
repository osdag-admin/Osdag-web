import { createContext, useReducer } from 'react';
import ModuleReducer from './ModuleReducer'



/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    ######################################################### 
*/



//initial state
let initialValue = {
    error_msg: '',
    currentModuleName: '',
    connectivityList: [],
    columnList: [],
    beamList: [],
    materialList: [],
    boltDiameterList: [],
    thicknessList: [],
    propertyClassList: [],
    sessionCreated: false,
    sendNextRequests: false,
    setTheCookie: false,
    connectivityListObtained: false,
    designLogs: [],
    designData: {},
    renderCadModel: false,
    displayPDF: false,
    report_id: '',
    blobUrl: '',
    designPrefData: {}
}

const BASE_URL = 'http://127.0.0.1:8000/'


//create context
export const ModuleContext = createContext(initialValue);

//provider component
export const ModuleProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ModuleReducer, initialValue);

    const cookieSetter = async () => {
        dispatch({ type: 'SET_COOKIE_FETCH', payload: '' })
    }

    // actions
    const getConnectivityList = async (moduleName) => {
        try {
            state.currentModuleName = moduleName
            const response = await fetch(`${BASE_URL}populate?moduleName=${moduleName}`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });
            const jsonResponse = await response?.json()
            const data = jsonResponse.connectivityList
            // dispatch the action to set the connectivityList 
            dispatch({ type: 'SET_CONNECTIVITY_LIST', payload: data })
            state.connectivityListObtained = true

        } catch (error) {
            dispatch({ type: 'SET_ERR_MSG_LEAF', payload: '' })
            console.log('error', error)
        }
    }

    const getColumnBeamMaterialList = async (moduleName, connectivity) => {
        try {
            const response = await fetch(`${BASE_URL}populate?moduleName=${moduleName}&connectivity=${connectivity}`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            })
            const jsonResponse = await response?.json()

            // diaptch the action 
            if (connectivity !== 'Beam-Beam') {
                dispatch({ type: 'SET_COLUMN_BEAM_MATERIAL_LIST', payload: jsonResponse })
            } else if (connectivity === 'Beam-Beam') {
                dispatch({ type: 'SET_BEAM_MATERIAL_LIST', payload: jsonResponse })
            }
        } catch (error) {
            dispatch({ type: 'SET_ERR_MSG_COLUMN_BEAM_MATERIAL', payload: '' })
            console.log('error : ', error)
        }
    }

    const getBoltDiameterList = async () => {
        try {
            const response = await fetch(`${BASE_URL}populate?moduleName=${state.currentModuleName}&boltDiameter=Customized`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });
            const jsonResponse = await response?.json()
            dispatch({ type: 'SET_BOLT_DIAMETER_LIST', payload: jsonResponse })

        } catch (error) {
            console.log('error : ', error)
        }

    }

    const getThicknessList = async () => {
        try {
            const response = await fetch(`${BASE_URL}populate?moduleName=${state.currentModuleName}&thickness=Customized`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });
            const jsonResponse = await response?.json()
            dispatch({ type: 'SET_THICKNESS_LIST', payload: jsonResponse })

        } catch (error) {
            console.log('error : ', error)
        }
    }

    const getPropertyClassList = async () => {
        try {
            const response = await fetch(`${BASE_URL}populate?moduleName=${state.currentModuleName}&propertyClass=Customized`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            });
            const jsonResponse = await response?.json()
            dispatch({ type: 'SET_PROPERTY_CLASS_LIST', payload: jsonResponse })
        } catch (error) {
            console.log('error : ', error)
        }
    }

    const createSession = async () => {
        try {
            const requestData = { 'module_id': 'Fin Plate Connection' }
            const response = await fetch(`${BASE_URL}sessions/create`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            })

            const data = await response.json()
            if (data['status'] == 'set') {
                // fetch the connectivityList 
                getConnectivityList('Fin-Plate-Connection')
                getColumnBeamMaterialList(state.currentModuleName, 'Column-Flange-Beam-Web')
                getBoltDiameterList()
                getThicknessList()
                getPropertyClassList()

            } else {
                state.sendNextRequests = false
            }


            if (response.status == 201) {
                //console.log('The Session has been set in the cookie')
                state.sessionCreated = true
            } else if (response.status == 200) {
                //console.log('Already in the editing module')
                state.sessionCreated = true
            } else {
                //console.log('There is an error in setting a session in the cookie')
                state.sessionCreated = false
            }
        } catch (err) {
            //console.log('Error in creating a session')
            state.sessionCreated = false
        }
    }

    const deleteSession = async () => {
        try {
            const response = await fetch(`${BASE_URL}sessions/delete`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            if (response.status == 200) {
                console.log('The session has been deleted')
            } else {
                console.log('Error in deleting the session')
            }
        } catch (err) {
            console.log('Error in deleting the session from the catch block')
        }
    }

    const createCADModel = async () => {
        try {
            const response = await fetch(`${BASE_URL}design/cad`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            })
            if (response.status == 201) {

                // set the CAD rendering to true ( to render the CAD model )
                dispatch({ type: 'SET_RENDER_CAD_MODEL_BOOLEAN', payload: true })
            } else {
                console.log('CAD model not created')

                // set teh render CAD to false to display the default image only 
                dispatch({ type: 'SET_RENDER_CAD_MODEL_BOOLEAN', payload: false })
            }

        } catch (error) {
            console.log('Error in creating CAD model : ', error)
        }
    }

    const createDesign = async (param) => {
        try {
            const response = await fetch(`${BASE_URL}calculate-output/fin-plate-connection`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(param)
            })
            const jsonResponse = await response?.json()
            dispatch({ type: 'SET_DESIGN_DATA_AND_LOGS', payload: jsonResponse })
            if (response.status == 201) {
                // call the thunk to create the CAD Model
                try {
                    createCADModel()
                } catch (error) {
                    console.log('error in creating the CAD model from createDesign')
                }
            }else if(response.status == 400){
                console.log('BAD input values')

                // set teh render CAD to false to display the default image only 
                dispatch({ type: 'SET_RENDER_CAD_MODEL_BOOLEAN', payload: false })
            }

        } catch (error) {
            console.log('Error in creating the design')
        }
    }

    const getDesingPrefData = async(param) => {
        try {
            const response = await fetch(`${BASE_URL}design-preferences/?supported_section=${param.supported_section}&supporting_section=${param.supporting_section}&connectivity=${param.connectivity}`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            })
            const data = await response?.json()
            //console.log(data)
            dispatch({type: 'SAVE_DESIGN_PREF_DATA', payload: data})
        } catch (error) {
            //console.log(error)
            console.log("Something went wrong")
        }
    }

    const getPDF = async (obj) => {
        try {
            fetch(`${BASE_URL}getPDF?report_id=${obj.report_id}`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache', // Disable caching
                    'Pragma': 'no-cache', // For older browsers
                }
            })
                .then((response) => {
                    if (response.ok) {
                        const link = document.createElement('a');
                        link.href = response.url;
                        link.setAttribute('download', 'your_file_name.pdf');
                        link.click();
                        link.remove();
                    } else {
                        console.error('Error in obtaining the PDF file:', response.status, response.statusText);
                    }
                });
        } catch (error) {
            console.log('Error in obtaining the PDF file from catch:', error);
        }
    };

    const fetchCompanyLogo = async(companyLogo , companyLogoName) => {
        console.log('companyLogo : ' , companyLogo)
        console.log('companyLogoName : ' , companyLogoName)

        // creting a formData and appending the image in the formData 
        let formData = new FormData()
        formData.append('file' , companyLogo , companyLogoName)
        console.log('final formData ; ' , formData)
        try{
            const response = await fetch(`${BASE_URL}company-logo/` , {
                method : 'POST',
                mode : 'cors',
                credentials : 'include',
                body : formData
            })

            if(response?.status==201){
                const jsonResponse = await response?.json()
                // return the logogFullPath
                return jsonResponse.logoFullPath
            }else{
                console.log('response.status !=201, there is some error')
            }
        }catch(err){
            console.log('There was an error in fetching the company Logo')
        }

    }

    const createDesignReport = async (params) => {
        console.log('params  : ' , params)

        // store the companyLogo in the server fileSystem 
        const logoFullPath = await fetchCompanyLogo(params.companyLogo , params.companyLogoName)
        console.log('fileName received : ' , logoFullPath)
        
        try {
            const response = await fetch(`${BASE_URL}generate-report`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(
                    {
                        metadata: {
                            ProfileSummary: {
                                CompanyName: params.companyName,
                                CompanyLogo : logoFullPath ? logoFullPath : "",
                                "Group/TeamName": params.groupTeamName,
                                Designer: params.designer,
                            },
                            ProjectTitle: params.projectTitle,
                            Subtitle: params.subtitle,
                            JobNumber: params.jobNumber,
                            AdditionalComments: params.additionalComments,
                            Client: params.client,
                        }
                    })
            })

            const jsonResponse = await response?.json()
            console.log('jsonresponse : ' , jsonResponse)
            if (response.status == 201) {
                // obtain the report_id and fetch the pdf file 
                getPDF({'report_id' : jsonResponse.report_id})

            } else {
                console.log('response.status!=201 in createDesignReport, erorr')
            }
        } catch (error) {
            console.log('error : ', error)
        }
    }

    const saveCSV = async () => {
        try {
            const response = await fetch(`${BASE_URL}save-csv`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include'
            })

            const jsonResponse = await response?.json()
            console.log("jsonResponse : ", jsonResponse)
        } catch (error) {
            console.log('error : ', error)
        }
    }

    const updateSourceAndMechType = (id, materialValue) => {
        if(id === 1){
            dispatch({type:"UPDATE_SUPPORTING_ST_DATA", payload: materialValue})
        }
        else if(id === 2){
            dispatch({type:"UPDATE_SUPPORTED_ST_DATA", payload: materialValue})
        }
    }

    return (
        <ModuleContext.Provider value={{
            // State variables 
            connectivityList: state.connectivityList,
            beamList: state.beamList,
            columnList: state.columnList,
            materialList: state.materialList,
            currentModuleName: state.currentModuleName,
            boltDiameterList: state.boltDiameterList,
            thicknessList: state.thicknessList,
            propertyClassList: state.propertyClassList,
            sessionCreated: state.sessionCreated,
            sendNextRequests: state.sendNextRequests,
            setTheCookie: state.setTheCookie,
            error_msg: state.error_msg,
            designData: state.designData,
            designLogs: state.designLogs,
            renderCadModel: state.renderCadModel,
            displayPDF: state.displayPDF,
            blobUrl: state.blobUrl,
            designPrefData: state.designPrefData,

            // actions
            cookieSetter,

            // Thunks
            getConnectivityList,
            getColumnBeamMaterialList,
            getThicknessList,
            getBoltDiameterList,
            getPropertyClassList,
            createCADModel,
            createSession,
            deleteSession,
            createDesign,
            createDesignReport,
            saveCSV,
            getDesingPrefData,
            createJWTToken,
            refreshJWTToken,
            updateSourceAndMechType
        }}>
            {children}
        </ModuleContext.Provider>
    )
}
