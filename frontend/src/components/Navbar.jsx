import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PaymentIcon from '@mui/icons-material/Payment';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import axiosInstance from '../utils/axiosConfig';
import useScrollTrigger from '@mui/material/useScrollTrigger';


function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/students', label: 'Students', icon: <PeopleIcon /> },
    { path: '/classes', label: 'Classes', icon: <ClassIcon /> },
    { path: '/sections', label: 'Sections', icon: <ViewWeekIcon /> },
    { path: '/fees', label: 'Fees', icon: <PaymentIcon /> },
    { path: '/auto', label: 'Auto', icon: <DirectionsBusIcon /> },
  ];

  const getTabValue = () =>
    navigationItems.findIndex((item) => item.path === location.pathname);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('http://localhost:8000/auth/jwt/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      window.location.reload();
    }
  };

  const drawer = (
    <List>
      {navigationItems.map((item) => (
        <ListItem
          button
          key={item.path}
          component={NavLink}
          to={item.path}
          onClick={handleDrawerToggle}
          sx={{
            color: 'inherit',
            '&.active': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            },
          }}
        >
          <Box sx={{ mr: 2 }}>{item.icon}</Box>
          <ListItemText primary={item.label} />
        </ListItem>
      ))}
      <ListItem button onClick={handleLogout} sx={{ color: 'inherit' }}>
        <Box sx={{ mr: 2 }}>
          <Typography variant="body1">Logout</Typography>
        </Box>
      </ListItem>
    </List>
  );

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="fixed"
          sx={{
            bgcolor: 'primary.main',
            boxShadow: 2,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Toolbar sx={{ minHeight: '64px', px: { xs: 2, sm: 4 } }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Fade in>
              <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                School Management
              </Typography>
            </Fade>

            {!isMobile && (
              <>
                <Tabs
                  value={getTabValue()}
                  textColor="inherit"
                  indicatorColor="secondary"
                  sx={{
                    '& .MuiTab-root': {
                      minWidth: 'auto',
                      minHeight: '64px',
                      px: 3,
                      color: 'white',
                      opacity: 0.7,
                      transition: 'all 0.2s',
                      '&:hover': {
                        opacity: 1,
                        transform: 'translateY(-2px)',
                        bgcolor: 'primary.dark',
                      },
                      '&.Mui-selected': {
                        opacity: 1,
                        fontWeight: 'bold',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                    },
                  }}
                >
                  {navigationItems.map((item) => (
                    <Tab
                      key={item.path}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.icon}
                          <span>{item.label}</span>
                        </Box>
                      }
                      component={NavLink}
                      to={item.path}
                    />
                  ))}
                </Tabs>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleLogout}
                  sx={{ ml: 2 }}
                >
                  Logout
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Toolbar sx={{ mb: 2 }} />

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            boxShadow: 2,
          },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            overflow: 'auto',
            px: 1,
            '& .MuiListItem-root': {
              borderRadius: 1,
              mb: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            },
          }}
        >
          {drawer}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
