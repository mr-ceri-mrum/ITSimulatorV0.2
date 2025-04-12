import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Container,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';

import { startGame } from '../../store/gameSlice';
import { setCompanyName } from '../../store/companySlice';
import { initializeMarket } from '../../store/marketSlice';

const StartScreen = ({ toggleTheme, darkMode }) => {
  const dispatch = useDispatch();
  const [companyName, setCompanyNameState] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [howToPlayDialogOpen, setHowToPlayDialogOpen] = useState(false);

  const handleStartGame = () => {
    if (!companyName.trim()) {
      setCompanyNameError('Please enter a company name');
      return;
    }

    dispatch(setCompanyName(companyName));
    dispatch(initializeMarket());
    dispatch(startGame());
  };

  const handleCompanyNameChange = (e) => {
    setCompanyNameState(e.target.value);
    if (e.target.value.trim()) {
      setCompanyNameError('');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        background: darkMode 
          ? 'linear-gradient(to bottom, #1a237e, #311b92)' 
          : 'linear-gradient(to bottom, #e3f2fd, #bbdefb)',
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={8} 
          sx={{ 
            padding: 4, 
            textAlign: 'center',
            background: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <IconButton onClick={toggleTheme} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          <Typography variant="h2" component="h1" gutterBottom>
            IT Simulator
          </Typography>
          
          <Typography variant="h5" component="h2" gutterBottom>
            Build your tech empire from scratch
          </Typography>

          <Box 
            component="img" 
            src="/logo.png" // You'll need to add a logo image
            alt="IT Simulator Logo"
            sx={{ 
              maxWidth: 300, 
              width: '100%', 
              height: 'auto', 
              margin: '24px auto',
              display: 'block',
            }}
          />

          <Box sx={{ marginTop: 4, marginBottom: 4 }}>
            <TextField
              label="Company Name"
              variant="outlined"
              fullWidth
              value={companyName}
              onChange={handleCompanyNameChange}
              error={!!companyNameError}
              helperText={companyNameError}
              sx={{ marginBottom: 2 }}
            />

            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={handleStartGame}
              sx={{ 
                marginTop: 2,
                fontSize: '1.2rem',
                padding: '12px 30px',
              }}
            >
              Start Your Company
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3 }}>
            <Button 
              startIcon={<InfoIcon />} 
              onClick={() => setAboutDialogOpen(true)}
            >
              About
            </Button>
            <Button 
              startIcon={<HelpIcon />} 
              onClick={() => setHowToPlayDialogOpen(true)}
            >
              How to Play
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* About Dialog */}
      <Dialog 
        open={aboutDialogOpen} 
        onClose={() => setAboutDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>About IT Simulator</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            IT Simulator is an economic strategy game where you create and develop your own IT company from scratch.
          </Typography>
          <Typography paragraph>
            Starting in 2004 with an initial capital of $1,000,000, your goal is to grow your startup into a tech giant
            by creating successful products, hiring talented employees, and making strategic business decisions.
          </Typography>
          <Typography paragraph>
            The game simulates a realistic market environment with 300 competitive companies that evolve over time,
            creating a dynamic challenge that will test your business acumen and strategic thinking.
          </Typography>
          <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
            Version 0.2 - Copyright 2025
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAboutDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* How to Play Dialog */}
      <Dialog 
        open={howToPlayDialogOpen} 
        onClose={() => setHowToPlayDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>How to Play</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Getting Started
          </Typography>
          <Typography paragraph>
            1. Enter your company name and start the game.
          </Typography>
          <Typography paragraph>
            2. You begin with $1,000,000 in capital in January 2004.
          </Typography>
          <Typography paragraph>
            3. Develop your first product by choosing a product type and allocating resources.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
            Core Gameplay
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Resource Management" 
                secondary="Hire employees, buy servers, and set marketing budgets to support your products."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Product Development" 
                secondary="Create new products by allocating resources across backend, frontend, infrastructure, AI, and databases."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Market Competition" 
                secondary="Compete with 300 AI-driven companies that will develop their own products and acquire companies."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Product Updates" 
                secondary="Keep your products fresh with updates to maintain and improve quality."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Acquisitions" 
                secondary="Acquire competitor companies or individual products to expand your empire."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
            Game Controls
          </Typography>
          <Typography paragraph>
            • Use the time controls to pause the game or change the speed (1x, 2x, 4x).
          </Typography>
          <Typography paragraph>
            • Navigate through the dashboard, product management, market analysis, and company management panels.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
            Winning the Game
          </Typography>
          <Typography paragraph>
            The goal is to build the most successful IT company with the highest valuation, market share, and quality products.
            There's no fixed end point - continue growing your tech empire as long as you want!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHowToPlayDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StartScreen;
