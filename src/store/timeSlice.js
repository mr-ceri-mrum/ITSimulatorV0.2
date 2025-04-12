import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentDate: new Date('2004-01-01').toISOString(), // January 2004 start date
  monthsPassed: 0,
  yearsPassed: 0,
  realTimeInterval: null, // Used to store the interval ID for game speed
  gameSpeed: 1, // Added game speed to time slice
};

export const timeSlice = createSlice({
  name: 'time',
  initialState,
  reducers: {
    advanceTime: (state) => {
      // Advance time by one month
      const currentDate = new Date(state.currentDate);
      let newMonth = currentDate.getMonth() + 1;
      let newYear = currentDate.getFullYear();
      
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
        state.yearsPassed++;
      }
      
      const newDate = new Date(newYear, newMonth, 1);
      state.currentDate = newDate.toISOString();
      state.monthsPassed++;
    },
    setRealTimeInterval: (state, action) => {
      state.realTimeInterval = action.payload;
    },
    // Added game speed action
    setGameSpeed: (state, action) => {
      state.gameSpeed = action.payload;
    },
    resetTime: () => initialState,
    setDate: (state, action) => {
      // For testing or special events
      state.currentDate = new Date(action.payload).toISOString();
      
      const startDate = new Date('2004-01-01');
      const newDate = new Date(action.payload);
      
      // Calculate months passed
      const monthDiff = (newDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (newDate.getMonth() - startDate.getMonth());
      
      state.monthsPassed = monthDiff;
      state.yearsPassed = Math.floor(monthDiff / 12);
    },
  },
});

export const {
  advanceTime,
  setRealTimeInterval,
  setGameSpeed, // Export the new action
  resetTime,
  setDate,
} = timeSlice.actions;

// Selectors
export const selectCurrentDate = (state) => state.time.currentDate;
export const selectMonthsPassed = (state) => state.time.monthsPassed;
export const selectYearsPassed = (state) => state.time.yearsPassed;
export const selectRealTimeInterval = (state) => state.time.realTimeInterval;
export const selectGameSpeed = (state) => state.time.gameSpeed; // Add game speed selector

// Helper functions for formatting dates
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

export default timeSlice.reducer;
