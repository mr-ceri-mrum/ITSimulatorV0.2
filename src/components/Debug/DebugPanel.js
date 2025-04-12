import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import gameEngine from '../../game/GameEngine';
import { advanceTime } from '../../store/timeSlice';
import { selectCurrentDate, formatDate } from '../../store/timeSlice';
import { selectGamePaused, pauseGame, resumeGame } from '../../store/gameSlice';

const DebugPanel = () => {
  const dispatch = useDispatch();
  const currentDate = useSelector(selectCurrentDate);
  const gamePaused = useSelector(selectGamePaused);

  const handleForceTimeUpdate = () => {
    gameEngine.forceTimeUpdate();
  };

  const handleAdvanceMonth = () => {
    dispatch(advanceTime());
  };

  const handleAdvanceYear = () => {
    // Advance 12 months
    for (let i = 0; i < 12; i++) {
      dispatch(advanceTime());
    }
  };

  const handleTogglePause = () => {
    if (gamePaused) {
      dispatch(resumeGame());
      gameEngine.start();
    } else {
      dispatch(pauseGame());
      gameEngine.stop();
    }
  };

  const handleRestartEngine = () => {
    gameEngine.stop();
    setTimeout(() => {
      gameEngine.start();
    }, 1000);
  };

  return (
    <Paper sx={{ p: 2, m: 2, border: '2px solid red' }}>
      <Typography variant="h6" gutterBottom color="error">
        Debug Controls
      </Typography>
      <Divider sx={{ my: 1 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body2">
            Current Game Date: {formatDate(currentDate)}
          </Typography>
          <Typography variant="body2">
            Game Status: {gamePaused ? 'PAUSED' : 'RUNNING'}
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={handleForceTimeUpdate}
              size="small"
            >
              Force Time Update
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleAdvanceMonth}
              size="small"
            >
              Advance 1 Month
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleAdvanceYear}
              size="small"
            >
              Advance 1 Year
            </Button>
            
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleTogglePause}
              size="small"
            >
              {gamePaused ? 'Resume Game' : 'Pause Game'}
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={handleRestartEngine}
              size="small"
            >
              Restart Game Engine
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DebugPanel;
