import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/signup.css';

// handler functions
import { registerHandle, validateName, validateEmail, validatePassword, validatePhone, validateCUI } from '../functionality/registerFun';

const SignUp = () => {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [isCompany, setIsCompany] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [cui, setCui] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!validateName(firstName)) {
            setError('First name must start with a capital letter and contain only letters.');
            return;
        }
    
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
    
        if (phone && !validatePhone(phone)) {
            setError('Phone number must start with 07, 02, or 03 and contain 10 digits.');
            return;
        }
    
        if (!validatePassword(password)) {
            setError('Password must contain at least one uppercase letter and one number.');
            return;
        }
    
        if (isCompany) {
            if (!validateName(companyName)) {
                setError('Company name must start with a capital letter.');
                return;
            }
            if (!validateCUI(cui)) {
                setError('CUI must be a number with up to 10 digits.');
                return;
            }
        }

        try {
            const result = await registerHandle(
                firstName,
                email,
                password,
                phone,
                isCompany,
                isCompany ? companyName : '',
                isCompany ? cui : ''
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
                                    checked={!isCompany}
                                    onChange={() => setIsCompany(false)}
                                />
                                Individual
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="account-type"
                                    checked={isCompany}
                                    onChange={() => setIsCompany(true)}
                                />
                                Company
                            </label>
                        </div>

                        {isCompany && (
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
