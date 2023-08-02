import { useState, useContext } from 'react';
import './Auth.css';
import icon from '../../assets/logo-osdag.png';
// import { createJWTToken } from '../../context/ModuleState';
import { UserContext } from '../../context/UserState';
import {AES, enc} from 'crypto-js'

const secretKey = 'atharva';


const encryptData = (data) => {
    const dataString = data.toString()
    const encryptedText = AES.encrypt(dataString, secretKey).toString();
    return encryptedText
  };
  
//   const decryptData = (encryptedData) => {
//     const decryptedBytes = AES.decrypt(encryptedData, secretKey);
//     const decryptedString = decryptedBytes.toString(enc.Utf8);
//     return JSON.parse(decryptedString);
//   };

const generateRandomString = (length) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    return result;
  };

const LoginPage = ({ onLogin }) => {

    const { userSignup, userLogin } = useContext(UserContext)
    const [isSignup, setIsSignup] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSwitch = () => {
        setIsSignup(!isSignup)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!email || !password){
            alert('Enter email and password')
            return;
        }
    

        try{
            let jsonResponse;
            if(isSignup){
                if(!name){
                    alert("Enter a name to continue")
                    return;
                }
                
                // register
                const encUsername = encryptData({name});
                const encEmail = encryptData({email});
                const encPassword = encryptData({password});

                console.log("\n Username"+encUsername+"\n Email "+encEmail+"\n Password"+encPassword);
                console.log("\n\n Input goes as "+ userSignup(  encUsername, encEmail, encPassword  ))
                userSignup(  encUsername, encEmail, encPassword  ).then(()=> {onLogin(); })
             
                    


            }else{
                const Guestlog = false;
                const encUsername = encryptData({name});
                const encPassword = encryptData({password});
                console.log("\n\n Input goes as "+ userSignup(  encUsername, encPassword, Guestlog  ))
                userLogin(  encUsername, encPassword, Guestlog ).then(()=> {onLogin(); })

            }
        }
        catch(error){
            console.log('Error occurred while obtaining the token', error);
             alert('There was an error during login/signup.');
        }
    }

    // Google Auth
  const handleGoogleSignIn = () => {

    console.log('Google Sign-In button clicked!');

  };
    // Guest 
    const handleGuestSignIn = () => {
        const GuestUserName = `GUEST.${generateRandomString(10)}`;
        const GuestUserPassword = generateRandomString(12);
        const Guestlog = true;
        console.log("\n Guest Name: "+GuestUserName+"\n Password:"+GuestUserPassword)
        console.log("\n\n Input goes as "+ userSignup(  GuestUserName, GuestUserPassword, Guestlog  ))
        userLogin(  GuestUserName, GuestUserPassword, Guestlog  ).then(()=> {onLogin(); })
      };


  return (
    <>
   <section className='auth-section'>
            { isSignup && <img src={icon} alt='stack overflow' className='login-logo' height={180} width={500}/>}
            <div className='auth-container-2'>
                { !isSignup && <img src={icon} alt='stack overflow' className='login-logo' height={110} width={300}/>}

                <div className='google-guest-container'> 
                <button className="google-signin-button" onClick={handleGoogleSignIn}>
                    <img className="google-logo" src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" />
                    Sign in with Google
                </button>
                <button className="guest-signin-button" onClick={handleGuestSignIn}>
                    Guest Mode
                </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {
                        isSignup && (
                            <label htmlFor='name'>
                                <h4>Username</h4>
                                <input type="text" id='name' name='name' onChange={(e) => {setName(e.target.value)}}/>
                            </label>
                        )
                    }
                    <label htmlFor="email">
                        <h4>Email</h4>
                        <input type="email" name='email' id='email' onChange={(e) => {setEmail(e.target.value)}}/>
                    </label>
                    <label htmlFor="password">
                        <div style={{display:"flex", justifyContent:"space-between"}}>
                            <h4>Password</h4>
                            { !isSignup && <p style={{ color: "#91b014", fontSize:'13px'}}>forgot password?</p> }
                        </div>
                        <input type="password" name='password' id='password' onChange={(e) => {setPassword(e.target.value)}}/>
                        { isSignup && <p style={{ color: "#666767", fontSize:"13px"}}>Passwords must contain at least eight<br />characters, including at least 1 letter and 1<br /> number.</p> }
                    </label>
                    {
                        isSignup && (
                            <label htmlFor='check'>
                                <input type="checkbox" id='check' height={80} width={80}/>
                                <p style={{ fontSize:"13px"}}>Terms,<br />And Conditions.</p>
                            </label>
                        )
                    }
                    <button type='submit' className='auth-btn'>{ isSignup ? 'Sign up': 'Log in'}</button>
                    {
                        isSignup && (
                            <p style={{ color: "#666767", fontSize:"13px"}}>
                                By clicking “Sign up”, you agree to our 
                                <span style={{ color: "#91b014"}}> terms of<br /> service</span>,
                                <span style={{ color: "#91b014"}}> privacy policy</span> and 
                                <span style={{ color: "#91b014"}}> cookie policy</span>
                            </p>
                        )
                    }
                </form>
                <p>
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}
                    <button type='button' className='handle-switch-btn' onClick={handleSwitch}>{ isSignup ? "Log in" : 'sign up'}</button>
                </p>
            </div>
        </section>
    </>
  );
};

export default LoginPage;
