/* eslint-disable react/prop-types */
import { createContext, useReducer, useRef } from 'react';
import AppReducer from './AppReducer';

/*
    Author: Sai Charan (Fossee' 23)
    This file contains the GlobalState and GlobalProvider components which are used to manage the state of the application.
*/

import { fetchCatalogRoot, fetchDesignTypes, fetchSubDesignTypes, fetchLeafDesignType } from '../datasources/catalogDataSource';

//initial state
let initialValue = {
    data: [],
    results: null,
    subDesignTypes: null,
    leafLevelDesignType: null,
    error_message: null,
    fetch_cache: '',
}

//create context
export const GlobalContext = createContext(initialValue);

//provider component
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialValue);
    const fetchCacheRef = useRef('');

    //action
    const getInitialData = async () => {
        try {
            const data = await fetchCatalogRoot();
            dispatch({ type: 'GET_MODULES', payload: data });
        } catch (error) {
            console.error(error);
        }
    }
    const getDesignTypes = async (conn_type) => {
        const URL_KEY = `designTypes:${conn_type}`;
        if (fetchCacheRef.current === URL_KEY) return;
        fetchCacheRef.current = URL_KEY;
        try {
            const data = await fetchDesignTypes(conn_type);
            dispatch({ type: 'GET_DESIGNTYPES', payload: data });
        } catch (error) {
            dispatch({ type: 'SET_ERR_MSG', payload: '' });
            console.error(error);
        }
    }

    const getSubDesignTypes = async (designType, name) => {
        try {
            const data = await fetchSubDesignTypes(designType, name);
            dispatch({ type: 'GET_SUB_DESIGNTYPES', payload: data });
        } catch (error) {
            dispatch({ type: 'SET_ERR_MSG_SUB', payload: '' });
            console.error(error);
        }
    }

    const getLeafLevelDesignType = async (designType, prev, name) => {
        try {
            const data = await fetchLeafDesignType(designType, prev, name);
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
