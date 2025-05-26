import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/signup.css';

// handler functions
import { registerHandle, validateName, validateEmail, validatePassword, validatePhone, validateCUI } from '../functionality/registerFun';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [isCompany, setIsCompany] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [cui, setCui] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const toggleCompanyField = (show) => {
        setIsCompany(show);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!validateName(firstName)) {
            setError('Invalid first name. It must start with a capital letter.');
            return;
        }
        if (!validateEmail(email)) {
            setError('Invalid email format.');
            return;
        }
        if (!validatePassword(password)) {
            setError('Password must be at least 6 characters long and include one uppercase letter and one number.');
            return;
        }
        if (!validatePhone(phone)) {
            setError('Invalid phone number. It must start with 07, 02, or 03 and have 10 digits.');
            return;
        }
        if (isCompany && (!validateCUI(cui) || companyName.trim() === '')) {
            setError('Invalid company details. Ensure CUI is 1-10 digits and company name is not empty.');
            return;
        }

        setError(''); // Clear any previous errors

        // Call the registerHandle function
        const response = await registerHandle(firstName, email, password, phone, isCompany, companyName, cui);

        if (response.ok) {
            navigate('/'); // Redirect to the homepage or another route
        } else {
            setError(response.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="signup-container">
            <div className="card">
                <div className="card2">
                    <form className="form" onSubmit={handleSubmit}>
                        <p id="heading">Create Account</p>

                        {/* First Name Field */}
                        <div className="field">
                            <svg
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                height="16"
                                width="16"
                                xmlns="http://www.w3.org/2000/svg"
                                className="input-icon"
                            >
                                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
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

                        {/* Email Field */}
                        <div className="field">
                            <svg
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                height="16"
                                width="16"
                                xmlns="http://www.w3.org/2000/svg"
                                className="input-icon"
                            >
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z" />
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

                        {/* Password Field */}
                        <div className="field">
                            <svg
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                height="16"
                                width="16"
                                xmlns="http://www.w3.org/2000/svg"
                                className="input-icon"
                            >
                                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
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

                        {/* Phone Number Field */}
                        <div className="field">
                            <svg
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                height="16"
                                width="16"
                                xmlns="http://www.w3.org/2000/svg"
                                className="input-icon"
                            >
                                <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
                            </svg>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        {/* Account Type Radio Buttons */}
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="account-type"
                                    value="individual"
                                    defaultChecked
                                    onClick={() => toggleCompanyField(false)}
                                />
                                Individual
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="account-type"
                                    value="company"
                                    onClick={() => toggleCompanyField(true)}
                                />
                                Company
                            </label>
                        </div>

                        {/* Company Name Field */}
                        {isCompany && (
                            <div className="field company-field">
                                <svg
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    height="16"
                                    width="16"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="input-icon"
                                >
                                    <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022zM6 8.694 1 10.36V15h5V8.694zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5V15z" />
                                    <path d="M2 11h1v1H2v-1zm2 0h1v1H4v-1zm-2 2h1v1H2v-1zm2 0h1v1H4v-1zm4-4h1v1H8V9zm2 0h1v1h-1V9zm-2 2h1v1H8v-1zm2 0h1v1h-1v-1zm2-2h1v1h-1V9zm0 2h1v1h-1v-1zM8 7h1v1H8V7zm2 0h1v1h-1V7zm2 0h1v1h-1V7zM8 5h1v1H8V5zm2 0h1v1h-1V5zm2 0h1v1h-1V5zm0-2h1v1h-1V3z" />
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
                        )}

                        {/* CUI Field */}
                        {isCompany && (
                            <div className="field company-field">
                                <svg
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    height="16"
                                    width="16"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="input-icon"
                                >
                                    <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9H5.5zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518l.087.02z" />
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                    <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
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
                        )}

                        
                        {/* Error Message */}
                        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                        {/* Buttons */}
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
};

export default Register;