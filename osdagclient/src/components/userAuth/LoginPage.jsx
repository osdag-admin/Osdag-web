import { useState } from 'react';
import './Auth.css'
import icon from '../../assets/logo-osdag.png'

const LoginPage = ({ onLogin }) => {
    const [isSignup, setIsSignup] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSwitch = () => {
        setIsSignup(!isSignup)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if(!email && !password){
            alert('Enter email and password')
        }
        if(isSignup){
            if(!name){
                alert("Enter a name to continue")
            }
            // dispatch(signup({ name, email, password }, navigate))
            // register

            // Temp Code
            if(email == 'test@gmail.com' && password == 'test') 
            {
                onLogin();
            }
            else{
                alert("Invalid Cradentials")
            }


            
        }else{
            // dispatch(login({ email, password }, navigate))
        // login
         // Temp Code
         if(email == 'test@gmail.com' && password == 'test') 
         {
             onLogin();
         }
         else{
             alert("Invalid Cradentials")
         }
        }
    }

//   const handleUsernameChange = (event) => {
//     setUsername(event.target.value);
//   };

//   const handlePasswordChange = (event) => {
//     setPassword(event.target.value);
//   };



  return (
    <>
   <section class='auth-section'>
            { isSignup && <img src={icon} alt='stack overflow' className='login-logo' height={180} width={500}/>}
            <div class='auth-container-2'>
                { !isSignup && <img src={icon} alt='stack overflow' className='login-logo' height={110} width={300}/>}
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
