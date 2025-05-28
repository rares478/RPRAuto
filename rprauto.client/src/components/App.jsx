import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SiteSettingsProvider } from '../context/SiteSettingsContext';
import Navbar from './Navbar';
import Login from "./loginUI.jsx";
import Register from "./registerUI.jsx";
import MainPage from "./mainPageUI.jsx";
import Market from "./Market.jsx";
import Account from './Profile.jsx';
import Auction from './Auction.jsx';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <SiteSettingsProvider>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<MainPage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/market" element={<Market />} />
                                <Route path="/account" element={
                                    <ProtectedRoute>
                                        <Account />
                                    </ProtectedRoute>
                                } />
                                <Route path="/auctions" element={<Auction />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                    </div>
                </SiteSettingsProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
