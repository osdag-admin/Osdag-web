
/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    ######################################################### 
*/

export default (state, action) => {
    switch(action.type){
        case 'SET_LOGGED_IN' : 
            return {
                ...state,
                isLoggedIn : action.payload
            }
    }
}