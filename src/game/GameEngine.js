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

class GameEngine {
  constructor() {
    this.intervalId = null;
    this.watchdogId = null;
    this.lastUpdateTime = Date.now();
    
    // Debug counters
    this.updateCount = 0;
    this.lastLogTime = Date.now();
    
    console.log("GameEngine instance created");
  }

  start() {
    console.log("GameEngine.start() called");
    
    // Clean up any existing intervals
    this.cleanup();
    
    const state = store.getState();
    if (selectGamePaused(state)) {
      console.log("Game is paused, not starting engine");
      return;
    }
    
    // Set up a simple watchdog timer that ensures the game is running
    this.setupWatchdog();
    
    // Start the game loop
    this.startGameLoop();
  }
  
  cleanup() {
    console.log("Cleaning up intervals");
    
    // Clear main interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      store.dispatch(setRealTimeInterval(null));
    }
    
    // Clear watchdog
    if (this.watchdogId) {
      clearInterval(this.watchdogId);
      this.watchdogId = null;
    }
  }
  
  setupWatchdog() {
    // Set up a watchdog timer to ensure game keeps running
    this.watchdogId = setInterval(() => {
      const state = store.getState();
      const isPaused = selectGamePaused(state);
      
      if (!isPaused && !this.intervalId) {
        console.log("Watchdog detected game should be running but isn't, restarting");
        this.startGameLoop();
      }
    }, 5000); // Check every 5 seconds
  }
  
  startGameLoop() {
    const state = store.getState();
    const gameSpeed = selectGameSpeed(state);
    
    // Game speed: 1 month = 3 minutes at 1x speed
    const baseMonthDuration = 180000; // 3 minutes (180,000 ms)
    const updateInterval = baseMonthDuration / gameSpeed;
    
    console.log(`Starting game loop with ${updateInterval}ms interval (${gameSpeed}x speed)`);
    
    // Create a new interval
    this.intervalId = setInterval(() => {
      const currentState = store.getState();
      if (!selectGamePaused(currentState)) {
        this.update();
      }
    }, updateInterval);
    
    // Store the interval ID in Redux
    store.dispatch(setRealTimeInterval(this.intervalId));
    
    // Force first update immediately for responsiveness
    setTimeout(() => {
      const currentState = store.getState();
      if (!selectGamePaused(currentState)) {
        this.update();
      }
    }, 1000);
  }

  stop() {
    console.log("GameEngine.stop() called");
    this.cleanup();
  }

  update() {
    console.log("GameEngine.update() called");
    
    const state = store.getState();
    if (selectGamePaused(state)) {
      console.log("Game is paused, skipping update");
      return;
    }

    // Get current game date
    const currentDate = selectCurrentDate(state);
    console.log("Current game date before update:", currentDate);

    // Advance time by one month
    store.dispatch(advanceTime());
    
    // Log the new date
    const newDate = selectCurrentDate(store.getState());
    console.log("New game date after update:", newDate);

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
    
    console.log("GameEngine.update() completed");
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

    console.log("Marketing budget: $" + marketingBudget);

    activeProducts.forEach(product => {
      // Quality factor (0.5 to 1.5)
      const qualityFactor = (product.quality / 10) * 2;

      // Market trend factor
      const category = product.type ? PRODUCT_TYPES[product.type]?.category : null;
      const marketTrendFactor = category ? (marketTrends[category] || 1) : 1;

      // Resource factor - check if we have enough employees and servers
      // Each employee can support 5,000 users
      // Each server can support 100 users
      const maxUsersByEmployees = employees * 5000;
      const maxUsersByServers = servers * 100;
      const resourceConstraint = Math.min(maxUsersByEmployees, maxUsersByServers);
      
      // Resource factor based on capacity
      const resourceFactor = (
        resourceConstraint > product.users * 1.5 ? 1.0 :
        resourceConstraint > product.users * 1.1 ? 0.7 :
        resourceConstraint > product.users ? 0.3 :
        -0.2 // Users leave if resources are insufficient
      );
      
      // SIMPLIFIED MARKETING EFFECT
      // Direct impact based on marketing budget
      let marketingEffect = 0;
      
      if (marketingBudget > 0) {
        // Simple formula: every $1000 in marketing can attract up to 100 new users
        // More effective for high-quality products
        const baseMarketingUsers = (marketingBudget / 1000) * 100;
        const qualityMultiplier = product.quality / 5; // 0.2 to 2.0 multiplier
        marketingEffect = baseMarketingUsers * qualityMultiplier;
      }
      
      // Calculate monthly growth percentage from quality and market factors
      const baseGrowthRate = (
        (qualityFactor - 0.5) + 
        (marketTrendFactor - 1) + 
        resourceFactor +
        0.01 // Small base growth
      );
      
      // Apply small random fluctuation
      const growthRate = baseGrowthRate + (Math.random() * 0.04 - 0.02);
      
      // Calculate new users from growth percentage
      let usersFromGrowth = Math.floor(product.users * (1 + growthRate));
      
      // Add users from marketing (direct addition, not percentage)
      let newUsers = usersFromGrowth;
      
      // For new products with very few users, marketing has stronger effect
      if (product.users < 100 && marketingBudget > 0) {
        // Direct boost for new products
        newUsers = Math.max(newUsers, Math.floor(marketingEffect));
      } else {
        // For established products, add marketing effect
        newUsers = Math.min(
          resourceConstraint, // Cap by resource limit
          newUsers + Math.floor(marketingEffect * (1 - (product.users / 1000000)))
        );
      }
      
      // Ensure we don't exceed market maximum
      const marketMaxSize = product.type ? PRODUCT_TYPES[product.type]?.maxMarketSize || 0 : 0;
      if (marketMaxSize > 0) {
        newUsers = Math.min(newUsers, marketMaxSize);
      }
      
      // Ensure non-negative users
      newUsers = Math.max(0, newUsers);
      
      console.log(`Product ${product.name}: ${product.users} → ${newUsers} users (${marketingEffect} from marketing)`);
      
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
      if (category && marketSize > 0) {
        const marketShare = (newUsers / marketSize) * 100;
        store.dispatch(updateProductMarketShare({
          id: product.id,
          marketSharePercentage: marketShare
        }));
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
    
    return totalRevenue; // Return for use in expense calculation
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
    
    // Achievement: Product Portfolio
    if (products.length >= 5) {
      store.dispatch(unlockAchievement({
        id: 'diverse_portfolio',
        title: 'Diverse Portfolio',
        description: 'Created or acquired 5 different products.',
      }));
    }
    
    if (products.length >= 10) {
      store.dispatch(unlockAchievement({
        id: 'tech_empire',
        title: 'Tech Empire',
        description: 'Created or acquired 10 different products.',
      }));
    }
    
    // Achievement: Market Domination
    const dominatedMarkets = products.filter(p => p.marketSharePercentage >= 50).length;
    
    if (dominatedMarkets >= 1) {
      store.dispatch(unlockAchievement({
        id: 'market_leader',
        title: 'Market Leader',
        description: 'Achieved over 50% market share in a product category.',
      }));
    }
    
    if (dominatedMarkets >= 3) {
      store.dispatch(unlockAchievement({
        id: 'market_dominator',
        title: 'Market Dominator',
        description: 'Achieved over 50% market share in 3 product categories.',
      }));
    }
    
    // Achievement: Most Valuable Company
    if (companies.length > 0) {
      const playerValuation = valuation;
      const highestCompetitorValuation = Math.max(...companies.map(c => c.valuation));
      
      if (playerValuation > highestCompetitorValuation) {
        store.dispatch(unlockAchievement({
          id: 'top_company',
          title: 'Top of the World',
          description: 'Became the most valuable tech company in the world.',
        }));
      }
    }
  }
  
  // Helper method to change game speed
  changeGameSpeed(speed) {
    console.log(`Changing game speed from ${store.getState().time.gameSpeed}x to ${speed}x`);
    
    // Only proceed if the speed is actually changing
    if (speed === store.getState().time.gameSpeed) {
      console.log("Game speed unchanged, no need to restart the engine");
      return;
    }
    
    // Update speed in Redux store
    store.dispatch(setGameSpeed(speed));
    
    // Only restart the game loop if the game is not paused
    if (!selectGamePaused(store.getState())) {
      // Restart the game loop with new speed
      this.stop();
      this.start();
      
      store.dispatch(addNotification({
        message: `Game speed changed to ${speed}x`,
        type: 'info'
      }));
    } else {
      console.log("Game is paused, not restarting the loop");
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
    store.dispatch(advanceTime());
    const newDate = selectCurrentDate(store.getState());
    console.log("New game date after forced update:", newDate);
    
    // Also send a notification to confirm the action worked
    store.dispatch(addNotification({
      message: `Time manually advanced to ${newDate}`,
      type: 'info'
    }));
    
    return newDate;
  }
}

// Export singleton instance
const gameEngine = new GameEngine();
export default gameEngine;