export const ModuleReducer = (state, action) => {
    if (action.type === 'reset_result') {
        return {
            ...state,
            results: null
        }
    }
    else if (action.type === 'reset_subDesignTypes') {
        console.log('reducer')
        return {
            ...state,
            subDesignTypes: null
        }
    }
    else if (action.type === 'reset_leafDesignTypes') {
        return {
            ...state,
            leafLevelDesignType: null
        }
    }
}