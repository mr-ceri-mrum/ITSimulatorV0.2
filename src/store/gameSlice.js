import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  started: false,
  paused: false,
  gameSpeed: 1, // 1x, 2x, 4x
  notifications: [],
  achievements: [],
  lastSaved: null,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.started = true;
      state.paused = false;
      state.lastSaved = new Date().toISOString();
    },
    pauseGame: (state) => {
      state.paused = true;
    },
    resumeGame: (state) => {
      state.paused = false;
    },
    setGameSpeed: (state, action) => {
      state.gameSpeed = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info',
        timestamp: new Date().toISOString(),
        read: false,
      });
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    unlockAchievement: (state, action) => {
      if (!state.achievements.some(a => a.id === action.payload.id)) {
        state.achievements.push({
          ...action.payload,
          unlocked: true,
          timestamp: new Date().toISOString(),
        });
      }
    },
    resetGame: () => initialState,
    saveGame: (state) => {
      state.lastSaved = new Date().toISOString();
    },
  },
});

export const {
  startGame,
  pauseGame,
  resumeGame,
  setGameSpeed,
  addNotification,
  markNotificationAsRead,
  unlockAchievement,
  resetGame,
  saveGame,
} = gameSlice.actions;

// Selectors
export const selectGameStarted = (state) => state.game.started;
export const selectGamePaused = (state) => state.game.paused;
export const selectGameSpeed = (state) => state.game.gameSpeed;
export const selectNotifications = (state) => state.game.notifications;
export const selectUnreadNotifications = (state) => 
  state.game.notifications.filter(n => !n.read);
export const selectAchievements = (state) => state.game.achievements;
export const selectLastSaved = (state) => state.game.lastSaved;

export default gameSlice.reducer;
