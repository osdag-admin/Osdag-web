import { createSlice } from "@reduxjs/toolkit";

// importing reducer
import { ModuleReducer } from "./reducers/ModuleReducer";

// importing thunks 
import { getModules } from "./thunks/ModuleThunk";


// the initial value of the store 
let initialValue = {
    data : ''
}   


const moduleSlice = createSlice({
    name : 'module',
    initialState : initialValue,
    reducers : ModuleReducer, extraReducers(builder){
        builder.addCase(getModules.pending , (state , action) => {
            console.log('Loading...')
        })
        .addCase(getModules.fulfilled , (state , action) => {
            console.log('response received')
            console.log('received data : ' , action.payload)
            state.data = action.payload
        })
        .addCase(getModules.rejected ,(state , action) => {
            console.log('fetching failed')
        })
    }

})

// exporting reducer
export default moduleSlice.reducer

// exporting actions 
// nothing