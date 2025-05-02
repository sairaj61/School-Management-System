import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import StudentManager from './components/StudentManager';
import ClassManager from './components/ClassManager';
import SectionManager from './components/SectionManager';
import FeeManager from './components/FeeManager';
import AutoManager from './components/AutoManager';
import { CssBaseline } from '@mui/material';

const App = () => {
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
      </Routes>
    </Router>
  );
};

export default App;