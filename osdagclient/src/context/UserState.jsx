import { createContext, useReducer } from 'react';
import UserReducer from './UserReducer'

/* 
    ######################################################### 
    # Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) # 
    ######################################################### 
*/

let initialValue = {
    isLoggedIn : true

}

const BASE_URL = 'http://127.0.0.1:8000/'

//create context
export const UserContext = createContext(initialValue);

export const UserProvider = ({children}) => {
    const [state, dispatch] = useReducer(UserReducer, initialValue);

    // USER AUTHENTICATION AND AUTHORAZATION 
    const createJWTToken = async(username , password) => {
        console.log('inside createJWT token ')
        console.log('username : ' , username)
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
                dispatch({type : 'SET_LOGGED_IN' , payload : true})

                console.log('isloggedIn in signup thunk : ' , state.isLoggedIn)
            }else{
                console.log('response.status is not 201, failed to create a new user')
                dispatch({type : 'SET_LOGGED_IN' , payload : false})
            }
        }catch(err){
            console.log('there is an error in user signup : ' , err)
            dispatch({type : 'SET_LOGGED_IN' , payload : false})
        }
    }

    const userLogin = async(username , password ,  isGuest) => {
        console.log('inside user login')
        console.log('encrypted_username : ' , username)
        console.log('isGuest : ' ,isGuest)

        try{
            const response = await fetch(`${BASE_URL}user/login/` , {
                method : 'POST',
                mode : 'cors',
                headers: {
                    'Content-Type': 'application/json', // Set the Content-Type header to JSON
                  },
                body : {
                    username : username,
                    password : password,
                    isGuest : isGuest
                }
            })

            const jsonResponse = await response?.json()
            console.log('jsonResponse : ' , jsonResponse)
            if(response.status==200){
                console.log('user logged in successfully')
                
                // create a new jwt token 
                createJWTToken(username , password)

                // set the login variable to true 
                dispatch({type : 'SET_LOGGED_IN' , payload : true})
            }else{
                console.log('response.status!=200, user not logged in')
                dispatch({type : 'SET_LOGGED_IN' , payload : false})
            }
        }catch(err){
            console.log('error in logging in')
            dispatch({type : 'SET_LOGGED_IN' , payload : false})
        }
    }

    return (
        <UserContext.Provider value = {{
            // state variables 
            isLoggedIn : state.isLoggedIn,



            // thunks
            userSignup,
            userLogin
            
        }}>
            {children}
        </UserContext.Provider>
    )


}