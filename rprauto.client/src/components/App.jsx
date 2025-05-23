import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// routes and pages
import MainPage from "./mainPageUI.jsx";
import Login from "./loginUI.jsx";
import Register from "./registerUI.jsx";
import Market from "./marketUI.jsx";

var App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/market" element={<Market />} />
            </Routes>
        </Router>
    );
}

export default App;
