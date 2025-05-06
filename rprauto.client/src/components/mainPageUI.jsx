import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/mainPage.css';

// handler functions
import { verifyUserHandle } from '../functionality/authFun';


const MainPage = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const valid = verifyUserHandle();
                setIsAuthenticated(valid);
            } catch (err) {
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <div className="main-container">
            {/* Top buttons */}
            <div className="buttons-container">
                {/* Left buttons */}
                <div className="left-buttons">
                    <div className="radio-wrapper">
                        <input type="radio" id="value-1" name="btn" className="input" />
                        <label className="btn" htmlFor="value-1">AUCTIONS</label>
                    </div>
                    <div className="radio-wrapper">
                        <input type="radio" id="value-2" name="btn" className="input" defaultChecked />
                        <label className="btn" htmlFor="value-2">MARKET</label>
                    </div>
                    <div className="radio-wrapper">
                        <input type="radio" id="value-3" name="btn" className="input" />
                        <label className="btn" htmlFor="value-3">LOCATION</label>
                    </div>
                </div>

                {/* Right buttons - based on auth status */}
                <div className="right-buttons">
                    {isAuthenticated ? (
                        <div className="radio-wrapper">
                            <input type="radio" id="profile" name="btn-right" className="input" />
                            <label className="btn" htmlFor="profile" onClick={() => navigate('/profile')}>
                                PROFILE
                            </label>
                        </div>
                    ) : (
                        <>
                            <div className="radio-wrapper">
                                <input type="radio" id="login" name="btn-right" className="input" />
                                <label className="btn" htmlFor="login" onClick={() => navigate('/login')}>
                                    LOGIN
                                </label>
                            </div>
                            <div className="radio-wrapper">
                                <input type="radio" id="register" name="btn-right" className="input" />
                                <label className="btn" htmlFor="register" onClick={() => navigate('/register')}>
                                    REGISTER
                                </label>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Search section */}
            <div className="search-section">
                <div className="search-container">
                    <div className="searchBox">
                        <input className="searchInput" type="text" placeholder="Search something" />
                        <button className="searchButton">
                            <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none">
                                <g clipPath="url(#clip0)">
                                    <g filter="url(#filter0_d)">
                                        <path d="M23.7953 23.9182L19.0585 19.1814M19.0585 19.1814C19.8188 18.4211 20.4219 17.5185 20.8333 16.5251C21.2448 15.5318 21.4566 14.4671 21.4566 13.3919C21.4566 12.3167 21.2448 11.252 20.8333 10.2587C20.4219 9.2653 19.8188 8.36271 19.0585 7.60242C18.2982 6.84214 17.3956 6.23905 16.4022 5.82759C15.4089 5.41612 14.3442 5.20435 13.269 5.20435C12.1938 5.20435 11.1291 5.41612 10.1358 5.82759C9.1424 6.23905 8.23981 6.84214 7.47953 7.60242C5.94407 9.13789 5.08105 11.2204 5.08105 13.3919C5.08105 15.5634 5.94407 17.6459 7.47953 19.1814C9.01499 20.7168 11.0975 21.5799 13.269 21.5799C15.4405 21.5799 17.523 20.7168 19.0585 19.1814Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                </g>
                                <defs>
                                    <filter id="filter0_d" x="-0.418947" y="3.70435" width="29.3879" height="29.3879">
                                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                        <feColorMatrix in="SourceAlpha" type="matrix"
                                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                                        <feOffset dy="4" />
                                        <feGaussianBlur stdDeviation="2" />
                                        <feComposite in2="hardAlpha" operator="out" />
                                        <feColorMatrix type="matrix"
                                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                                    </filter>
                                    <clipPath id="clip0">
                                        <rect width="28.469" height="28.469" fill="white" transform="translate(0.264648 0.526367)" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="purple-line"></div>
            </div>

            {/* Content container */}
            <div className="content-container">
                <div className="card-3d-container">
                    <div className="card-3d">
                        <div><img src="unu.png" alt="Image 1" /></div>
                        <div><img src="doi.png" alt="Image 2" /></div>
                        <div><img src="trei.png" alt="Image 3" /></div>
                        <div><img src="patru.png" alt="Image 4" /></div>
                        <div><img src="cinci.png" alt="Image 5" /></div>
                    </div>

                    {/* Radio Tiles from Uiverse */}
                    <div className="radio-inputs">
                        <label>
                            <input className="radio-input" type="radio" name="engine" />
                            <span className="radio-tile">
                                <span className="radio-icon"></span>
                                <span className="radio-label">Bicycle</span>
                            </span>
                        </label>
                        <label>
                            <input className="radio-input" type="radio" name="engine" defaultChecked />
                            <span className="radio-tile">
                                <span className="radio-icon"></span>
                                <span className="radio-label">Car</span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
