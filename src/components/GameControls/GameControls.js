import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  Paper,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedIcon from '@mui/icons-material/Speed';

const GameControls = ({ isPaused, gameSpeed, onPauseToggle, onSpeedChange }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Game Controls
        {isPaused && (
          <Chip
            size="small"
            color="warning"
            label="PAUSED"
            sx={{ ml: 1 }}
          />
        )}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Tooltip title={isPaused ? "Resume the game" : "Pause the game"}>
          <span> {/* Wrap to fix MUI warning */}
            <Button
              variant="contained"
              color={isPaused ? "primary" : "secondary"}
              startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
              onClick={onPauseToggle}
              fullWidth
            >
              {isPaused ? 'Resume Game' : 'Pause Game'}
            </Button>
          </span>
        </Tooltip>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" sx={{ mb: 0.5 }}>
            Game Speed: {gameSpeed}x
            {isPaused && " (will apply on resume)"}
          </Typography>
          
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Normal speed (1x)">
              <span> {/* Wrap to fix MUI warning */}
                <Button 
                  onClick={() => onSpeedChange(1)} 
                  disabled={gameSpeed === 1}
                  color={gameSpeed === 1 ? "primary" : "inherit"}
                >
                  1x
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Double speed (2x)">
              <span> {/* Wrap to fix MUI warning */}
                <Button 
                  onClick={() => onSpeedChange(2)} 
                  disabled={gameSpeed === 2}
                  color={gameSpeed === 2 ? "primary" : "inherit"}
                >
                  2x
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Quadruple speed (4x)">
              <span> {/* Wrap to fix MUI warning */}
                <Button 
                  onClick={() => onSpeedChange(4)} 
                  disabled={gameSpeed === 4}
                  color={gameSpeed === 4 ? "primary" : "inherit"}
                >
                  4x
                </Button>
              </span>
            </Tooltip>
          </ButtonGroup>
        </Box>
      </Box>
    </Paper>
  );
};

export default GameControls;