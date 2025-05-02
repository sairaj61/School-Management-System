import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material';

const Navbar = () => {
  const location = useLocation();
  const getTabValue = () => {
    switch (location.pathname) {
      case '/': return 0;
      case '/students': return 1;
      case '/classes': return 2;
      case '/sections': return 3;
      case '/fees': return 4;
      case '/auto': return 5;
      default: return 0;
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          School Management System
        </Typography>
        <Tabs value={getTabValue()} textColor="inherit" indicatorColor="secondary">
          <Tab label="Dashboard" component={NavLink} to="/" />
          <Tab label="Students" component={NavLink} to="/students" />
          <Tab label="Classes" component={NavLink} to="/classes" />
          <Tab label="Sections" component={NavLink} to="/sections" />
          <Tab label="Fees" component={NavLink} to="/fees" />
          <Tab label="Auto" component={NavLink} to="/auto" />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;