import { createSlice } from "@reduxjs/toolkit";

// importing reducer
import { ModuleReducer } from "./reducers/ModuleReducer";


// importing thunks 
import { getModules, getDesignTypes, getSubDesignTypes, getLeafLevelDesignType } from "./thunks/ModuleThunk";


// the initial value of the store 
let initialValue = {
    data: [],
    results: null,
    subDesignTypes: null,
    leafLevelDesignType: null
}


export const moduleSlice = createSlice({
    name: 'module',
    initialState: initialValue,
    reducers: ModuleReducer, extraReducers(builder) {
        builder.addCase(getModules.pending, (state, action) => {
            // console.log('Loading...')
        })
            .addCase(getModules.fulfilled, (state, action) => {
                // console.log('response received')
                // console.log('received data : ', action.payload)
                // resetting not working - need to be reset inside thunk itself
                state.results = null
                state.subDesignTypes = null
                state.leafLevelDesignType = null
                state.data = action.payload
            })
            .addCase(getModules.rejected, (state, action) => {
                console.log('fetching failed')
            })
    }

}).reducer

export const getDesignTypesSlice = createSlice({
    name: 'getDesignTypes',
    initialState: initialValue,
    reducers: {}, extraReducers(builder) {
        builder.addCase(getDesignTypes.pending, (state, action) => {
            // console.log('Loading...')
        })
            .addCase(getDesignTypes.fulfilled, (state, action) => {
                // calling the reducer
                // resetting not working - need to be reset inside thunk itself
                state.subDesignTypes = null
                state.leafLevelDesignType = null
                state.results = action.payload
            })
            .addCase(getDesignTypes.rejected, (state, action) => {
                console.log('fetching failed')
                state.results = null
            })
    }
}).reducer

export const getSubDesignTypesSlice = createSlice({
    name: 'getSubDesignTypes',
    initialState: initialValue,
    reducers: ModuleReducer, extraReducers(builder) {
        builder.addCase(getSubDesignTypes.pending, (state, action) => {
            // console.log('Loading...')
        })
            .addCase(getSubDesignTypes.fulfilled, (state, action) => {
                // console.log('response received )')
                // console.log('received data (sub design types): ', action.payload)
                // resetting not working - need to be reset inside thunk itself
                state.leafLevelDesignType = null
                state.subDesignTypes = action.payload
            })
            .addCase(getSubDesignTypes.rejected, (state, action) => {
                console.log('fetching failed')
                state.subDesignTypes = null
            })
    }
}).reducer

export const getLeafLevelDesignTypeSlice = createSlice({
    name: 'getLeafLevelDesignType',
    initialState: initialValue,
    reducers: ModuleReducer, extraReducers(builder) {
        builder.addCase(getLeafLevelDesignType.pending, (state, action) => {
            // console.log('Loading...')
        })
            .addCase(getLeafLevelDesignType.fulfilled, (state, action) => {
                // console.log('response received )')
                // console.log('received data (leaf design types): ', action.payload)
                state.leafLevelDesignType = action.payload
            })
            .addCase(getLeafLevelDesignType.rejected, (state, action) => {
                console.log('fetching failed')
                state.leafLevelDesignType = null
            })
    }
}).reducer


// exporting actions
// nothing