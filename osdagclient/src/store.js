// Author : Atharva Pingale 
import { configureStore } from '@reduxjs/toolkit'

// importing reducers 
import { moduleSlice, getDesignTypesSlice } from './features/moduleSlice'

const store = configureStore({
    reducer: {
        module: moduleSlice,
        getDesignTypes: getDesignTypesSlice
    }
})

export default store