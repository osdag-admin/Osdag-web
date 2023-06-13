export default (state, action) => {
    switch (action.type) {
        case 'GET_MODULES':
            return {
                ...state,
                data: action.payload,
            }
        case 'GET_DESIGNTYPES':
            return {
                ...state,
                results: action.payload,
                subDesignTypes: null,
                leafLevelDesignType: null,
                error_message: null
            }
        case 'GET_SUB_DESIGNTYPES':
            return {
                ...state,
                subDesignTypes: action.payload,
                leafLevelDesignType: null,
                error_message: null
            }
        case 'GET_LEAF_DESIGNTYPES':
            return {
                ...state,
                leafLevelDesignType: action.payload,
                error_message: null
            }

        case 'SET_ERR_MSG':
            return {
                ...state,
                results: null,
                subDesignTypes: null,
                leafLevelDesignType: null,
                error_message: 'Module Under Development'
            }
        case 'SET_ERR_MSG_SUB':
            return {
                ...state,
                subDesignTypes: null,
                leafLevelDesignType: null,
                error_message: 'Module Under Development'
            }
        case 'SET_ERR_MSG_LEAF':
            return {
                ...state,
                leafLevelDesignType: null,
                error_message: 'Module Under Development'
            }
        default:
            return state;
    }
}