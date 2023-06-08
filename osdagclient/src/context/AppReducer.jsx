export default (state, action) => {
    switch (action.type) {
        case 'GET_MODULES':
            return {
                ...state,
                data: action.payload
            }
        case 'GET_DESIGNTYPES':
            return {
                ...state,
                results: action.payload,
                subDesignTypes: null,
                leafLevelDesignType: null
            }
        case 'GET_SUB_DESIGNTYPES':
            return {
                ...state,
                subDesignTypes: action.payload,
                leafLevelDesignType: null
            }
        case 'GET_LEAF_DESIGNTYPES':
            return {
                ...state,
                leafLevelDesignType: action.payload
            }

        default:
            return state;
    }
}