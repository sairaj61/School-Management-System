import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
  useScrollTrigger, // Import useScrollTrigger
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PaymentIcon from '@mui/icons-material/Payment';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SchoolIcon from '@mui/icons-material/School';
import appConfig from '../config/appConfig'; // Import the config file
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger(); // Hook to detect scroll
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
          <Toolbar
            sx={{
              minHeight: '64px',
              px: { xs: 2, sm: 4 },
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setAnchorEl(!anchorEl)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Fade in>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src={appConfig.logo}
                  alt="Logo"
                  style={{ height: '40px', width: '40px' }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {appConfig.appName}
                </Typography>
              </Box>
            </Fade>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  color="inherit"
                  startIcon={<DashboardIcon />}
                  component={NavLink}
                  to="/dashboard"
                >
                  Dashboard
                </Button>

                {/* Academic Management Dropdown */}
                <Box>
                  <Button
                    color="inherit"
                    startIcon={<SchoolIcon />}
                    onClick={handleMenuOpen}
                  >
                    Academic
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate('/students');
                      }}
                    >
                      <PeopleIcon sx={{ mr: 1 }} />
                      Students
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate('/classes');
                      }}
                    >
                      <ClassIcon sx={{ mr: 1 }} />
                      Classes
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate('/sections');
                      }}
                    >
                      <ViewWeekIcon sx={{ mr: 1 }} />
                      Sections
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate('/academic-years');
                      }}
                    >
                      <CalendarTodayIcon sx={{ mr: 1 }} />
                      Academic Years
                    </MenuItem>
                  </Menu>
                </Box>

                {/* Fee & Finance */}
                <Button
                  color="inherit"
                  startIcon={<PaymentIcon />}
                  component={NavLink}
                  to="/fees"
                >
                  Finance
                </Button>

                {/* Transport Management */}
                <Button
                  color="inherit"
                  startIcon={<DirectionsBusIcon />}
                  component={NavLink}
                  to="/auto"
                >
                  Transport
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleLogout}
                  sx={{ ml: 2 }}
                >
                  Logout
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Toolbar sx={{ mb: 2 }} />
    </>
  );
};

export default Navbar;