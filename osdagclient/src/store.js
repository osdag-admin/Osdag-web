// Author : Atharva Pingale 
import { configureStore } from '@reduxjs/toolkit'

// importing reducers 
import moduleSlice from './features/moduleSlice'
import getDesignTypesSlice from './features/getDesignTypesSlice'

const store = configureStore({
    reducer: {
        module: moduleSlice,
        getDesignTypes: getDesignTypesSlice
    }
})

export default store