// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import { setUserData } from './slices/authSlice';

function App() {
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch();

    useEffect(() => {
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        if (storedUserData) {
            dispatch(setUserData(storedUserData));
        }
    }, [dispatch]);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={userData ? <Navigate to="/dashboard" replace /> : <LoginPage />}
                />
                <Route
                    path="/dashboard"
                    element={userData ? <Dashboard /> : <Navigate to="/" replace />}
                />
            </Routes>
        </Router>
    );
}

export default App;