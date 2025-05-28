import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(Cookies.get('token') || null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('https://rprauto.onrender.com/auth/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(token),
                });

                if (!response.ok) {
                    logout();
                }
            } catch (error) {
                console.error('Token validation error:', error);
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [token]);

    const login = (newToken, user) => {
        setToken(newToken);
        setUserData(user);
        Cookies.set('token', newToken, { expires: 1 }); // Expires in 1 day
    };

    const logout = () => {
        setToken(null);
        setUserData(null);
        Cookies.remove('token');
    };

    const value = {
        token,
        userData,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token,
        isCompany: userData?.role === 'Company',
        isAdmin: userData?.role === 'Admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
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