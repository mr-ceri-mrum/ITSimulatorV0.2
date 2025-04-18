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
    this.lastUpdateTime = Date.now();
    
    // Debug counters
    this.updateCount = 0;
    this.lastLogTime = Date.now();
    
    console.log("GameEngine instance created");
  }

  start() {
    // Clear any existing interval
    this.stop();
    
    console.log("GameEngine.start() called");

    // Check if the game is paused before starting the update loop
    const state = store.getState();
    if (selectGamePaused(state)) {
      console.log("Game is paused, not starting the update loop");
      return;
    }

    // Initialize the game update loop
    this.updateLoop();
  }

  stop() {
    console.log("GameEngine.stop() called");
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      store.dispatch(setRealTimeInterval(null));
      console.log("Interval cleared");
    }
  }

  updateLoop() {
    const state = store.getState();
    const gameSpeed = selectGameSpeed(state);
    const gameIsPaused = selectGamePaused(state);

    console.log("updateLoop called. Game speed:", gameSpeed, "Paused:", gameIsPaused);

    // If game is paused, don't set up interval
    if (gameIsPaused) {
      console.log("Game is paused, not setting interval");
      return;
    }

    // Calculate update interval based on game speed
    // One month takes 5 minutes (300,000ms) at 1x speed
    // This is slower than original, making it more playable
    const baseMonthDuration = 300000; // 5 minutes in milliseconds
    const updateInterval = baseMonthDuration / gameSpeed;
    
    console.log("Setting interval with duration:", updateInterval, "ms");

    // Set up interval for game updates
    this.intervalId = setInterval(() => {
      // Check if the game is paused before proceeding with update
      const currentState = store.getState();
      if (selectGamePaused(currentState)) {
        console.log("Game is paused, skipping interval update");
        return;
      }
      
      console.log("Interval triggered update");
      this.update();
    }, updateInterval);
    
    // Store the interval ID in Redux
    store.dispatch(setRealTimeInterval(this.intervalId));
    
    // Debug - also set a much faster interval for testing
    if (process.env.NODE_ENV === 'development') {
      console.log("DEV MODE: Adding faster test update");
      // Force an immediate update for testing
      setTimeout(() => {
        const currentState = store.getState();
        if (!selectGamePaused(currentState)) {
          console.log("Forcing immediate update for testing");
          this.update();
        }
      }, 5000); // After 5 seconds
    }
  }

  update() {
    // Increment update counter
    this.updateCount++;
    
    // Log every 10 seconds for debugging
    const now = Date.now();
    if (now - this.lastLogTime > 10000) {
      console.log(`Game updates in last 10 seconds: ${this.updateCount}`);
      this.updateCount = 0;
      this.lastLogTime = now;
    }
    
    const state = store.getState();
    const gameIsPaused = selectGamePaused(state);
    
    console.log("GameEngine.update() called. Game paused:", gameIsPaused);

    // Skip update if game is paused
    if (gameIsPaused) {
      console.log("Game paused, skipping update");
      return;
    }

    // Get current game date
    const currentDate = selectCurrentDate(state);
    console.log("Current game date before update:", currentDate);

    // Advance time by one month
    store.dispatch(advanceTime());
    
    // Log the new date
    const newState = store.getState();
    const newDate = selectCurrentDate(newState);
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

    activeProducts.forEach(product => {
      // Calculate product growth based on:
      // 1. Product quality
      // 2. Market trends for the product category
      // 3. Resources (employees and servers)
      // 4. Marketing budget

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
      
      // If we're near the resource limit, growth slows
      const resourceFactor = (
        resourceConstraint > product.users * 1.5 ? 1.0 :
        resourceConstraint > product.users * 1.1 ? 0.7 :
        resourceConstraint > product.users ? 0.3 :
        -0.2 // Users leave if resources are insufficient
      );
      
      // Marketing factor
      // Higher marketing budget increases user acquisition
      // Base marketing cost per user: $5-20 (varies by market saturation)
      const marketSize = category ? (marketSizes[category] || 0) : 0;
      const marketMaxSize = product.type ? PRODUCT_TYPES[product.type]?.maxMarketSize || 0 : 0;
      const marketSaturation = marketSize / Math.max(1, marketMaxSize);
      
      // Cost per user increases as market saturates
      const costPerUser = 5 + (15 * marketSaturation);
      const potentialNewUsersFromMarketing = Math.floor(marketingBudget / costPerUser);
      
      // More effective marketing for higher quality products
      const marketingFactor = Math.min(
        0.2, // Cap marketing effect at 20% growth per month
        (potentialNewUsersFromMarketing / Math.max(1, product.users)) * (product.quality / 10)
      );
      
      // Calculate total monthly growth rate
      const monthlyGrowthRate = (
        (qualityFactor - 0.5) + // Convert quality factor to a percentage change
        (marketTrendFactor - 1) + // Convert trend factor to a percentage change
        resourceFactor +
        marketingFactor
      );
      
      // Apply random fluctuation (-2% to +2%)
      const finalGrowthRate = monthlyGrowthRate + (Math.random() * 0.04 - 0.02);
      
      // Calculate new user count
      let newUsers = Math.floor(product.users * (1 + finalGrowthRate));
      
      // Ensure we don't exceed resource constraints
      newUsers = Math.min(newUsers, resourceConstraint);
      
      // Ensure we don't exceed market maximum
      if (marketMaxSize > 0) {
        newUsers = Math.min(newUsers, marketMaxSize);
      }
      
      // Ensure non-negative users
      newUsers = Math.max(0, newUsers);
      
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