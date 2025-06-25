import { useState, useContext, useEffect } from 'react';
// import { useHistory } from 'react-router-dom';
import './Auth.css';
import icon from '../../assets/logo-osdag.png';
// import { createJWTToken } from '../../context/ModuleState';
import { UserContext } from '../../context/UserState';
import { Modal, Button, Alert, Spin } from 'antd';
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

    const { 
        userSignup, 
        userLogin, 
        loginCredValid, 
        verifyEmail, 
        ForgetPassword, 
        isLoggedIn, 
        setIsLoggedIn, 
        LoginMessage,
        SignupMessage,
        OTPMessage 
    } = useContext(UserContext);

    // Form states
    const [isSignup, setIsSignup] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isOTPLoading, setIsOTPLoading] = useState(false);
    
    // Error states
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal states
    const [verifyEmailModalVisible, setVerifyEmailModalVisible] = useState(false);
    const [verifyEmails, setVerifyEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isInputDisabled, setInputDisabled] = useState(true);
    const [toggleForgotPassword, setToggleForgotPassword] = useState(false);
    const [fPasswordModalVisible, setFPasswordModalVisible] = useState(false);
    const [fPasswordEmail, setFPasswordEmail] = useState('');
    const [fPasswordNewPass, setFPasswordNewPass] = useState('');

    useEffect(() => {
        console.log("inside use effect in login page and isloggedin is:" + isLoggedIn)
        console.log("Done Action : inside use effect in login page and isloggedin")

        if (isLoggedIn) {
            console.log("isloggedin is true in side if statement of Loginpage")
            navigate('/home');
            console.log("inside If in login page and isloggedin is:" + isLoggedIn)
        }
    }, [isLoggedIn]);

    // Clear errors when switching between login/signup
    useEffect(() => {
        setErrors({});
        setGeneralError('');
        setSuccessMessage('');
    }, [isSignup]);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = 'Username is required';
        } else if (username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long';
        }

        if (isSignup && !email.trim()) {
            newErrors.email = 'Email is required';
        } else if (isSignup && !validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSwitch = () => {
        setIsSignup(!isSignup);
        setUsername('');
        setEmail('');
        setPassword('');
    };

    // Handle EmailVerification
    const handleVerifyEmailModal = () => {
        setVerifyEmailModalVisible(true);
        setToggleForgotPassword(true);
        setVerifyEmail('');
        setOtp('');
        setInputDisabled(true);
    };

    const handleVerifyEmailModalClose = () => {
        setVerifyEmailModalVisible(false);
        setToggleForgotPassword(false);
        setVerifyEmail('');
        setOtp('');
        setInputDisabled(true);
    };

    const handleVerifyEmail = async () => {
        if (!verifyEmails.trim()) {
            setGeneralError("Please enter your email address");
            return;
        }

        if (!validateEmail(verifyEmails)) {
            setGeneralError("Please enter a valid email address");
            return;
        }

        setIsOTPLoading(true);
        setGeneralError('');

        try {
            const response = await verifyEmail(verifyEmails);
            if (response && response.success) {
                globalOTP = localStorage.getItem('otp');
                setInputDisabled(false);
                setSuccessMessage("OTP sent successfully to your email");
            } else {
                setGeneralError(response?.message || "Failed to send OTP");
            }
        } catch (error) {
            setGeneralError("Error sending OTP. Please try again.");
        } finally {
            setIsOTPLoading(false);
        }
    };

    const handleVerify = () => {
        if (!otp.trim()) {
            setGeneralError("Please enter the OTP");
            return;
        }

        const storedOTP = localStorage.getItem('otp');

        if (storedOTP === otp) {
            localStorage.removeItem('otp');
            globalOTP = null;
            setSuccessMessage("OTP verification successful");
            
            if (loginCredValid && !toggleForgotPassword) {
                setIsLoggedIn(true);
            } else if (toggleForgotPassword) {
                handleFPasswordModal();
                handleVerifyEmailModalClose();
            }
        } else {
            setGeneralError("Invalid OTP. Please check and try again.");
        }
    };

    // Handle Forgot password
    const handleFPasswordModal = () => {
        setFPasswordModalVisible(true);
        setFPasswordEmail('');
        setFPasswordNewPass('');
    };

    const handleFPasswordModalClose = () => {
        setFPasswordModalVisible(false);
        setFPasswordEmail('');
        setFPasswordNewPass('');
    };

    const handleFPassword = async () => {
        if (!fPasswordNewPass.trim()) {
            setGeneralError("Please enter a new password");
            return;
        }

        if (fPasswordNewPass.length < 8) {
            setGeneralError("Password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);
        setGeneralError('');

        try {
            const response = await ForgetPassword(fPasswordNewPass);
            if (response && response.success) {
                setSuccessMessage("Password updated successfully! You can now log in.");
                handleFPasswordModalClose();
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                setGeneralError(response?.message || "Failed to update password");
            }
        } catch (error) {
            setGeneralError("Error updating password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setGeneralError('');
        setSuccessMessage('');

        try {
            if (isSignup) {
                const response = await userSignup(username, email, password, false);
                
                if (response && response.success) {
                    setSuccessMessage("Account created successfully! You can now log in.");
                    setIsSignup(false);
                    setUsername('');
                    setEmail('');
                    setPassword('');
                } else {
                    setGeneralError(response?.message || "Failed to create account");
                }
            } else {
                const response = await userLogin(username, password, false);
                
                if (response && response.success) {
                    localStorage.setItem("username", username);
                    if (response.isGuest) {
                        navigate('/home');
                    } else {
                        // For regular users, they need email verification
                        setVerifyEmailModalVisible(true);
                    }
                } else {
                    setGeneralError(response?.message || "Login failed");
                }
            }
        } catch (error) {
            setGeneralError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Google Auth
    const handleGoogleSignIn = () => {
        console.log('Google Sign-In button clicked!');
    };
    // Guest 

    const handleGuestSignIn = async () => {
        setIsLoading(true);
        setGeneralError('');

        try {
            let guestEmail = `GUEST.${generateRandomString(10)}@gmail.com`;
            const guestPassword = generateRandomString(12);
            
            const response = await userLogin(guestEmail, guestPassword, true);
            
            if (response && response.success) {
                localStorage.setItem("email", guestEmail);
                navigate('/home');
            } else {
                setGeneralError("Failed to enter guest mode. Please try again.");
            }
        } catch (error) {
            setGeneralError("Error entering guest mode. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <section className='auth-section'>
                {isSignup && <img src={icon} alt='stack overflow' className='login-logo' height={180} width={500} />}
                <div className='auth-container-2'>
                    {!isSignup && <img src={icon} alt='stack overflow' className='login-logo' height={110} width={300} />}

                    {/* Display general alerts */}
                    {generalError && (
                        <Alert
                            message={generalError}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setGeneralError('')}
                            style={{ marginBottom: '16px', width: '400px' }}
                        />
                    )}
                    
                    {successMessage && (
                        <Alert
                            message={successMessage}
                            type="success"
                            showIcon
                            closable
                            onClose={() => setSuccessMessage('')}
                            style={{ marginBottom: '16px', width: '400px' }}
                        />
                    )}

                    <div className='google-guest-container'>
                        {/*<button className="google-signin-button" onClick={handleGoogleSignIn}>
                    <img className="google-logo" src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" />
                    Sign in with Google
                </button> */}
                        <button 
                            className="guest-signin-button" 
                            onClick={handleGuestSignIn}
                            disabled={isLoading}
                        >
                            {isLoading ? <Spin size="small" /> : 'Guest Mode'}
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        {
                            isSignup && (
                                <label htmlFor="email">
                                    <h4>Email *</h4>
                                    <input 
                                        type="email" 
                                        name='email' 
                                        id='email' 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ borderColor: errors.email ? '#ff4d4f' : '' }}
                                    />
                                    {errors.email && <span style={{ color: '#ff4d4f', fontSize: '12px' }}>{errors.email}</span>}
                                </label>

                            )
                        }
                        <label htmlFor='name'>
                            <h4>Username *</h4>
                            <input 
                                type="text" 
                                id='name' 
                                name='name' 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ borderColor: errors.username ? '#ff4d4f' : '' }}
                            />
                            {errors.username && <span style={{ color: '#ff4d4f', fontSize: '12px' }}>{errors.username}</span>}
                        </label>

                        <label >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <h4>Password *</h4>
                            </div>
                            <input 
                                type="password" 
                                name='password' 
                                id='password' 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ borderColor: errors.password ? '#ff4d4f' : '' }}
                            />
                            {errors.password && <span style={{ color: '#ff4d4f', fontSize: '12px' }}>{errors.password}</span>}
                            {!isSignup && <p style={{ color: "#91b014", fontSize: '13px' }} onClick={handleVerifyEmailModal} >Forgot Password?</p>}
                        </label>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h4></h4>
                            {/* { !isSignup && <p style={{ color: "#91b014", fontSize:'13px'}} onClick={handleFPasswordModal}>Forgot Password?</p> } */}
                        </div>
                        {isSignup && <p style={{ color: "#666767", fontSize: "13px" }}>Passwords must contain at least eight<br />characters, including at least 1 letter and 1<br /> number.</p>}
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
                        <button type='submit' className='auth-btn' disabled={isLoading}>{isLoading ? <Spin size="small" /> : (isSignup ? 'Sign up' : 'Log in')}</button>
                        {
                            isSignup && (
                                <p style={{ color: "#666767", fontSize: "13px" }}>
                                    By clicking "Sign up", you agree to our
                                    <span style={{ color: "#91b014" }}> terms of<br /> service</span>,
                                    <span style={{ color: "#91b014" }}> privacy policy</span> and
                                    <span style={{ color: "#91b014" }}> cookie policy</span>
                                </p>
                            )
                        }
                    </form>
                    <p>
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}
                        <button type='button' className='handle-switch-btn' onClick={handleSwitch} disabled={isLoading}>{isSignup ? "Log in" : 'sign up'}</button>
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
                maskClosable={false}
            >
                <div className='verify-email-popup'>
                    <img src={icon} alt='stack overflow' className='login-logo' height={110} width={300} />
                    
                    {generalError && (
                        <Alert
                            message={generalError}
                            type="error"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    )}
                    
                    {successMessage && (
                        <Alert
                            message={successMessage}
                            type="success"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    )}
                    
                    <label htmlFor="verifyemail">
                        <h4>Email:</h4>
                        <input 
                            type="email" 
                            name='verifyemail' 
                            id='verifyemail' 
                            value={verifyEmails}
                            onChange={(e) => setVerifyEmail(e.target.value)}
                            placeholder="Enter your email address"
                        />
                    </label>
                    
                    <label htmlFor="otp">
                        <h4>Enter OTP:</h4>
                        <input 
                            type="text" 
                            name='otp' 
                            id='otp' 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)} 
                            disabled={isInputDisabled}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                        />
                    </label>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <Button 
                            key="getotp" 
                            onClick={handleVerifyEmail}
                            loading={isOTPLoading}
                            disabled={!verifyEmails.trim()}
                        >
                            Get OTP
                        </Button>
                        <Button 
                            key="verifyemailbtn" 
                            type="primary"
                            onClick={handleVerify}
                            disabled={isInputDisabled || !otp.trim()}
                        >
                            Verify
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Forgot Password Popup */}
            <Modal
                title="Reset Password"
                visible={fPasswordModalVisible}
                onCancel={handleFPasswordModalClose}
                footer={[
                    <Button key="cancel" onClick={handleFPasswordModalClose}>
                        Cancel
                    </Button>,
                    <Button 
                        key="update" 
                        type="primary" 
                        onClick={handleFPassword}
                        loading={isLoading}
                        disabled={!fPasswordNewPass.trim()}
                    >
                        Update Password
                    </Button>,
                ]}
                maskClosable={false}
            >
                <div>
                    {generalError && (
                        <Alert
                            message={generalError}
                            type="error"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    )}
                    
                    <label htmlFor="newpassword">
                        <h4>New Password:</h4>
                        <input 
                            type="password" 
                            name='newpassword' 
                            id='newpassword' 
                            value={fPasswordNewPass}
                            onChange={(e) => setFPasswordNewPass(e.target.value)}
                            placeholder="Enter new password (min 8 characters)"
                        />
                    </label>
                </div>
            </Modal>

        </>
    );
};

export default LoginPage;
