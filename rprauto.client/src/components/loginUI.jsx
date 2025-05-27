import React, { useState } from 'react';
import './styles/login.css'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// handler functions
import { loginHandle } from '../functionality/loginFun';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await loginHandle(email, password);

            if (response.success) {
                login(response.token);
                navigate('/');
            } else {
                setError(response.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }  
    };

    return (
        <div className="login-container">
            <div className="card">
                <div className="card2">
                    <form className="form" onSubmit={handleSubmit}>
                        <p id="heading">Login</p>
                        {error && <p className="error-message">{error}</p>}

                        <div className="field">
                            <svg viewBox="0 0 16 16" fill="currentColor" className="input-icon">
                                <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032..." />
                            </svg>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Email"
                                autoComplete="off"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <svg viewBox="0 0 16 16" fill="currentColor" className="input-icon">
                                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2z..." />
                            </svg>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="btn">
                            <button type="submit" className="logInBtn">
                                Login
                            </button>
                            <button type="button" className="signUpBtn" onClick={() => navigate('/register')}>
                                Sign Up
                            </button>
                        </div>

                        <button type="button" className="forgotPasswordBtn" onClick={() => navigate('/forgot-password')}>
                            Forgot Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
