import React, { useState } from 'react';
import { registerHandle } from '../functionality/registerFun';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './styles/signup.css';
import Cookies from 'js-cookie';

function Register() {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [individual, setIndividual] = useState(true);
    const [companyName, setCompanyName] = useState('');
    const [cui, setCui] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        try {
            const response = registerHandle(firstName, email, password, phone, individual, companyName, cui);

            if (response.success) {
                Cookies.set("authToken", response.token, { expires: 30, secure: true, sameSite: 'strict' });
                navigate('/');
            }
            // add else statement, where you show the message of the response
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="signup-container">
            <div className="card">
                <div className="card2">
                    <form className="form" onSubmit={handleSubmit}>
                        <p id="heading">Create Account</p>

                        <div className="field">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field">
                            <input
                                type="email"
                                className="input-field"
                                placeholder="Email"
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

                        <div className="field">
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="account-type"
                                    value="individual"
                                    checked={individual === true}
                                    onChange={() => setIndividual(true)}
                                />
                                Individual
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="account-type"
                                    value="company"
                                    checked={individual === false}
                                    onChange={() => setIndividual(false)}
                                />
                                Company
                            </label>
                        </div>

                        {!individual && (
                            <>
                                <div className="field company-field">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Company Name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="field company-field">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="CUI"
                                        value={cui}
                                        onChange={(e) => setCui(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="btn">
                            <button type="submit" className="button1">
                                Sign Up
                            </button>
                            <button type="button" className="button2" onClick={() => navigate('/')}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
