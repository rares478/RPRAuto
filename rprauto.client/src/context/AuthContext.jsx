import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyUserHandle } from '../functionality/authFun';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('authToken');
            console.log('Initial token check:', token); // Debug log
            if (token) {
                const isValid = await verifyUserHandle();
                console.log('Token validation result:', isValid); // Debug log
                setIsAuthenticated(isValid);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = (token) => {
        console.log('Setting token in login:', token); // Debug log
        // More permissive cookie settings for development
        Cookies.set("authToken", token, { 
            expires: 120,
            secure: window.location.protocol === 'https:',
            sameSite: 'lax',
            path: '/' // Add path to ensure cookie is available everywhere
        });
        console.log('Cookie after setting:', Cookies.get('authToken')); // Debug log
        setIsAuthenticated(true);
    };

    const logout = () => {
        Cookies.remove('authToken');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 