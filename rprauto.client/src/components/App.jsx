import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// routes and pages
import Page from "./mainPageUI.jsx";
import Login from "./loginUI.jsx";
import Register from "./registerUI.jsx";


var App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Page />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Page />} />
            </Routes>
        </Router>
    );
}

export default App;
