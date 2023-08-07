
/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    ######################################################### 
*/

export default (state, action) => {
    switch(action.type){
        case 'SET_LOGGING_STATUS' : 
        console.log('action.payload : ' , action.payload)
        // console.log('isLoggedIn in UserReducer : ' , isLoggedIn)
        console.log('Pass the console of isLoggedIn in UserReducer : ')
            return {
                ...state,
                isLoggedIn : action.payload.isLoggedIn,
                LoginMessage : action.payload.message
               
            }
            
        case 'SET_SIGNUP_STATUS' : 
        console.log('action.payload : ' , action.payload)
            return {
                ...state,
                isLoggedIn : action.payload.isLoggedIn,
                SignupMessage : action.payload.message
            }
        case 'SET_CHECKEMAIL_STATUS' : 
            return{
                ...state,
                OTPSent : action.payload.OTPSent,
                OTPMessage : action.payload.message
            }
        case 'PUSH_REPORT_LINK' : 
            return {
                ...state,
                inputFilesLink : [inputFilesLink , ...action.payload]
            }
        case 'SET_FORGETPASSWORD_STATUS' : 
            return {
                ...state,
                passwordSet : action.payload.passwordSet,
                passwordSetMessage : action.payload.passwordSetMessage
            }
        default : 
            return {
                ...state
            }
    }
}