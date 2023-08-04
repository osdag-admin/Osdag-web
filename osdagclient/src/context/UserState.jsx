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
    allReportsLink : [],
    LoginMessage : "",
    SignupMessage : "",
    OTPSent : false,
    OTPMessage : "",
    passwordSet : false,
    passwordSetMessage : "",
    inputFiles : false,
    inputFilesMessage : ""
}

const BASE_URL = 'http://127.0.0.1:8000/'

//create context
export const UserContext = createContext(initialValue);

export const UserProvider = ({children}) => {
    const [state, dispatch] = useReducer(UserReducer, initialValue);

    // USER AUTHENTICATION AND AUTHORAZATION 
    const createJWTToken = async(email , password) => {
        console.log('inside createJWT token ')
        console.log('email : ' , email)
        try{
            const response = await fetch(`${BASE_URL}api/token/` , {
                method : 'POST',
                mode : 'cors',
                credentials : 'include',
                headers : {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body : JSON.stringify({
                    'username' : email,
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
                
                // set the refresh token and the access token in teh localstorage 
                localStorage.setItem('access' , access_token)
                localStorage.setItem('refresh' , refresh_token)
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
                dispatch({type : 'SET_SIGNUP_STATUS' , payload : {isLoggedIn : true , message : "User Successfully Signed up"}})

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

    const userLogin = async(email, password ,  isGuest) => {
        console.log('inside user login')
        console.log('email' , email)
        console.log('isGuest : ' ,isGuest)

        try{
            const response = await fetch(`${BASE_URL}user/login/` , {
                method : 'POST',
                mode : 'cors',
                headers: {
                    'Content-Type': 'application/json', // Set the Content-Type header to JSON
                  },
                body : JSON.stringify({
                    email : email,
                    password : password,
                    isGuest : isGuest
                })
            })

            const jsonResponse = await response?.json()
            console.log('jsonResponse : ' , jsonResponse)
            if(response.status==200){
                console.log('user logged in successfully')
                
                // create a new jwt token 
                if(isGuest==false){
                    createJWTToken(email , password)
                }

                // set the login variable to true 
                dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : true , message : "User Successfully Logged in"}})
                console.log("isloggedin inside logging"+ isLoggedIn)
            }else{
                console.log('response.status!=200, user not logged in')
                dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : false , message :  "Invalid Credentials, please try again"}})
            }
        }catch(err){
            console.log('error in logging in')
            dispatch({type : 'SET_LOGGING_STATUS' , payload : {isLoggedIn : false , message : "Server error occured while logging in, please try again"}})
        }
    }

    const obtainSingleInputFile = async(fileIndex) => {
        console.log('inside obtain single input file : ' , fileIndex)
        const access_token = localStorage.getItem('access')
        const email = localStorage.getItem('email')
        try{
            fetch(`${BASE_URL}user/obtainallinputfiles/` , {
                method : 'GET',
                mode : 'cors',
                credentials : 'include',
                // Authorization header as well
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache', // Disable caching
                    'Pragma': 'no-cache', // For older browsers
                    'Authorization' : `Bearer ${access_token}`,
                },
                body : JSON.stringify({
                    'email' : email,
                    'fileIndex' : fileIndex
                })
            }).then((response) => {
                if (response.ok) {
                    const link = document.createElement('a');
                    link.href = response.url;
                    link.setAttribute('download', 'your_file_name.pdf');

                    // store the link in an array
                    dispatch({type : 'PUSH_REPORT_LINK' , payload : link})
                    console.log('pushed the report link')

                    dispatch({type : 'SET_INPUTFILES_STATUS' , payload : {inputFiles : true , inputFilesMessage : "The files have been stored in the server"}})

                } else {
                    console.error('Error in obtaining the PDF file:', response.status, response.statusText);
                    dispatch({type : 'SET_INPUTFILES_STATUS' , payload : {inputFiles : false , inputFilesMessage : "Failed to store the files in the server"}})
                }
            })
        }catch(err){
            console.log('Server error in obtaining the file')
        }
            
    }

    const obtainALLInputValueFiles = async() => {
        console.log('inside teh obtain All reports thunk')
        const access_token = localStorage.getItem('access')
        const allInputValueFilesLength = localStorage.getItem('allInputValueFilesLength')
        console.log('allInputValueFilesLength : ' , allInputValueFilesLength)
        console.log('access_token : ' , access_token)
        const email = localStorage.getItem('email')
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

                dispatch({type : 'SET_FORGETPAfSSWORD_STATE' , payload : {passwordSet : true , passwordSetMessage : 'New password has been set'}})
                
            }else{
                console.log('response.status!=200 on forget password')

                dispatch({type : 'SET_FORGETPASSWORD_STATE' , payload : {passwordSet : false , passwordSetMessage : 'Failed to update the password , please try again'}})
            }
        }catch(err){
            console.log('Server error in updating the password')

            dispatch({type : 'SET_FORGETPASSWORD_STATE' , payload : {passwordSet : false ,passwordSetMessage : 'Server error in updating the password, please try again'}})
        }
    }

    const SaveInputValueFile = async(content) => {
        console.log('inside saveInputValueFile thunk')
        console.log('content : ' ,content)

        try{
            const response = await fetch(`${BASE_URL}user/saveinput/` , {
                method : 'POST',
                mode : 'cors',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    'content' : content
                })
            })

            const jsonResponse = await response?.json()
            console.log('jsonResponse : ' , jsonResponse)
            if(response.status==201){
                console.log('the input file has beed stored successfully')
                const allInputValueFilesLength = jsonResponse.get('allInputValueFilesLength')
                // set to localStorage 
                localStorage.setItem('allInputValueFilesLength' , allInputValueFilesLength)
            
                dispatch({type : 'SET_INPUTFILES_STATUS' , payload : {inputFiles : true , inputFilesMessage : "The files have been stored in the server"}})

            }else{
                console.log('response.status!=200 while sending the input values files')

                dispatch({type : 'SET_INPUTFILES_STATUS' , payload : {inputFiles : false , inputFilesMessage : "Failed to store the input files in the servers"}})
            }
        }catch(err){
            console.log('Error in sending the input files : ' , err)

            dispatch({type : 'SET_INPUTFILES_STATUS' , payload : {inputFiles : false , inputFilesMessage : "Server error in storing the files"}})
        }

    }


    return (
        <UserContext.Provider value = {{
            // state variables 
            isLoggedIn : state.isLoggedIn,
            OTPSent : state.OTPSent,
            OTPMessage : state.OTPMessage,
            LoginMessage : state.LoginMessage,
            SignupMessage : state.SignupMessage,

            // thunks
            userSignup,
            userLogin,
            verifyEmail,
            ForgetPassword,
            obtainALLInputValueFiles,
            SaveInputValueFile
            
        }}>
            {children}
        </UserContext.Provider>
    )


}