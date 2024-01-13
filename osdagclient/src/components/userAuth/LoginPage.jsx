import { useState, useContext, useEffect } from 'react';
// import { useHistory } from 'react-router-dom';
import './Auth.css';
import icon from '../../assets/logo-osdag.png';
// import { createJWTToken } from '../../context/ModuleState';
import { UserContext } from '../../context/UserState';
import { Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const generateRandomString = (length) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    return result;
  };
  let globalOTP = null;

const LoginPage = () => {
    const navigate = useNavigate();

    const { userSignup, userLogin, loginCredValid , verifyEmail, ForgetPassword, isLoggedIn, setIsLoggedIn , LoginMessage} = useContext(UserContext)
    const [isSignup, setIsSignup] = useState(false)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [verifyEmailModalVisible, setVerifyEmailModalVisible] = useState(false);
    const [verifyEmails, setVerifyEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [isInputDisabled, setInputDisabled] = useState(true);
    const [toggleForgotPassword, setToggleForgotPassword] = useState(false)

    const [fPasswordModalVisible, setFPasswordModalVisible] = useState(false);
    const [fPasswordEmail, setFPasswordEmail] = useState('')
    const [fPasswordNewPass, setFPasswordNewPass] = useState('')
    // const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        console.log("inside use effect in login page and isloggedin is:"+isLoggedIn)
        console.log("Done Action : inside use effect in login page and isloggedin")

        if (isLoggedIn) {
            console.log("isloggedin is true in side if statement of Loginpage")
            navigate('/home');
            console.log("inside If in login page and isloggedin is:"+isLoggedIn)
        }
      }, [isLoggedIn]);

    
    const handleSwitch = () => {
        setIsSignup(!isSignup)
    }

    // Handle EmailVerification
    const handleVerifyEmailModal = () => {
        setVerifyEmailModalVisible(true);
        setToggleForgotPassword(true)
        
      };

    const handleVerifyEmailModalClose = () => {
        setVerifyEmailModalVisible(false);
        setToggleForgotPassword(false)
      };

      const handleVerifyEmail =  () => {

        if(verifyEmails =="")
        {
            alert("Enter Email")
            return;
        }

        try {
         
            const response =  JSON.stringify(verifyEmail(verifyEmails));
            globalOTP = localStorage.getItem('otp')
            // alert(response.message+": "+ globalOTP)
            console.log("OTP received:", globalOTP);    
            
            // Enable the input if needed
            setInputDisabled(false);
        } catch (error) {
            console.error("Error in OTP:", error);
    
        }

      };

      const handleVerify = () => {
        // Get the OTP value from local storage
        const storedOTP = localStorage.getItem('otp');
    
        if (storedOTP === otp) {
            console.log('loginCredValid : ' , loginCredValid)
            console.log('OTP verification successful.');    
            localStorage.removeItem('otp');    
            globalOTP = null;    
            alert("OTP verification successful.")
            if(loginCredValid && !toggleForgotPassword){
                console.log('setting isLoggedIn')
                setIsLoggedIn(true)
            }else if(toggleForgotPassword){
                handleFPasswordModal();
                handleVerifyEmailModalClose();
            }


        } else {
            console.log('OTP verification failed.');   
            alert("Enter Validate OTP")
        }
    };
    
// End++++++++++++++++++++++++++++++++++++++++++

// Handle Forgot password
const handleFPasswordModal = () => {
    setFPasswordModalVisible(true);
  };

const handleFPasswordModalClose = () => {
    setFPasswordModalVisible(false);
  };

  const handleFPassword = () => {
    console.log("FP:"+fPasswordEmail)
    if(fPasswordNewPass==fPasswordEmail){

        ForgetPassword(fPasswordNewPass)
        alert("Password has been Changed")
        handleFPasswordModalClose();
        window.location.href = '/';
    }
    else{
        alert("Enter Valid New password")
    }


  };
