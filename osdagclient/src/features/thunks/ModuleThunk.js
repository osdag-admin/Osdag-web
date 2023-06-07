// importing createAsynthunk
import { createAsyncThunk } from "@reduxjs/toolkit";

import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/'

// module thunk
export const getModules = createAsyncThunk(
    'moduleSlice/getModules', async (item) => {
        // console.log('inside the thunk')
        const URL = BASE_URL + "osdag-web/"
        const response = await fetch(URL, {
            method: "GET"
        })
        const jsonData = await response.json();
        // console.log(jsonData.result)
        return jsonData?.result
    }
)

export const getDesignTypes = createAsyncThunk(
    'moduleSlice/getDesignTypes', async (item) => {
        console.log('inside the thunk')
        const URL = BASE_URL + `osdag-web/${item}`
        const response = await fetch(URL, {
            method: "GET"
        })
        const jsonData = await response.json();
        // console.log(jsonData.result)
        return jsonData?.result
    }
)

export const getSubDesignTypes = createAsyncThunk(
    'moduleSlice/getSubDesignTypes', async (item) => {
        console.log('inside getSubDesignTypes thunk')
        const URL = BASE_URL + `osdag-web/${item.designType}/${item.name.toLowerCase().replaceAll("_", '-')}`
        const response = await fetch(URL, {
            method: "GET"
        })
        const jsonData = await response.json();
        // console.log(jsonData.result)
        return jsonData?.result
    }
)

export const getLeafLevelDesignType = createAsyncThunk(
    'moduleSlice/getLeafLevelDesignType', async (item) => {
        console.log('inside leaf thunk')
        console.log(item)
        const URL = BASE_URL + `osdag-web/${item.designType}/${item.prev_item.toLowerCase().replaceAll("_", '-')}/${item.name.toLowerCase().replaceAll("_", '-')}`
        const response = await fetch(URL, {
            method: "GET"
        })
        const jsonData = await response.json();
        // console.log(jsonData.result)
        return jsonData?.result
    }
)