import { createContext, useReducer } from 'react';
import UserReducer from './UserReducer';

// crypto packages
import {decode as base64_decode, encode as base64_encode} from 'base-64';

/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    ######################################################### 
*/

let initialValue = {
    isLoggedIn : false,
    LoginMessage : "",
    SignupMessage : "",
    OTPSent : false,
    OTPMessage : "",
    passwordSet : false,
    passwordSetMessage : "",
    inputFilesLink : [],
    inputFilesStatus : false,
    inputFilesMessage : "",
    saveInputFileStatus : false,
    saveInputFileName : "",
    loginCredValid : false
}

const BASE_URL = 'http://127.0.0.1:8000/'

//create context
export const UserContext = createContext(initialValue);

export const UserProvider = ({children}) => {
    const [state, dispatch] = useReducer(UserReducer, initialValue);

    // USER AUTHENTICATION AND AUTHORAZATION 
    const setRefreshTokenCookie = async(refresh_token) => {
        console.log('Inside set refresh token thunk')
        try{
            const response = await fetch(`${BASE_URL}user/set-refresh/` , {
                method : 'POST',
                mode : 'cors',
                credentials : 'include',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    'refresh' : refresh_token
                })
            })

            const jsonResponse = await response?.json()
            console.log('jsonResponse in setRefreshToken : ' , jsonResponse)

            if(response.status==200){
                console.log('the refresh token cookie has been set')
            }else{
                console.log('response.status!=200 while setting the refresh token cookie')
            }
        }catch(err){
            console.log('Server error while setting refresh token cookie')
        }
    }
    const createJWTToken = async(username , password) => {
        console.log('inside createJWT token ')
        console.log('username : ' , username)
        console.log('password : ' , password)
        try{
            const response = await fetch(`${BASE_URL}api/token/` , {
                method : 'POST',
                mode : 'cors',
                credentials : 'include',
                headers : {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body : JSON.stringify({
                    'username' : username,
                    'password' : password
                })
            })

            const jsonResponse = await response?.json()
            console.log('jsonResposne : ' , jsonResponse)
            if(response.status==200){
                console.log('token has been created')

                // obtain the refresh and the access token 
                const refresh_token =jsonResponse.refresh
                const access_token = jsonResponse.access
                
                console.log('refresh_token ; ' , refresh_token)
                console.log('access_token : ' , access_token)

                setRefreshTokenCookie(refresh_token)
                
                // set the refresh token and the access token in teh localstorage 
                localStorage.setItem('access' , access_token)
                //localStorage.setItem('refresh' , refresh_token)
                
                console.log('inside token Local storage set')
                // now for every next request, set the Authorization header and the access_token
                // headers : {Authorization : 'Bearer {access_token}'}

            }else{
                console.log('response status !=200 for creating token')
            }

        }catch(error){
            console.log('There was an error in obtainin the token')
            console.log('error : ' , error)
        }
    }

    const refreshJWTToken = async() => {
        // obtain teh refresh token and access token from the localStorage 

        let refresh_token = localStorage.getItem('refresh')
        console.log('refresh_token : ' , refresh_token)
        let access_token = localStorage.getItem('access')
        console.log('access_token : ' , access_token)

        if(!refresh_token){
            console.log('refresh token is False')
        }
        if(!access_token){
            console.log("access_token is False")
        }

        // send the request to the server to obtain the new set of access_token
        // post the refresh_token
        // with Authorization bearer in the headers
        try{
            const response = await fetch(`${BASE_URL}api/token/refresh` , {
                method : 'POST',
                mode : 'cors',
                headers : {
                    'Authorization' : `Bearer ${access_token}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body : JSON.stringify({
                    "refresh" : refresh_token
                }),
                credentials : 'include'
            })

            const jsonResponse = await response?.json()
            if(response.status==200){
                console.log('new access token created : ' , jsonResponse.access)
                
                // set the new access_token to the localStorage 
                localStorage.setItem('access' , jsonResponse.access_token)
            }else{
                console.log('response status!=200 when creating new access token')
            }

        }catch(err){
            console.log('Cannot obtain the new access token : ' , err)
        }
    }


    const userSignup = async( username , email , password , isGuest ) => {
        console.log("inside the user signup thunk")
        console.log('username : ' , username)
        try{
            const response = await fetch(`${BASE_URL}user/signup/` , {
                method : 'POST',
                mode : 'cors',
                headers: {
                    'Content-Type': 'application/json' // Set the Content-Type header to JSON
                  },
                body : JSON.stringify(
                    {
                        username : username,
                        email : email,
                        password : password,
                        isGuest : isGuest
                    }
                )
            })

            const jsonResponse = await response?.json()
            console.log('jsonResponse  : ' , jsonResponse)
            if(response.status==201){
                console.log('user successfully created')

                // call the thunk for creating the JWT token 
                createJWTToken(username , password)

                // call the reducer action to set the Login variable
                dispatch({type : 'SET_SIGNUP_STATUS' , payload : {isLoggedIn : false , message : "User Successfully Signed up"}})

                console.log('isloggedIn in signup thunk : ' , state.isLoggedIn)
            }else{
                console.log('response.status is not 201, failed to create a new user')
                dispatch({type : 'SET_SIGNUP_STATUS' , payload : {isLoggedIn : false, message : "Error in creating the User Account, please try again"}})
            }
        }catch(err){
            console.log('there is an error in user signup : ' , err)
            dispatch({type : 'SET_SIGNUP_STATUS', payload : {isLoggedIn : false , message : "Server Error in creating User Account, please try again"}} )
        }
    }

    const userLogin = async(username, password ,  isGst , JWTLogin) => {
        console.log('in userlogin Context - inside user login')
        console.log('in userlogin Context - username : ' , username)
        console.log('in userlogin Context - isGuest : ' ,isGst)

        if(JWTLogin==true){
            dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : true , message : "Login Successful"}})
            return
        }

        try{
            const response = await fetch(`${BASE_URL}user/login/` , {
                method : 'POST',
                mode : 'cors',
                headers: {
                    'Content-Type': 'application/json', // Set the Content-Type header to JSON
                  },
                body : JSON.stringify({
                    username : username,
                    password : password,
                    isGuest : isGst
                })
            })

            const jsonResponse = await response?.json()
            console.log('jsonResponse : ' , jsonResponse)
            console.log('jsonResponse msg : ' , jsonResponse.message)
            if(response.status==200){
                console.log('user logged in successfully in userLogin Context ')
                console.log("isloggedin inside logging below if response 200"+ state.isLoggedIn)

                console.log('Line number 194 inside status 200 way to create token...')
                // create a new jwt token 
                if(isGst==false){
                    createJWTToken(username , password)
                    localStorage.setItem('userType',"user")
                    localStorage.setItem('username' , username)
                    localStorage.setItem('email' , jsonResponse.email)
                    localStorage.setItem('allInputValueFilesLength' , jsonResponse.allInputValueFilesLength)
                }
                else{
                    localStorage.setItem('userType',"guest")
                }
                // set the login variable to true 
                if(isGst == true){
                    dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : false , message : jsonResponse.message}})    
                }else{
                    dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : true , message : jsonResponse.message}})
                }
                
                state.loginCredValid = true
                console.log('Done dispatch isLog set true  ')
                
                console.log("Local storage set")
                console.log("isloggedin inside logging below local storage "+ state.isLoggedIn)

                return jsonResponse.message

            }else{
                console.log('response.status!=200, user not logged in')
                if(jsonResponse.message == "The User Account does not exists"){
                    dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : false , message :  "The User Account does not exists"}})  
                    return jsonResponse.message
                }else if(jsonResponse.message == "Invalid credentials"){
                    dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : false , message :  "Invalid Credentials, please try again"}})
                    return jsonResponse.message
                }else{
                    dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : false , message :  "Error while logging"}})
                    return jsonResponse.message
                }
                
            }
        }catch(err){
            console.log('error in logging in')
            dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : false , message : "Server error occured while logging in, please try again"}})
            return "Server error occured while logging in, please try again"
        }
    }

    const setIsLoggedIn = async(value) => {
        console.log('value :  ', value)
        dispatch({type : 'SET_LOGGED_IN' , payload : {isLoggedIn : true}})
        console.log('state.isLoggedIn : ' , state.isLoggedIn)
    }

    const obtainSingleInputFile = async(fileIndex) => {
        console.log('inside obtain single input file : ' , fileIndex)
        const access_token = localStorage.getItem('access')
        const email = localStorage.getItem('email')
        try{
            console.log('fetching the input file')
            fetch(`${BASE_URL}user/obtain-input-file/` , {
                method : 'POST',
                mode : 'cors',
                credentials : 'include',
                // Authorization header as well
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    'email' : email,
                    'fileIndex' : fileIndex
                })
            }).then((response) => {
                console.log('found response : ' , response)
                if (response.ok) {
                    const link = document.createElement('a');
                    console.log('response.url : ' , response.url)
                    const newURL = response.url + `?filename=${email}_fin_plate_connection_${fileIndex}.osi`
                    console.log('newURL : ' , newURL)
                    link.href = newURL
                    console.log('link.href : ' , link.url)
                    link.setAttribute('download', `${email}_fin_plate_connection_${fileIndex}.osi`);
                    link.innerHTML = `${email}_fin_plate_connection_${fileIndex}.osi`

                    // store the link in an array
                    dispatch({type : 'PUSH_REPORT_LINK' , payload : link})
                    console.log('pushed the report link')

                    dispatch({type : 'SET_INPUTFILES_STATUS' , payload : {inputFiles : true , inputFilesMessage : "The files have been stored in the server"}})

                    console.log('state.inputFilesLink : ' , state.inputFilesLink)
                } else {
                    console.error('Error in obtaining the PDF file:', response.status, response.statusText);
                    dispatch({type : 'SET_INPUTFILES_STATUS' , payload : {inputFiles : false , inputFilesMessage : "Failed to store the files in the server"}})
                }
            })
        }catch(err){
            console.log('Server error in obtaining the file : ' , err)
        }
            
    }

    const obtainAllInputValueFiles = async() => {
        console.log('inside teh obtain All reports thunk')
        state.inputFilesLink = []
        const access_token = localStorage.getItem('access')
        const allInputValueFilesLength = localStorage.getItem('allInputValueFilesLength')
        console.log('allInputValueFilesLength : ' , allInputValueFilesLength)
        console.log('access_token : ' , access_token)
        // const email = localStorage.getItem('email')
        const email = "atharva0300@gmail.com"
        console.log('email : ' , email)

        // calling the obtainSingleInputFile 
        // allInputValueFileLekngth number of times 
        for(let fileIndex=1;fileIndex<allInputValueFilesLength;fileIndex++){
            obtainSingleInputFile(fileIndex)
        }
    }

    const verifyEmail = async(email) => {
        console.log('inside the verify email thunk')
        console.log('email : ' , email)

        try{
            const response = await fetch(`${BASE_URL}user/checkemail/` , {
                method : 'POST',
                mode : 'cors',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    email : email
                })
            })

            const jsonResponse = await response?.json()
            if(response.status==200){
                console.log('the OTP has been sent to the email')

                // obtain the OTP, hash it and store it in the localstorage
                // const otp = jsonResponse.('otp')
                // encode the OTP
                // const encoded_otp = base64_encode(otp)
                // const encoded_email = base64_encode(email)
                
                // set the OTP in the localStorage
                console.log('OTP : ' , jsonResponse.OTP)
                localStorage.setItem('otp' , jsonResponse.OTP)
                localStorage.setItem('email' , email)

                dispatch({type : 'SET_CHECKEMAIL_STATUS' , payload : {OTPSent : true , message : 'The OTP has been sent'}})                

            }else{
                console.log('response.status!=200 while checking the email')
                dispatch({type : 'SET_CHECKEMAIL_STATUS' , payload : {OTPSent : false , message : 'failed to send the OTP, try again'}})

            }
        }catch(err){
            console.log('There is an error in the server while checking the email : ' , err)
            dispatch({type : 'SET_CHECKEMAIL_STATUS' , payload : {OTPSent : false , message : 'Server error in sending the OTP, please try again'}})
        }
    }


    const ForgetPassword = async(newPassword) => {
        console.log('inside the forget password thunk')
        console.log('newPassword : ' , newPassword)
        // obtain the stored email from the localStorage and delete the email, OTP 
        let Lemail = localStorage.getItem('email')
        // const email = base64_decode(encoded_email)
        // localStorage.removeItem('email')
        // localStorage.removeItem('otp')
        console.log('email : ' , Lemail)

        try{
            const response =  await fetch(`${BASE_URL}user/forgetpassword/` , {
                method : 'POST',
                mode : 'cors',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify({
                    password : newPassword,
                    email : Lemail
                })
            })

            const jsonResponse = await response?.json()
            console.log('jsonResponse : ' , jsonResponse)
            if(response.status==200){
                console.log('password updated')

                dispatch({type : 'SET_FORGETPASSWORD_STATE' , payload : {passwordSet : true , passwordSetMessage : 'New password has been set'}})
                
            }else{
                console.log('response.status!=200 on forget password')

                dispatch({type : 'SET_FORGETPASSWORD_STATUS' , payload : {passwordSet : false , passwordSetMessage : 'Failed to update the password , please try again'}})
            }
        }catch(err){
            console.log('Server error in updating the password')

            dispatch({type : 'SET_FORGETPASSWORD_STATUS' , payload : {passwordSet : false ,passwordSetMessage : 'Server error in updating the password, please try again'}})
        }
    }

    const SaveInputValueFile = async(content) => {
        console.log('inside saveInputValueFile thunk')
        console.log('content : ' ,content)
        const email = localStorage.getItem('email')
        console.log('email in localStorage : ' , email)
        
        try{
            const response = await fetch(`${BASE_URL}user/saveinput/` , {
                method : 'POST',
                mode : 'cors',
                headers : {
                    'Content-Type' : 'application/json'
                },
                credentials : 'include',
                body : JSON.stringify({
                    'content' : content,
                    'email' : email
                })
            })

            const jsonResponse = await response?.json()
            console.log('jsonResponse : ' , jsonResponse)
            if(response.status==201){
                console.log('the input file has beed stored successfully')
                const allInputValueFilesLength = jsonResponse.allInputValueFilesLength
                console.log('allInputValueFilesLength : ' , allInputValueFilesLength)
                // set to localStorage 
                localStorage.setItem('allInputValueFilesLength' , allInputValueFilesLength)
            
                dispatch({type : 'SET_SAVE_INPUT_FILE_STATUS' , payload : {saveInputFileStatus : true , fileName : jsonResponse.fileName}})

                return {
                    'saveInputStatus' : true,
                    'saveInputFileName' : jsonResponse.fileName
                }

            }else{
                console.log('response.status!=200 while sending the input values files')

                dispatch({type : 'SET_SAVE_INPUT_FILE_STATUS' , payload : {saveInputFileStatus : false}})
            }
        }catch(err){
            console.log('Error in sending the input files : ' , err)

            dispatch({type : 'SET_SAVE_INPUT_FILE_STATUS' , payload : {saveInputFileStatus : false}})
        }

    }

    const setJWTLogin = async(loggedIn) => {
        dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : loggedIn , message : "Login Successful"}})
    }
    


    return (
        <UserContext.Provider value = {{
            // state variables 
            isLoggedIn : state.isLoggedIn,
            OTPSent : state.OTPSent,
            OTPMessage : state.OTPMessage,
            LoginMessage : state.LoginMessage,
            SignupMessage : state.SignupMessage,
            inputFilesLink : state.inputFilesLink,
            saveInputFileStatus : state.saveInputFileStatus,
            loginCredValid : state.loginCredValid,

            // thunks
            userSignup,
            userLogin,
            verifyEmail,
            ForgetPassword,
            obtainAllInputValueFiles,
            SaveInputValueFile,
            setJWTLogin,
            setIsLoggedIn
            
        }}>
            {children}
        </UserContext.Provider>
    )


}