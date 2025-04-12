import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  VolumeUp as VolumeUpIcon,
  Clear as ClearIcon,
  DeleteForever as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

import { resetGame, selectAchievements, saveGame } from '../../store/gameSlice';

const Settings = ({ onClose, toggleTheme, darkMode }) => {
  const dispatch = useDispatch();
  const achievements = useSelector(selectAchievements);
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(false); // placeholder for sound settings
  const [achievementsDialogOpen, setAchievementsDialogOpen] = React.useState(false);

  const handleSaveGame = () => {
    dispatch(saveGame());
    // Show feedback that game was saved - in a real implementation, this would save to localStorage or backend
    alert('Game saved successfully!');
  };

  const handleResetGame = () => {
    dispatch(resetGame());
    setResetDialogOpen(false);
    if (onClose) {
      onClose();
    }
    window.location.reload(); // Force reload to ensure everything resets properly
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Settings
        </Typography>
        <IconButton onClick={onClose}>
          <ClearIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List>
        <ListItem>
          <ListItemIcon>
            <DarkModeIcon />
          </ListItemIcon>
          <ListItemText primary="Dark Mode" />
          <Switch
            edge="end"
            onChange={toggleTheme}
            checked={darkMode}
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <VolumeUpIcon />
          </ListItemIcon>
          <ListItemText primary="Sound Effects" secondary="Enable sound effects in the game" />
          <Switch
            edge="end"
            onChange={() => setSoundEnabled(!soundEnabled)}
            checked={soundEnabled}
            disabled // Not implemented in this version
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        Game Data
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <Button 
          variant="outlined" 
          startIcon={<SaveIcon />}
          onClick={handleSaveGame}
        >
          Save Game
        </Button>
        
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={() => setResetDialogOpen(true)}
        >
          Reset Game
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<InfoIcon />}
          onClick={() => setAchievementsDialogOpen(true)}
        >
          View Achievements ({achievements.length})
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Alert severity="info">
          <Typography variant="body2">
            IT Simulator v0.2
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Created by a talented developer
          </Typography>
        </Alert>
      </Box>

      {/* Reset Game Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>
          Reset Game
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the game? This will delete all your progress and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetGame} color="error" variant="contained">
            Reset Game
          </Button>
        </DialogActions>
      </Dialog>

      {/* Achievements Dialog */}
      <Dialog
        open={achievementsDialogOpen}
        onClose={() => setAchievementsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Achievements
        </DialogTitle>
        <DialogContent>
          {achievements.length > 0 ? (
            <List>
              {achievements.map((achievement) => (
                <ListItem key={achievement.id}>
                  <ListItemText
                    primary={achievement.title}
                    secondary={
                      <>
                        <Typography variant="body2">
                          {achievement.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Unlocked: {new Date(achievement.timestamp).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
              You haven't unlocked any achievements yet. Keep playing to earn them!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAchievementsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
