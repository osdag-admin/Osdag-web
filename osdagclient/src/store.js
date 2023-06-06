// Author : Atharva Pingale 
import { configureStore } from '@reduxjs/toolkit'

// importing reducers 
import moduleSlice from './features/moduleSlice'

const store = configureStore({
    reducer : {
        module : moduleSlice
    }
})

export default store