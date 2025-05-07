// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentManager from './components/StudentManager';
import ClassManager from './components/ClassManager';
import SectionManager from './components/SectionManager';
import FeeManager from './components/FeeManager';
import AutoManager from './components/AutoManager';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <CssBaseline />
      {token && <Navbar onLogout={handleLogout} />}
      <Routes>
        {/* Public Routes */}
        {!token && (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}

        {/* Private Routes */}
        {token && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<StudentManager />} />
            <Route path="/classes" element={<ClassManager />} />
            <Route path="/sections" element={<SectionManager />} />
            <Route path="/fees" element={<FeeManager />} />
            <Route path="/auto" element={<AutoManager />} />
            <Route path="/login" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
