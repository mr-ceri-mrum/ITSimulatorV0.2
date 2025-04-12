import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  cash: 1000000, // Starting capital: $1,000,000
  valuation: 1000000,
  employees: 0,
  servers: 0,
  marketingBudget: 0,
  totalUsers: 0,
  reputation: 50, // 0-100 scale
  foundedDate: '2004-01-01', // January 2004 as per game description
  history: [], // Financial history for charts
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyName: (state, action) => {
      state.name = action.payload;
    },
    updateCash: (state, action) => {
      state.cash = Math.max(0, state.cash + action.payload);
      
      // Add to financial history
      state.history.push({
        date: new Date().toISOString(),
        cashBalance: state.cash,
        valuation: state.valuation,
        totalUsers: state.totalUsers,
      });
    },
    updateValuation: (state, action) => {
      state.valuation = Math.max(0, action.payload);
    },
    hireEmployees: (state, action) => {
      const count = action.payload;
      const cost = count * 17000; // $17,000 per employee as per game description
      
      if (state.cash >= cost) {
        state.employees += count;
        state.cash -= cost;
      }
    },
    fireEmployees: (state, action) => {
      state.employees = Math.max(0, state.employees - action.payload);
    },
    addServers: (state, action) => {
      const count = action.payload;
      const cost = count * 10; // $10 per server as per game description
      
      if (state.cash >= cost) {
        state.servers += count;
        state.cash -= cost;
      }
    },
    removeServers: (state, action) => {
      state.servers = Math.max(0, state.servers - action.payload);
    },
    setMarketingBudget: (state, action) => {
      // Ensure we don't set a negative budget
      state.marketingBudget = Math.max(0, action.payload);
    },
    updateTotalUsers: (state, action) => {
      state.totalUsers = Math.max(0, action.payload);
    },
    updateReputation: (state, action) => {
      // Keep reputation between 0-100
      state.reputation = Math.max(0, Math.min(100, action.payload));
    },
    payExpenses: (state, action) => {
      // Monthly expenses: employee salaries, server maintenance, marketing
      const employeeCost = state.employees * 25000; // $25,000 per employee per month
      const serverCost = state.servers * 10; // $10 per server per month
      const marketingCost = state.marketingBudget;
      
      const totalExpenses = employeeCost + serverCost + marketingCost;
      
      if (state.cash >= totalExpenses) {
        state.cash -= totalExpenses;
      } else {
        // Not enough cash - reduce marketing first
        let remainingCash = state.cash;
        
        // Adjust marketing budget if needed
        if (remainingCash < marketingCost) {
          state.marketingBudget = remainingCash;
          remainingCash = 0;
        } else {
          remainingCash -= marketingCost;
        }
        
        // If still not enough, need to handle bankruptcy or debt in the game logic
        state.cash = remainingCash;
      }
    },
    payTaxes: (state, action) => {
      const profit = action.payload;
      if (profit > 0) {
        const taxAmount = profit * 0.23; // 23% tax rate as per game description
        state.cash -= Math.min(state.cash, taxAmount);
      }
    },
    calculateValuation: (state) => {
      // Simple valuation formula based on users, cash, and products (handled separately)
      // This will be enhanced by the products owned
      const userValue = state.totalUsers * 50; // $50 per user
      const cashValue = state.cash * 0.5; // Cash counts for 50% of its value
      
      // Basic valuation
      state.valuation = userValue + cashValue;
      
      // Minimum valuation is 10% of the cash
      state.valuation = Math.max(state.valuation, state.cash * 0.1);
    },
    resetCompany: () => initialState,
  },
});

export const {
  setCompanyName,
  updateCash,
  updateValuation,
  hireEmployees,
  fireEmployees,
  addServers,
  removeServers,
  setMarketingBudget,
  updateTotalUsers,
  updateReputation,
  payExpenses,
  payTaxes,
  calculateValuation,
  resetCompany,
} = companySlice.actions;

// Selectors
export const selectCompanyName = (state) => state.company.name;
export const selectCompanyCash = (state) => state.company.cash;
export const selectCompanyValuation = (state) => state.company.valuation;
export const selectEmployees = (state) => state.company.employees;
export const selectServers = (state) => state.company.servers;
export const selectMarketingBudget = (state) => state.company.marketingBudget;
export const selectTotalUsers = (state) => state.company.totalUsers;
export const selectReputation = (state) => state.company.reputation;
export const selectFoundedDate = (state) => state.company.foundedDate;
export const selectFinancialHistory = (state) => state.company.history;

export default companySlice.reducer;
