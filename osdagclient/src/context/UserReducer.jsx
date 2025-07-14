/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    ######################################################### 
*/

export default (state, action) => {
    switch(action.type){
        case 'SET_LOGGING_STATUS' : 
        localStorage.setItem('isLoggedIn' , action.payload.isLoggedIn)
            return {
                ...state,
                isLoggedIn : action.payload.isLoggedIn,
                LoginMessage : action.payload.message,
                loginSuccess: action.payload.success,
                loginErrorType: action.payload.error_type || null
            }
            
        case 'SET_SIGNUP_STATUS' : 
            return {
                ...state,
                isLoggedIn : action.payload.isLoggedIn,
                SignupMessage : action.payload.message,
                signupSuccess: action.payload.success,
                signupErrorType: action.payload.error_type || null
            }
        case 'SET_CHECKEMAIL_STATUS' : 
            return{
                ...state,
                OTPSent : action.payload.OTPSent,
                OTPMessage : action.payload.message,
                otpSuccess: action.payload.success,
                otpErrorType: action.payload.error_type || null
            }
        case 'PUSH_REPORT_LINK' : 
            return {
                ...state,
                inputFilesLink : [action.payload , ...state.inputFilesLink]
            }
        case 'SET_FORGETPASSWORD_STATUS' : 
            return {
                ...state,
                passwordSet : action.payload.passwordSet,
                passwordSetMessage : action.payload.passwordSetMessage,
                passwordSetSuccess: action.payload.success,
                passwordSetErrorType: action.payload.error_type || null
            }
        case 'SET_SAVE_INPUT_FILE_STATUS' : 
            return {
                ...state,
                saveInputFileStatus : action.payload.saveInputFileStatus,
                saveInputFileName : action.payload.saveInputFileName
            }
        case 'SET_LOGGED_IN' : 
            return {
                ...state,
                isLoggedIn : action.payload.isLoggedIn
            }
        default : 
            return {
                ...state
            }
    }
}