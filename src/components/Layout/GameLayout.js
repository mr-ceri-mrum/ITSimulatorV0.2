import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Snackbar,
  Alert,
  Paper,
  CssBaseline,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedIcon from '@mui/icons-material/Speed';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import Dashboard from '../Dashboard/Dashboard';
import Products from '../Products/Products';
import Development from '../Development/Development';
import Market from '../Market/Market';
import Management from '../Management/Management';
import Settings from '../Settings/Settings';
import Notifications from '../Notifications/Notifications';
import GameControls from '../GameControls/GameControls';

import { selectGamePaused, selectGameSpeed, selectUnreadNotifications, resumeGame, pauseGame } from '../../store/gameSlice';
import { selectCompanyName, selectCompanyCash, selectCompanyValuation } from '../../store/companySlice';
import { selectCurrentDate, formatDate, advanceTime } from '../../store/timeSlice';
import gameEngine from '../../game/GameEngine';

const drawerWidth = 240;

const GameLayout = ({ toggleTheme, darkMode }) => {
  const dispatch = useDispatch();
  const companyName = useSelector(selectCompanyName);
  const companyCash = useSelector(selectCompanyCash);
  const companyValuation = useSelector(selectCompanyValuation);
  const currentDate = useSelector(selectCurrentDate);
  const gamePaused = useSelector(selectGamePaused);
  const gameSpeed = useSelector(selectGameSpeed);
  const unreadNotifications = useSelector(selectUnreadNotifications);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Start the game engine
  useEffect(() => {
    console.log("GameLayout: Starting game engine. Game paused:", gamePaused);
    
    // Ensure game starts with proper paused state
    try {
      if (gamePaused) {
        console.log("GameLayout: Ensuring game engine is stopped as game is paused");
        gameEngine.stop();
      } else {
        console.log("GameLayout: Starting game engine as game is not paused");
        gameEngine.start();
        
        // Force advance time once to make sure it's working
        setTimeout(() => {
          if (!gamePaused) {
            console.log("GameLayout: Forcing initial time advance");
            dispatch(advanceTime());
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error managing game engine:", error);
    }
    
    return () => {
      console.log("GameLayout: Stopping game engine on unmount");
      gameEngine.stop();
    };
  }, [dispatch, gamePaused]);

  // Handle showing notifications
  useEffect(() => {
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[unreadNotifications.length - 1];
      setNotification({
        message: latestNotification.message,
        type: latestNotification.type,
      });
    }
  }, [unreadNotifications]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const togglePauseGame = () => {
    console.log("Toggling game pause state from UI");
    
    // Use gameEngine's toggle method to ensure state consistency
    gameEngine.togglePause();
  };

  const changeGameSpeed = (speed) => {
    console.log("Changing game speed to:", speed);
    
    // Only proceed if not paused or speed is actually changing
    if (!gamePaused || speed !== gameSpeed) {
      gameEngine.changeGameSpeed(speed);
    } else {
      console.log("Game is paused, will apply speed when resumed");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'development':
        return <Development />;
      case 'market':
        return <Market />;
      case 'management':
        return <Management />;
      default:
        return <Dashboard />;
    }
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" noWrap>
          {companyName || 'My Company'}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button selected={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button selected={activeTab === 'products'} onClick={() => handleTabChange('products')}>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>
        <ListItem button selected={activeTab === 'development'} onClick={() => handleTabChange('development')}>
          <ListItemIcon>
            <BuildIcon />
          </ListItemIcon>
          <ListItemText primary="Development" />
        </ListItem>
        <ListItem button selected={activeTab === 'market'} onClick={() => handleTabChange('market')}>
          <ListItemIcon>
            <StorefrontIcon />
          </ListItemIcon>
          <ListItemText primary="Market" />
        </ListItem>
        <ListItem button selected={activeTab === 'management'} onClick={() => handleTabChange('management')}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Management" />
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ padding: 2 }}>
        <GameControls 
          isPaused={gamePaused} 
          gameSpeed={gameSpeed} 
          onPauseToggle={togglePauseGame}
          onSpeedChange={changeGameSpeed}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {formatDate(currentDate)}
            {gamePaused && (
              <Typography 
                variant="subtitle1" 
                component="span" 
                sx={{ ml: 2, color: 'warning.main' }}
              >
                GAME PAUSED
              </Typography>
            )}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mx: 2 }}>
              Cash: ${companyCash.toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={{ mx: 2 }}>
              Valuation: ${companyValuation.toLocaleString()}
            </Typography>
            
            <IconButton 
              color="inherit" 
              onClick={() => setNotificationsOpen(true)}
            >
              <Badge badgeContent={unreadNotifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton 
              color="inherit" 
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
            
            <IconButton 
              color="inherit" 
              onClick={toggleTheme}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: darkMode ? 'background.default' : '#f5f7fa',
        }}
      >
        <Toolbar /> {/* Spacer for fixed app bar */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            minHeight: 'calc(100vh - 140px)',
            backgroundColor: darkMode ? 'background.paper' : '#ffffff' 
          }}
        >
          {renderContent()}
        </Paper>
      </Box>
      
      {/* Notifications Panel */}
      <Drawer
        anchor="right"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Notifications onClose={() => setNotificationsOpen(false)} />
        </Box>
      </Drawer>
      
      {/* Settings Panel */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Settings 
            onClose={() => setSettingsOpen(false)} 
            toggleTheme={toggleTheme} 
            darkMode={darkMode} 
          />
        </Box>
      </Drawer>
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification && (
          <Alert 
            onClose={closeNotification} 
            severity={notification.type || 'info'} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default GameLayout;