// End++++++++++++++++++++++++++++++++++++++++++


    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!username || !password){
            alert('Enter email and password')
            return;
        }
        
        try{
            if(isSignup){
               
                if(!email){
                    alert("Enter a name to continue")
                    return;
                }
                
                // register
                console.log('input signup data : ')
                console.log('username : ' , username)
                console.log('email : ' , email)
                console.log('password : ' , password)
                userSignup( username , email , password , false )
                setIsSignup(false)
             
             
            }else{
                console.log('email getting passed : ' , email)
                userLogin( username , password , false).then((message)=>{
                    // alert("Message while Login : "+ message)
                    localStorage.setItem("username",username)
                })
                
                if(!loginCredValid){
                    console.log('There is an error in loggin in ')
                    console.log('login message : ' , LoginMessage)
                    alert(LoginMessage)
                }else if(loginCredValid){
                    console.log('login Message ; ' , LoginMessage)
                    setVerifyEmailModalVisible(true)
                    navigate('/home');
                }
                
                // navigation
                
            
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
        try{
            
            let GuestEmail = `GUEST.${generateRandomString(10)}`;
            GuestEmail += "@gmail.com"
            const GuestUserPassword = generateRandomString(12);
            console.log('Guest email : ' , GuestEmail)
            console.log('guest password : ' , GuestUserPassword)
            // setting the isGuest to true
           userLogin(  GuestEmail, GuestUserPassword, true )

            console.log("Done and state is :"+isLoggedIn)
            navigate('/home');
    
        }catch(e)
        {
            console.log('Error occurred while guest mode', e);
            alert('There was an error during login As Guest .');
        }
      };


  return (
    <>
   <section className='auth-section'>
            { isSignup && <img src={icon} alt='stack overflow' className='login-logo' height={180} width={500}/>}
            <div className='auth-container-2'>
                { !isSignup && <img src={icon} alt='stack overflow' className='login-logo' height={110} width={300}/>}

                <div className='google-guest-container'> 
                {/*<button className="google-signin-button" onClick={handleGoogleSignIn}>
                    <img className="google-logo" src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" />
                    Sign in with Google
                </button> */}
                <button className="guest-signin-button" onClick={handleGuestSignIn}>
                    Guest Mode
                </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {
                        isSignup && (
                            <label htmlFor="email">
                            <h4>Email</h4>
                            <input type="email" name='email' id='email' onChange={(e) => {setEmail(e.target.value)}}/>
                        </label>
                           
                        )
                    }
                    <label htmlFor='name'>
                                <h4>Username</h4>
                                <input type="text" id='name' name='name' onChange={(e) => {setUsername(e.target.value)}}/>
                    </label>

                    <label >
                        <div style={{display:"flex", justifyContent:"space-between"}}>
                            <h4>Password</h4>
                        </div>
                        <input type="password" name='password' id='password' onChange={(e) => {setPassword(e.target.value)}}/>
                        { !isSignup && <p style={{ color: "#91b014", fontSize:'13px'}} onClick={handleVerifyEmailModal} >Forgot Password?</p> }
                    </label>
                        <div style={{display:"flex", justifyContent:"space-between"}}>
                            <h4></h4>
                            {/* { !isSignup && <p style={{ color: "#91b014", fontSize:'13px'}} onClick={handleFPasswordModal}>Forgot Password?</p> } */}
                        </div>
                        { isSignup && <p style={{ color: "#666767", fontSize:"13px"}}>Passwords must contain at least eight<br />characters, including at least 1 letter and 1<br /> number.</p> }
                    {
                        isSignup && (
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                             <input
                                type="checkbox"
                                id="check"
                                height={80}
                                width={80}
                            />
                            <label htmlFor="check" style={{ marginLeft: "10px" }}>
                              <p style={{ fontSize: "13px", margin: 0 }}>Terms,<br />And Conditions.</p>
                            </label>
                          </div>
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
        {/* Verify Email Popup */}
        <Modal
        title="Email Verification"
        visible={verifyEmailModalVisible}
        onCancel={handleVerifyEmailModalClose}
        footer={[
            <Button key="cancel" onClick={handleVerifyEmailModalClose}>
              Cancel
            </Button>,
          ]}
      >
        <div className='verify-email-popup'>
        <img src={icon} alt='stack overflow' className='login-logo' height={110} width={300}/>
            <label htmlFor="verifyemail">
                <h4> Email :</h4>
                <input type="verifyemail" name='verifyemail' id='verifyemail' onChange={(e) => {setVerifyEmail(e.target.value)}}/>    
            </label>
            <label htmlFor="otp">
                <h4> Enter OTP :</h4>
                <input type="otp" name='otp' id='otp' onChange={(e) => {setOtp(e.target.value)}} disabled={isInputDisabled}/>    
            </label>
            <Button key="getotp" onClick={handleVerifyEmail}>
                Get OTP
            </Button>
            <Button key="verifyemailbtn" onClick={handleVerify}>
                Verify
            </Button>


        </div>
      </Modal>

{/* Forgot Password Popup */}
    <Modal
        title="Forgot Password"
        visible={fPasswordModalVisible}
        onCancel={handleFPasswordModalClose}
        footer={[
            <Button key="cancel" onClick={handleFPasswordModalClose}>
              Cancel
            </Button>,
          ]}
      >
        <div className='verify-email-popup'>
        <img src={icon} alt='stack overflow' className='login-logo' height={110} width={300}/>
            <label htmlFor="verifyemail">
                <h4>New Password :</h4>
                <input type="verifyemail" name='verifyemail' id='verifyemail' onChange={(e) => {setFPasswordEmail(e.target.value)}}/>    
            </label>
            <label htmlFor="verifyemail">
                <h4>Confirm Password :</h4>
                <input type="password" name='newPassword' id='newPassword' onChange={(e) => {setFPasswordNewPass(e.target.value)}}/>    
            </label>
            <Button key="submitverifyemail" onClick={handleFPassword}>
                Change password
            </Button>


        </div>
      </Modal>

    </>
  );
};

export default LoginPage;
