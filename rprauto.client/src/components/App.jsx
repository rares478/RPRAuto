import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Login from "./loginUI.jsx";
import Register from "./registerUI.jsx";
import MainPage from "./mainPageUI.jsx";
import Market from "./Market.jsx";
import Account from './Profile.jsx';

const App = () => {
    return (
        <div className="app">
            <Router>
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/market" element={<Market />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/auctions" element={<MainPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </Router>
        </div>
    );
}

export default App;
