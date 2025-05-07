import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import Login from "./loginUI.jsx";
import Register from "./registerUI.jsx";
import MainPage from "./mainPageUI.jsx";



var App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;
