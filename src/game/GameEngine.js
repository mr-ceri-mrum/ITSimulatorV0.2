import { store } from '../store/store';
import {
  advanceTime,
  setRealTimeInterval,
  selectCurrentDate,
  selectGameSpeed,
  setGameSpeed,
} from '../store/timeSlice';
import {
  updateCash,
  updateTotalUsers,
  payExpenses,
  payTaxes,
  calculateValuation,
  selectCompanyCash,
  selectEmployees,
  selectServers,
  selectMarketingBudget,
} from '../store/companySlice';
import {
  updateProductUsers,
  updateProductQuality,
  updateProductMarketShare,
  selectOwnedProducts,
  selectActiveProducts,
  PRODUCT_TYPES,
} from '../store/productsSlice';
import {
  updateMarketTrends,
  updateCompaniesGrowth,
  generateMarketEvent,
  simulateCompetitorActions,
  selectCompanies,
  selectMarketSizes,
  selectMarketTrends,
} from '../store/marketSlice';
import {
  addNotification,
  pauseGame,
  resumeGame,
  selectGamePaused,
  saveGame,
  unlockAchievement,
} from '../store/gameSlice';

// SIMPLE GAME ENGINE - optimized for reliability
class GameEngine {
  constructor() {
    this.intervalId = null;
    this.lastUpdateTime = Date.now();
    
    console.log("GameEngine instance created");
  }

  start() {
    console.log("GameEngine.start() called");
    
    // Clear any existing interval to avoid duplicates
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Check if game is paused
    const state = store.getState();
    if (selectGamePaused(state)) {
      console.log("Game is paused, not starting");
      return;
    }
    
    // SIMPLE SETUP: 1 month = 60 seconds (1 minute) at 1x speed
    const baseMonthDuration = 60000; // 60 seconds in milliseconds
    const gameSpeed = selectGameSpeed(state);
    const updateInterval = Math.floor(baseMonthDuration / gameSpeed);
    
    console.log(`Starting game timer: 1 month = ${updateInterval}ms (${gameSpeed}x speed)`);
    
    // Set up interval for game updates
    try {
      this.intervalId = window.setInterval(() => {
        this.update();
      }, updateInterval);
      
      // Store interval ID in Redux
      store.dispatch(setRealTimeInterval(this.intervalId));
      
      // Force immediate first update for responsiveness
      setTimeout(() => this.update(), 1000);
    } catch (error) {
      console.error("Error setting up game interval:", error);
    }
  }

