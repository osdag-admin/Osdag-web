import React, { createContext, useReducer, useEffect } from 'react';
import AppReducer from './AppReducer';

import axios from 'axios';

//initial state
let initialValue = {
    data: [],
    results: null,
    subDesignTypes: null,
    leafLevelDesignType: null
}

const BASE_URL = 'http://127.0.0.1:8000/'


//create context
export const GlobalContext = createContext(initialValue);

//provider component
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialValue);

    useEffect(() => {
        // Fetch initial data from API and update the state
        const fetchData = async () => {
            try {
                const response = await axios.get(BASE_URL + "osdag-web/");
                const data = response.data.result;
                dispatch({ type: 'GET_MODULES', payload: data });
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    //action
    function getDesingTypes(conn_type) {
        dispatch({ type: 'GET_DESIGNTYPES', payload: conn_type })
    }

    return (
        <GlobalContext.Provider value={{
            data: state.data,
            results: state.results,
            subDesignTypes: state.subDesignTypes,
            leafLevelDesignType: state.leafLevelDesignType,
            getDesingTypes
        }}>
            {children}
        </GlobalContext.Provider>
    )
}
