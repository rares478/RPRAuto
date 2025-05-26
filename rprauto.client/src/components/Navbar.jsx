import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="container">
                <div className="nav-content">
                    <div className="nav-brand">
                        <Link to="/">
                            <h1>RPR Auto</h1>
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
                        <Link to="/account" className={`nav-link ${location.pathname === '/account' ? 'active' : ''}`}>
                            My Account
                        </Link>
                    </div>
                    <div className="nav-buttons">
                        <Link to="/login" className="btn btn-outline">Sign In</Link>
                        <Link to="/register" className="btn btn-primary">Register</Link>
                        <button className="btn btn-owner">Owner</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 