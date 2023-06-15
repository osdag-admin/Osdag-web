import { createContext, useReducer, useEffect } from 'react';
import AppReducer from './AppReducer';

/*
    Author: Sai Charan (Fossee' 23)
    This file contains the GlobalState and GlobalProvider components which are used to manage the state of the application.
*/

import axios from 'axios';

//initial state
let initialValue = {
    data: [],
    results: null,
    subDesignTypes: null,
    leafLevelDesignType: null,
    error_message: null,
    fetch_cache: '',
}

const BASE_URL = 'http://127.0.0.1:8000/'


//create context
export const GlobalContext = createContext(initialValue);

//provider component
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialValue);

    //action
    const getInitialData = async () => {
        try {
            const response = await axios.get(BASE_URL + "osdag-web/");
            const data = response.data.result;
            dispatch({ type: 'GET_MODULES', payload: data });
        } catch (error) {
            console.error(error);
        }
    }
    const getDesignTypes = async (conn_type) => {
        const URL = `${BASE_URL}osdag-web/${conn_type}`
        if (initialValue.fetch_cache === URL) return;
        initialValue.fetch_cache = URL;
        try {
            const response = await axios.get(URL);
            const data = response.data.result;
            dispatch({ type: 'GET_DESIGNTYPES', payload: data });
        } catch (error) {
            dispatch({ type: 'SET_ERR_MSG', payload: '' });
            console.error(error);
        }
    }

    const getSubDesignTypes = async (designType, name) => {
        try {
            const response = await axios.get(`${BASE_URL}osdag-web/${designType}/${name.toLowerCase().replaceAll("_", '-')}`);
            const data = response.data.result;
            // console.log(data)
            dispatch({ type: 'GET_SUB_DESIGNTYPES', payload: data });
        } catch (error) {
            dispatch({ type: 'SET_ERR_MSG_SUB', payload: '' });
            console.error(error);
        }
    }

    const getLeafLevelDesignType = async (designType, prev, name) => {
        try {
            const response = await axios.get(`${BASE_URL}osdag-web/${designType}/${prev.toLowerCase().replaceAll("_", '-')}/${name.toLowerCase().replaceAll("_", '-')}`);
            const data = response.data.result;
            // console.log(data)
            dispatch({ type: 'GET_LEAF_DESIGNTYPES', payload: data });
        } catch (error) {
            dispatch({ type: 'SET_ERR_MSG_LEAF', payload: '' });
            console.error(error);
        }
    }

    return (
        <GlobalContext.Provider value={{
            data: state.data,
            results: state.results,
            subDesignTypes: state.subDesignTypes,
            leafLevelDesignType: state.leafLevelDesignType,
            error_message: state.error_message,
            getInitialData,
            getDesignTypes,
            getSubDesignTypes,
            getLeafLevelDesignType
        }}>
            {children}
        </GlobalContext.Provider>
    )
}
