import { createSlice } from "@reduxjs/toolkit";

// importing reducer
import { ModuleReducer } from "./reducers/ModuleReducer";

// importing thunks 
import { getDesignTypes } from "./thunks/ModuleThunk";


// the initial value of the store 
let initialValue = {
    results: null,
}

const getDesignTypesSlice = createSlice({
    name: 'getDesignTypes',
    initialState: initialValue,
    reducers: ModuleReducer, extraReducers(builder) {
        builder.addCase(getDesignTypes.pending, (state, action) => {
            console.log('Loading...')
        })
            .addCase(getDesignTypes.fulfilled, (state, action) => {
                console.log('response received (design types))')
                console.log('received data : ', action.payload)
                state.results = action.payload
            })
            .addCase(getDesignTypes.rejected, (state, action) => {
                console.log('fetching failed')
                state.results = null
            })
    }
})

// exporting reducer
export default getDesignTypesSlice.reducer

// exporting actions
// nothing