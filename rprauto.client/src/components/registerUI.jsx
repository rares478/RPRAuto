import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/signup.css';

// handler functions
import { registerHandle } from '../functionality/registerFun';

const SignUp = () => {
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
            const result = registerHandle(
                firstName,
                email,
                password,
                phone,
                individual ? 'individual' : 'company',
                individual ? '' : companyName,
                individual ? '' : cui
            );

            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Registration failed.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        }
    };

    return (
        <div className="signup-container">
            <div className="card">
                <div className="card2">
                    <form className="form" onSubmit={handleSubmit}>
                        <p id="heading">Create Account</p>

                        {error && <p style={{ color: 'red' }}>{error}</p>}

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
                                    checked={individual}
                                    onChange={() => setIndividual(true)}
                                />
                                Individual
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="account-type"
                                    checked={!individual}
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
                            <button type="submit" className="button1">Sign Up</button>
                            <button type="button" className="button2" onClick={() => navigate('/')}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
