import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Cookies from 'js-cookie';
import OwnerPanel from './OwnerPanel';
import './styles/navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, userData, isOwner } = useAuth();
    const { siteSettings } = useSiteSettings();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsDropdownOpen(false);
    };

    return (
        <>
            <nav className="navbar">
                <div className="container">
                    <div className="nav-content">
                        <div className="nav-brand">
                            <Link to="/">
                                <h1>{siteSettings.siteTitle}</h1>
                            </Link>
                        </div>
                        <div className="nav-links">
                            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                                Home
                            </Link>
                            <Link to="/market" className={`nav-link ${location.pathname === '/market' ? 'active' : ''}`}>
                                Marketplace
                            </Link>
                            <Link to="/auctions" className={`nav-link ${location.pathname === '/auctions' ? 'active' : ''}`}>
                                Auctions
                            </Link>
                        </div>
                        <div className="nav-account" ref={dropdownRef}>
                            <button 
                                className="account-button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                {isAuthenticated ? userData?.displayName || 'My Account' : 'My Account'}
                            </button>
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {isAuthenticated ? (
                                        <>
                                            <Link 
                                                to="/account" 
                                                className="dropdown-item"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Settings
                                            </Link>
                                            {isOwner && (
                                                <button 
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setIsOwnerPanelOpen(true);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    Owner Panel
                                                </button>
                                            )}
                                            <button 
                                                className="dropdown-item"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link 
                                                to="/login" 
                                                className="dropdown-item"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Login
                                            </Link>
                                            <Link 
                                                to="/register" 
                                                className="dropdown-item"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Sign Up
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <OwnerPanel 
                isOpen={isOwnerPanelOpen} 
                onClose={() => setIsOwnerPanelOpen(false)} 
            />
        </>
    );
};

export default Navbar; 