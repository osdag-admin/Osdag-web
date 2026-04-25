import { useState, useEffect } from 'react';
import icon from '../assets/logo-osdag.png';
import { Modal, Button, Alert, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { clearAuthStorage } from "../utils/auth";
import { apiBase } from '../api';
import {
    signupWithFirebase,
    loginWithFirebase,
    loginWithGoogle,
    resetPassword,
    getFirebaseErrorMessage,
} from '../utils/firebaseAuth';
import { EmailVerificationStatus } from './EmailVerificationStatus';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
    const navigate = useNavigate();

    // Form states
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);

    // Error states
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal states
    const [fPasswordModalVisible, setFPasswordModalVisible] = useState(false);
    const [fPasswordEmail, setFPasswordEmail] = useState('');

    // Firebase user state (from shared auth hook)
    const { user: currentUser } = useAuth();

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

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        // Confirm Password validation
        if (isSignup) {
            if (!confirmPassword.trim()) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (confirmPassword !== password) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSwitch = () => {
        setIsSignup(!isSignup);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    // Handle Forgot password
    const handleFPasswordModal = () => {
        setFPasswordModalVisible(true);
        setFPasswordEmail('');
        setGeneralError('');
        setSuccessMessage('');
    };

    const handleFPasswordModalClose = () => {
        setFPasswordModalVisible(false);
        setFPasswordEmail('');
        setGeneralError('');
        setSuccessMessage('');
    };

    const handlePasswordReset = async () => {
        if (!fPasswordEmail.trim()) {
            setGeneralError("Please enter your email address");
            return;
        }

        if (!validateEmail(fPasswordEmail)) {
            setGeneralError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        setGeneralError('');
        setSuccessMessage('');

        try {
            await resetPassword(fPasswordEmail);
            setSuccessMessage("Password reset email sent! Please check your inbox and follow the instructions.");
            handleFPasswordModalClose();
        } catch (error) {
            console.error("Password reset error:", error);
            const errorMessage = getFirebaseErrorMessage(error.code);
            setGeneralError(errorMessage);
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
                // Firebase Email/Password Signup
                const { emailVerified } = await signupWithFirebase(email, password);

                setSuccessMessage("Account created successfully! Please check your email to verify your account.");
                setIsSignup(false);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                // Firebase Email/Password Login
                const { emailVerified, user } = await loginWithFirebase(email, password);

                // Always allow login - verification is for authorization, not authentication
                navigate('/home');
                
                // Show informational message if not verified
                if (!emailVerified) {
                    setSuccessMessage("Login successful! Please verify your email to create and save projects.");
                }
            }
        } catch (error) {
            console.error("Firebase Auth Error:", error);
            const errorMessage = getFirebaseErrorMessage(error.code);
            setGeneralError(errorMessage);
            
            // Handle specific account linking scenarios
            if (error.code === 'auth/email-already-in-use' && !isSignup) {
                setGeneralError('Account exists with this email. Please log in or use "Login with Google".');
            } else if (error.code === 'auth/wrong-password') {
                setGeneralError('Incorrect password. If you created this account with Google, please use "Login with Google" or reset your password.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestSignIn = async () => {
        setIsLoading(true);
        setGeneralError('');

        try {
            clearAuthStorage();
            // Guest mode is purely frontend - no backend call needed
            localStorage.setItem("userType", "guest");
            localStorage.setItem("username", "Guest");
            navigate('/home');
        } catch (error) {
            setGeneralError("Error entering guest mode. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setGeneralError('');
        setSuccessMessage('');
        
        try {
            console.log("Starting Google login...");
            const { user } = await loginWithGoogle();
            console.log("Google login successful. User:", user?.email);
            
            // Always allow login - verification is for authorization, not authentication
            navigate("/home");
            
            // Show informational message if not verified
            if (user && !user.emailVerified) {
                setSuccessMessage("Login successful! Please verify your email to create and save projects.");
            }
        } catch (error) {
            console.error("Firebase Google Login Error:", error);
            console.error("Error details:", {
                code: error.code,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            
            // Handle Firebase auth errors
            if (error.code) {
                const errorMessage = getFirebaseErrorMessage(error.code);
                setGeneralError(errorMessage);
            } else if (error.response) {
                // Handle backend errors
                const backendError = error.response.data?.error || error.response.data?.message || "Unknown backend error";
                console.error("Backend error:", backendError);
                if (backendError === "Invalid Firebase token" || backendError.includes("Invalid")) {
                    setGeneralError("Invalid Google authentication. Please try again.");
                } else if (backendError === "No token provided") {
                    setGeneralError("Authentication token missing. Please try again.");
                } else {
                    setGeneralError(`Login failed: ${backendError}`);
                }
            } else if (error.message) {
                // Handle other errors with messages
                setGeneralError(`Login failed: ${error.message}`);
            } else {
                // Handle network or other errors
                setGeneralError("Something went wrong. Please check your connection and try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', marginLeft: '50px', marginTop: '50px', width: '100%' }}>
                <div className="w-full max-w-md bg-white rounded-lg p-6">
                    {/* Logo */}
                    <img
                        src={icon}
                        alt="Osdag Logo"
                        className="mb-8"
                        height={150}
                        width={300}
                        style={{ padding: '0px 0px 0px 60px', marginBottom: '0px' }}  
                    />

                    {/* Alerts */}
                    <div className="w-full max-w-md space-y-4">
                        {generalError && (
                            <Alert
                                message={generalError}
                                type="error"
                                showIcon
                                closable
                                onClose={() => setGeneralError("")}
                            />
                        )}
                        {successMessage && (
                            <Alert
                                message={successMessage}
                                type="success"
                                showIcon
                                closable
                                onClose={() => setSuccessMessage("")}
                            />
                        )}
                        {/* Email Verification Status */}
                        {currentUser && !currentUser.emailVerified && (
                            <EmailVerificationStatus 
                                user={currentUser}
                                onVerified={() => {
                                    setSuccessMessage("Email verified! Redirecting...");
                                    setTimeout(() => navigate('/home'), 2000);
                                }}
                            />
                        )}
                    </div>

                    {/* Login Card */}
                    <div className="w-full max-w-md bg-white rounded-lg p-6">
                        <h2 className="text-center text-lg font-semibold mb-6">
                            {isSignup ? "Create an account" : "Log in to Osdag"}
                        </h2>

                        {/* Guest and Google buttons */}
                        <div className="space-y-3 mb-6">
                            {!isSignup && (
                                <Button
                                    onClick={handleGuestSignIn}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-3 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 font-medium hover:bg-gray-100"
                                >
                                    <span className="w-5 h-5 text-xl">👤</span>
                                    Continue as Guest    
                                </Button>
                            )}
                            <Button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 font-medium hover:bg-gray-100"
                            >
                                <img
                                    src="https://developers.google.com/identity/images/g-logo.png"
                                    alt="Google Logo"
                                    className="w-5 h-5"
                                />
                                {isSignup ? "Continue with Google" : "Log in with Google"}
                            </Button>
                        </div>

                        <div className="relative flex items-center justify-center my-4">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="mx-3 text-gray-500 text-sm">OR</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        {/* Email & Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-osdag-green ${
                                        errors.email ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-osdag-green ${
                                            errors.password ? "border-red-500" : "border-gray-300"
                                        }`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477a3 3 0 104.243 4.243M9.88 9.88A4.5 4.5 0 0114.12 14.12M6.44 6.44C4.5 8.07 3 10.4 3 12c0 1.6 1.5 3.93 3.44 5.56A11.975 11.975 0 0012 18a11.975 11.975 0 005.56-1.44C19.5 15.93 21 13.6 21 12c0-1.6-1.5-3.93-3.44-5.56A11.975 11.975 0 0012 6c-1.43 0-2.81.26-4.06.72" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.332 4.5 12 4.5c4.668 0 8.577 3.01 9.964 7.183.07.2.07.438 0 .639C20.577 16.49 16.668 19.5 12 19.5c-4.668 0-8.577-3.01-9.964-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="text-red-500 text-xs mt-1 block">{errors.password}</span>
                                )}
                            </div>

                            {isSignup && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-osdag-green ${
                                                errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                            }`}
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477a3 3 0 104.243 4.243M9.88 9.88A4.5 4.5 0 0114.12 14.12M6.44 6.44C4.5 8.07 3 10.4 3 12c0 1.6 1.5 3.93 3.44 5.56A11.975 11.975 0 0012 18a11.975 11.975 0 005.56-1.44C19.5 15.93 21 13.6 21 12c0-1.6-1.5-3.93-3.44-5.56A11.975 11.975 0 0012 6c-1.43 0-2.81.26-4.06.72" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.332 4.5 12 4.5c4.668 0 8.577 3.01 9.964 7.183.07.2.07.438 0 .639C20.577 16.49 16.668 19.5 12 19.5c-4.668 0-8.577-3.01-9.964-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword}</span>
                                    )}
                                </div>
                            )}

                            {!isSignup && (
                                <p
                                    className="text-osdag-green text-sm cursor-pointer hover:underline mt-1"
                                    onClick={handleFPasswordModal}
                                >
                                    Forgot password?
                                </p>
                            )}

                            {/* Login / Signup button */}
                            <button
                                type="submit"
                                className="w-full py-2 bg-osdag-green text-white rounded-md font-medium hover:bg-osdag-dark-green transition"
                                disabled={isLoading}
                            >
                                {isLoading ? <Spin size="small" /> : isSignup ? "Sign up" : "Log in"}
                            </button>
                        </form>

                        {/* Toggle login/signup */}
                        <p className="text-center text-sm text-gray-600 mt-4">
                            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                type="button"
                                onClick={handleSwitch}
                                className="text-osdag-green hover:underline font-medium"
                                disabled={isLoading}
                            >
                                {isSignup ? "Log in" : "Sign up"}
                            </button>
                        </p>
                    </div>

                    {/* Forgot Password Modal */}
                    <Modal
                        title="Reset Password"
                        visible={fPasswordModalVisible}
                        onCancel={handleFPasswordModalClose}
                        footer={[
                            <Button key="cancel" onClick={handleFPasswordModalClose}>
                                Cancel
                            </Button>,
                            <Button
                                key="send"
                                type="primary"
                                onClick={handlePasswordReset}
                                loading={isLoading}
                                disabled={!fPasswordEmail.trim()}
                            >
                                Send Reset Email
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
                                    className='mb-4'
                                />
                            )}

                            {successMessage && (
                                <Alert
                                    message={successMessage}
                                    type="success"
                                    showIcon
                                    className='mb-4'
                                />
                            )}

                            <p className="mb-4 text-sm text-gray-600">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            <label htmlFor="resetemail" className='flex flex-col'>
                                <h4 className='mb-2 mt-0'>Email:</h4>
                                <input
                                    type="email"
                                    name='resetemail'
                                    id='resetemail'
                                    value={fPasswordEmail}
                                    onChange={(e) => setFPasswordEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className='p-2.5 w-full border border-gray-300 text-sm m-1.5 rounded transition-colors duration-300 focus:outline-none focus:border-osdag-green focus:shadow-[0_0_0_2px_rgba(145,176,20,0.1)]'
                                />
                            </label>
                        </div>
                    </Modal>
                </div>
            </section>
        </>
    );
};

export default LoginPage;
