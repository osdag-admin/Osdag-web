// Author : Atharva Pingale 
import { configureStore } from '@reduxjs/toolkit'

// importing reducers 
import { moduleSlice, getDesignTypesSlice, getSubDesignTypesSlice, getLeafLevelDesignTypeSlice } from './features/moduleSlice'

const store = configureStore({
    reducer: {
        module: moduleSlice,
        getDesignTypes: getDesignTypesSlice,
        getSubDesignTypes: getSubDesignTypesSlice,
        getLeafLevelDesignType: getLeafLevelDesignTypeSlice
    }
})

export default store