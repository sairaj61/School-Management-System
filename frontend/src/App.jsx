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
import AcademicYearManager from './components/AcademicYearManager';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    // Store the token in local storage and set it in state
    console.log('Login successful, token:', newToken);
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    console.log('Logout successful, token:', token);
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <CssBaseline />
      <Routes>
        {token ? (
          <Route path="/*" element={<AuthenticatedApp onLogout={handleLogout} />} />
        ) : (
          <Route path="/*" element={<UnauthenticatedApp onLogin={handleLogin} />} />
        )}
      </Routes>
    </Router>
  );
};

const AuthenticatedApp = ({ onLogout }) => {
  return (
    <>
      <Navbar onLogout={onLogout} />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<StudentManager />} />
        <Route path="/classes" element={<ClassManager />} />
        <Route path="/sections" element={<SectionManager />} />
        <Route path="/fees" element={<FeeManager />} />
        <Route path="/auto" element={<AutoManager />} />
        <Route path="/academic-years" element={<AcademicYearManager />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
};

const UnauthenticatedApp = ({ onLogin }) => {
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;