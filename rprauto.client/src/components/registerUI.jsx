import React, { useState, useEffect } from 'react';
import { registerHandle } from '../functionality/registerFun';
import './styles/signup.css';

function Register() {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [individual, setIndividual] = useState(true);
    const [companyName, setCompanyName] = useState('');
    const [cui, setCui] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        registerHandle(firstName, email, password, phone, individual, companyName, cui);
    };

    return (
        <div className="signup-container">
            <div className="card">
                <div className="card2">
                    <form className="form" onSubmit={handleSubmit}>
                        <p id="heading">Create Account</p>

                        <div className="field">
                            <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" className="input-icon">
                                <path d="M8 8a3 3 0 1 0 0-6..." />
                            </svg>
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
                            <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" className="input-icon">
                                <path d="M0 4a2 2 0 0 1 2-2..." />
                            </svg>
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
                            <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" className="input-icon">
                                <path d="M8 1a2 2 0 0 1 2 2v4H6..." />
                            </svg>
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
                            <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" className="input-icon">
                                <path d="M3.654 1.328a.678..." />
                            </svg>
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
                                    checked={individual}
                                    onChange={() => setIndividual(true)}
                                />
                                Individual
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="account-type"
                                    value="company"
                                    checked={!individual}
                                    onChange={() => setIndividual(false)}
                                />
                                Company
                            </label>
                        </div>

                        {!individual && (
                            <>
                                <div className="field company-field">
                                    <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" className="input-icon">
                                        <path d="M14.763.075A.5.5 0 0 1..." />
                                    </svg>
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
                                    <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" className="input-icon">
                                        <path d="M5.5 9.511c.076.954.83 1.697..." />
                                    </svg>
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

                        {error && <p className="error-text">{error}</p>}

                        <div className="btn">
                            <button type="submit" className="button1">Sign Up</button>
                            <button type="button" className="button2" onClick={() => window.location.reload()}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
