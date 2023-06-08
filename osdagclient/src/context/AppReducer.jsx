export default (state, action) => {
    console.log(action)
    switch (action.type) {
        case 'GET_MODULES':
            return {
                ...state,
                data: action.payload
            }
        case 'GET_DESIGNTYPES':
            return {
                ...state,
                results: action.payload
            }

        default:
            return state;
    }
}