import React, { useState } from 'react';
import { loginHandle } from '../functionality/loginFun';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './styles/login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginHandle(email, password);

            if (response.success) {
                Cookies.set("authToken", response.token, { expires: 30, secure: true, sameSite: 'strict' });
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

                        <div className="field">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Email"
                                autoComplete="off"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field">
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="error-text">{error}</p>}

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
