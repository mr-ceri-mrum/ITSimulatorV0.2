import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import StartScreen from './components/StartScreen/StartScreen';
import GameLayout from './components/Layout/GameLayout';
import { selectGameStarted } from './store/gameSlice';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const gameStarted = useSelector(selectGameStarted);
  const [darkMode, setDarkMode] = useState(false);

  const theme = darkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!gameStarted ? (
          <StartScreen toggleTheme={toggleTheme} darkMode={darkMode} />
        ) : (
          <GameLayout toggleTheme={toggleTheme} darkMode={darkMode} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;