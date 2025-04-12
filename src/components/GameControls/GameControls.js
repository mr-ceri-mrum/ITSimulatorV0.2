import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  Paper,
} from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedIcon from '@mui/icons-material/Speed';

const GameControls = ({ isPaused, gameSpeed, onPauseToggle, onSpeedChange }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Game Controls</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          color={isPaused ? "primary" : "secondary"}
          startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
          onClick={onPauseToggle}
          fullWidth
        >
          {isPaused ? 'Resume Game' : 'Pause Game'}
        </Button>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" sx={{ mb: 0.5 }}>
            Game Speed: {gameSpeed}x
          </Typography>
          
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => onSpeedChange(1)} 
              disabled={gameSpeed === 1}
              color={gameSpeed === 1 ? "primary" : "inherit"}
            >
              1x
            </Button>
            <Button 
              onClick={() => onSpeedChange(2)} 
              disabled={gameSpeed === 2}
              color={gameSpeed === 2 ? "primary" : "inherit"}
            >
              2x
            </Button>
            <Button 
              onClick={() => onSpeedChange(4)} 
              disabled={gameSpeed === 4}
              color={gameSpeed === 4 ? "primary" : "inherit"}
            >
              4x
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Paper>
  );
};

export default GameControls;
