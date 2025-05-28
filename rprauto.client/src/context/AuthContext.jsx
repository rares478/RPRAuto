import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(Cookies.get('authToken') || null);
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
                    body: JSON.stringify(token)
                });

                if (!response.ok) {
                    throw new Error('Invalid token');
                }

                // Token is valid, decode it to get user info
                const decodedToken = jwtDecode(token);
                setUserData({
                    id: decodedToken.sub,
                    email: decodedToken.name,
                    role: decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                });
            } catch (error) {
                console.error('Token validation error:', error);
                setToken(null);
                setUserData(null);
                Cookies.remove('authToken');
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [token]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUserData(userData);
        Cookies.set('authToken', newToken, { expires: 1 }); // Expires in 1 day
    };

    const logout = () => {
        setToken(null);
        setUserData(null);
        Cookies.remove('authToken');
    };

    const value = {
        token,
        userData,
        isLoading,
        isAuthenticated: !!token,
        isAdmin: userData?.role === 'Admin',
        isOwner: userData?.role === 'Owner' || userData?.role === 2 || userData?.role === '2' || userData?.role === 'Admin',
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
}; 