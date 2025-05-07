import React, { useState } from 'react';
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

  if (!token) {
    return (
      <Router>
        <CssBaseline />
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<StudentManager />} />
        <Route path="/classes" element={<ClassManager />} />
        <Route path="/sections" element={<SectionManager />} />
        <Route path="/fees" element={<FeeManager />} />
        <Route path="/auto" element={<AutoManager />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
