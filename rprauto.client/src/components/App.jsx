import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import Login from "./loginUI.jsx";
import Register from "./registerUI.jsx";
import MainPageUI from "./MainPageUI.jsx";



var App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPageUI />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;