  stop() {
    console.log("GameEngine.stop() called");
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      store.dispatch(setRealTimeInterval(null));
    }
  }

  update() {
    console.log("Game update triggered");
    
    // Skip if game is paused
    const state = store.getState();
    if (selectGamePaused(state)) {
      console.log("Game is paused, skipping update");
      return;
    }

    // Get current game date
    const currentDate = selectCurrentDate(state);

    // Advance time by one month
    store.dispatch(advanceTime());
    
    // Get the new date after advancing
    const newDate = selectCurrentDate(store.getState());
    console.log(`Game date advanced: ${currentDate} -> ${newDate}`);

    // Update market conditions
    store.dispatch(updateMarketTrends({ date: currentDate }));
    
    // Occasionally generate market events
    store.dispatch(generateMarketEvent({ date: currentDate }));

    // Update competitor companies
    store.dispatch(updateCompaniesGrowth({ date: currentDate }));
    store.dispatch(simulateCompetitorActions({ date: currentDate }));

    // Update player's products
    this.updatePlayerProducts(currentDate);

    // Handle monthly expenses
    this.handleMonthlyExpenses();

    // Calculate company valuation
    store.dispatch(calculateValuation());
    
    // Check for achievements
    this.checkAchievements();

    // Autosave the game
    store.dispatch(saveGame());
  }

  updatePlayerProducts(currentDate) {
    const state = store.getState();
    const activeProducts = selectActiveProducts(state);
    const marketSizes = selectMarketSizes(state);
    const marketTrends = selectMarketTrends(state);
    const employees = selectEmployees(state);
    const servers = selectServers(state);
    const marketingBudget = selectMarketingBudget(state);

    // Skip if player has no products
    if (activeProducts.length === 0) {
      return;
    }

    let totalUsers = 0;
    let totalRevenue = 0;

    // Calculate per-product marketing budget
    const marketingPerProduct = marketingBudget / Math.max(1, activeProducts.length);

    activeProducts.forEach(product => {
      // Each marketing $1000 brings ~200 users for a new product
      const baseMarketingUsers = Math.floor((marketingPerProduct / 1000) * 200);
      
      // Quality affects marketing effectiveness
      const marketingModifier = product.quality / 5; // 0.2 to 2.0
      const marketingUsers = Math.floor(baseMarketingUsers * marketingModifier);
      
      // Monthly growth rate (percentage)
      const growthRate = 0.05 + (product.quality / 100); // 5-15% base growth
      
      // Calculate new users with growth plus marketing
      let newUsers = Math.floor(product.users * (1 + growthRate)) + marketingUsers;
      
      // For completely new products with no users
      if (product.users < 100) {
        newUsers = Math.max(newUsers, marketingUsers);
      }
      
      // Resource constraints
      const maxUsersByEmployees = employees * 5000;
      const maxUsersByServers = servers * 100;
      const resourceConstraint = Math.min(maxUsersByEmployees, maxUsersByServers);
      
      // Apply constraints
      newUsers = Math.min(newUsers, resourceConstraint);
      
      // Market size constraint
      const marketMaxSize = product.type ? PRODUCT_TYPES[product.type]?.maxMarketSize || 0 : 0;
      if (marketMaxSize > 0) {
        newUsers = Math.min(newUsers, marketMaxSize);
      }
      
      // Ensure non-negative users
      newUsers = Math.max(0, newUsers);
      
      console.log(`Product ${product.name}: ${product.users} → ${newUsers} users (+${marketingUsers} from marketing)`);
      
      // Update product users
      store.dispatch(updateProductUsers({
        id: product.id,
        users: newUsers
      }));
      
      // Quality degradation over time if not updated
      if (product.lastUpdate) {
        const lastUpdate = new Date(product.lastUpdate);
        const currDate = new Date(currentDate);
        const monthsSinceUpdate = (
          (currDate.getFullYear() - lastUpdate.getFullYear()) * 12 + 
          (currDate.getMonth() - lastUpdate.getMonth())
        );
        
        if (monthsSinceUpdate > 6) { // Degrade after 6 months without updates
          store.dispatch(updateProductQuality({
            id: product.id,
            quality: Math.max(1, product.quality - 0.2)
          }));
          
          // Notify player if quality drops below 5
          if (product.quality <= 5 && product.quality > 4.8) {
            store.dispatch(addNotification({
              message: `${product.name} quality is declining. Consider updating the product.`,
              type: 'warning'
            }));
          }
        }
      }
      
      // Calculate market share
      const category = product.type ? PRODUCT_TYPES[product.type]?.category : null;
      if (category) {
        const categoryMarketSize = marketSizes[category] || 0;
        if (categoryMarketSize > 0) {
          const marketShare = Math.min(100, (newUsers / categoryMarketSize) * 100);
          store.dispatch(updateProductMarketShare({
            id: product.id,
            marketSharePercentage: marketShare
          }));
        }
      }
      
      // Calculate revenue ($12 per user per month as per game description)
      const monthlyRevenue = newUsers * 12;
      
      totalUsers += newUsers;
      totalRevenue += monthlyRevenue;
    });
    
    // Update company's total users
    store.dispatch(updateTotalUsers(totalUsers));
    
    // Add revenue to company cash
    store.dispatch(updateCash(totalRevenue));
    
    return totalRevenue;
  }

  handleMonthlyExpenses() {
    const state = store.getState();
    const cash = selectCompanyCash(state);
    const employees = selectEmployees(state);
    const servers = selectServers(state);
    const marketingBudget = selectMarketingBudget(state);
    
    // Calculate expenses
    const employeeCost = employees * 25000; // $25,000 per employee per month
    const serverCost = servers * 10; // $10 per server per month
    const marketingCost = marketingBudget;
    
    const totalExpenses = employeeCost + serverCost + marketingCost;
    
    // Calculate profit for tax purposes
    const products = selectOwnedProducts(state);
    const totalRevenue = products.reduce((sum, product) => 
      product.status === 'active' ? sum + (product.users * 12) : sum, 0);
    
    const profit = totalRevenue - totalExpenses;
    
    // Pay expenses
    store.dispatch(payExpenses(totalExpenses));
    
    // Pay taxes on profit
    if (profit > 0) {
      store.dispatch(payTaxes(profit));
    }
    
    // Check for bankruptcy
    if (cash <= 0) {
      store.dispatch(pauseGame());
      store.dispatch(addNotification({
        message: 'Your company has gone bankrupt! Game paused.',
        type: 'error'
      }));
    }
  }
  
  checkAchievements() {
    const state = store.getState();
    const cash = selectCompanyCash(state);
    const totalUsers = state.company.totalUsers;
    const valuation = state.company.valuation;
    const products = selectOwnedProducts(state);
    const companies = selectCompanies(state);
    
    // Achievement: First Million
    if (cash >= 10000000) {
      store.dispatch(unlockAchievement({
        id: 'first_10_million',
        title: 'First $10M',
        description: 'Accumulated $10 million in cash.',
      }));
    }
    
    // Achievement: User Base
    if (totalUsers >= 1000000) {
      store.dispatch(unlockAchievement({
        id: 'million_users',
        title: 'Million Users Club',
        description: 'Reached 1 million users across all products.',
      }));
    }
    
    if (totalUsers >= 10000000) {
      store.dispatch(unlockAchievement({
        id: 'ten_million_users',
        title: 'Ten Million Users Club',
        description: 'Reached 10 million users across all products.',
      }));
    }
    
    if (totalUsers >= 100000000) {
      store.dispatch(unlockAchievement({
        id: 'hundred_million_users',
        title: 'Hundred Million Users Club',
        description: 'Reached 100 million users across all products.',
      }));
    }
    
    if (totalUsers >= 1000000000) {
      store.dispatch(unlockAchievement({
        id: 'billion_users',
        title: 'Billion Users Club',
        description: 'Reached 1 billion users across all products.',
      }));
    }
    
    // Achievement: Company Valuation
    if (valuation >= 1000000000) {
      store.dispatch(unlockAchievement({
        id: 'unicorn',
        title: 'Unicorn',
        description: 'Reached a company valuation of $1 billion.',
      }));
    }
    
    if (valuation >= 10000000000) {
      store.dispatch(unlockAchievement({
        id: 'decacorn',
        title: 'Decacorn',
        description: 'Reached a company valuation of $10 billion.',
      }));
    }
    
    if (valuation >= 100000000000) {
      store.dispatch(unlockAchievement({
        id: 'hectocorn',
        title: 'Hectocorn',
        description: 'Reached a company valuation of $100 billion.',
      }));
    }
    
    // Other achievements...
  }
  
  // Helper method to change game speed
  changeGameSpeed(speed) {
    console.log(`Changing game speed from ${store.getState().time.gameSpeed}x to ${speed}x`);
    
    // Update speed in Redux store
    store.dispatch(setGameSpeed(speed));
    
    // Restart the game loop with new speed (only if not paused)
    if (!selectGamePaused(store.getState())) {
      this.stop();
      this.start();
      
      store.dispatch(addNotification({
        message: `Game speed changed to ${speed}x`,
        type: 'info'
      }));
    }
  }
  
  // Helper method to toggle pause state
  togglePause() {
    const state = store.getState();
    const isPaused = selectGamePaused(state);
    
    console.log(`Toggling pause state. Current state: ${isPaused ? 'paused' : 'running'}`);
    
    if (isPaused) {
      // Resume the game
      store.dispatch(resumeGame());
      this.start();
      
      store.dispatch(addNotification({
        message: `Game resumed at ${state.time.gameSpeed}x speed`,
        type: 'info'
      }));
    } else {
      // Pause the game
      store.dispatch(pauseGame());
      this.stop();
      
      store.dispatch(addNotification({
        message: 'Game paused',
        type: 'info'
      }));
    }
  }
  
  // DEBUGGING: Force an immediate time update
  forceTimeUpdate() {
    console.log("Forcing time update...");
    this.update();
    
    return selectCurrentDate(store.getState());
  }
}

// Export singleton instance
const gameEngine = new GameEngine();
export default gameEngine;