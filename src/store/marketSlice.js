import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { PRODUCT_CATEGORIES, PRODUCT_TYPES } from './productsSlice';

// Helper functions to generate random competitors and their products
const generateRandomCompanyName = () => {
  const prefixes = ['Tech', 'Digital', 'Cyber', 'Cloud', 'Net', 'Byte', 'Data', 'Quantum', 'Nexus', 'Silicon', 'Future', 'Smart', 'Meta', 'Micro', 'Macro', 'Virtual', 'Web', 'AI', 'Logic', 'Inno'];
  const suffixes = ['Systems', 'Solutions', 'Technologies', 'Labs', 'Innovations', 'Works', 'Dynamics', 'Connect', 'Network', 'Group', 'Corp', 'Inc', 'Tech', 'Soft', 'Wave', 'Base', 'Hub', 'Mind', 'Vision', 'Link'];
  
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};

const generateRandomCompanies = (count = 300) => {
  const companies = [];
  
  for (let i = 0; i < count; i++) {
    const company = {
      id: uuidv4(),
      name: generateRandomCompanyName(),
      valuation: Math.random() * 5000000000 + 1000000, // $1M to $5B
      reputation: Math.floor(Math.random() * 100) + 1, // 1-100
      foundedDate: new Date(
        2000 + Math.floor(Math.random() * 4), // 2000-2003
        Math.floor(Math.random() * 12), // 0-11 (months)
        1
      ).toISOString(),
      products: [],
      totalUsers: 0,
      growthRate: (Math.random() * 0.3) + 0.9, // 0.9-1.2 (90%-120%)
      aggressive: Math.random() > 0.7, // 30% of companies are aggressive
      cash: Math.random() * 1000000000 + 100000, // $100K to $1B cash reserves
    };
    
    // Assign 1-3 random products to each company
    const numProducts = Math.floor(Math.random() * 3) + 1;
    const productTypes = Object.keys(PRODUCT_TYPES);
    
    for (let j = 0; j < numProducts; j++) {
      // Pick a random product type
      const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
      const productDetails = PRODUCT_TYPES[productType];
      
      // Generate initial users (up to 10% of max market size)
      const initialUsers = Math.floor(Math.random() * (productDetails.maxMarketSize * 0.1));
      
      company.products.push({
        id: uuidv4(),
        type: productType,
        name: `${company.name} ${productDetails.name}`,
        quality: Math.floor(Math.random() * 10) + 1, // 1-10
        users: initialUsers,
        launchDate: company.foundedDate, // Launch date is the same as company founding for simplicity
        marketSharePercentage: 0, // Will be calculated later
        lastUpdate: null,
      });
      
      company.totalUsers += initialUsers;
    }
    
    companies.push(company);
  }
  
  return companies;
};

const initialState = {
  companies: [], // Will be populated in initialization
  marketSizes: {}, // Will track current size of each market segment
  marketTrends: {}, // Tracks growth trends for different product categories
  events: [], // Market events that affect the economy
  initialized: false,
};

export const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    initializeMarket: (state) => {
      if (!state.initialized) {
        state.companies = generateRandomCompanies(300);
        state.initialized = true;
        
        // Initialize market sizes and trends for each product category
        Object.values(PRODUCT_CATEGORIES).forEach(category => {
          state.marketSizes[category] = 0;
          state.marketTrends[category] = 1 + (Math.random() * 0.2); // 1.0-1.2 growth rate
        });
        
        // Calculate initial market sizes based on company products
        state.companies.forEach(company => {
          company.products.forEach(product => {
            const productDetails = PRODUCT_TYPES[product.type];
            if (productDetails) {
              const category = productDetails.category;
              state.marketSizes[category] = (state.marketSizes[category] || 0) + product.users;
            }
          });
        });
        
        // Add some random market events
        state.events = [
          {
            id: uuidv4(),
            title: 'Tech Boom',
            description: 'Increasing investment in tech startups boosts growth across all sectors.',
            effectDate: new Date('2004-06-01').toISOString(),
            duration: 12, // months
            effects: {
              type: 'growth_multiplier',
              value: 1.2,
              categories: Object.values(PRODUCT_CATEGORIES),
            },
          },
          {
            id: uuidv4(),
            title: 'Social Media Revolution',
            description: 'A surge in social media adoption changes online behavior patterns.',
            effectDate: new Date('2005-03-01').toISOString(),
            duration: 24, // months
            effects: {
              type: 'category_growth',
              value: 1.5,
              categories: [PRODUCT_CATEGORIES.SOCIAL_NETWORKS],
            },
          },
          // More events would be added here
        ];
      }
    },
    updateMarketTrends: (state, action) => {
      const { date } = action.payload;
      
      // Update trends based on time progression and market events
      Object.keys(state.marketTrends).forEach(category => {
        // Base market change: slight random fluctuation
        let trendChange = 0.95 + (Math.random() * 0.1); // 0.95-1.05
        
        // Apply active events
        state.events.forEach(event => {
          const eventStartDate = new Date(event.effectDate);
          const eventEndDate = new Date(eventStartDate);
          eventEndDate.setMonth(eventEndDate.getMonth() + event.duration);
          
          const currentDate = new Date(date);
          
          if (currentDate >= eventStartDate && currentDate <= eventEndDate) {
            // Event is active
            if (
              event.effects.type === 'growth_multiplier' &&
              event.effects.categories.includes(category)
            ) {
              trendChange *= event.effects.value;
            } else if (
              event.effects.type === 'category_growth' &&
              event.effects.categories.includes(category)
            ) {
              trendChange *= event.effects.value;
            }
          }
        });
        
        // Update trend with new value
        state.marketTrends[category] = Math.max(0.9, Math.min(1.5, state.marketTrends[category] * trendChange));
      });
    },
    updateCompaniesGrowth: (state, action) => {
      const { date } = action.payload;
      
      state.companies.forEach(company => {
        // Company-specific growth rate
        const companyGrowthMultiplier = company.growthRate;
        
        // Update each product
        company.products.forEach(product => {
          const productDetails = PRODUCT_TYPES[product.type];
          if (productDetails) {
            const category = productDetails.category;
            const marketTrend = state.marketTrends[category] || 1;
            
            // Calculate growth based on product quality, company growth rate, and market trends
            const qualityFactor = (product.quality / 10) * 1.5; // 0.15-1.5
            
            // Calculate monthly growth rate (between -10% and +20% depending on factors)
            const monthlyGrowthRate = (
              qualityFactor * 
              companyGrowthMultiplier * 
              marketTrend * 
              (0.95 + (Math.random() * 0.1)) // Random factor 0.95-1.05
            ) - 1; // Convert to percentage change
            
            // Apply growth to users
            const newUsers = Math.max(
              0, 
              Math.floor(product.users * (1 + monthlyGrowthRate))
            );
            
            // Check against market maximum
            const maxUsers = productDetails.maxMarketSize;
            product.users = Math.min(newUsers, maxUsers);
            
            // Occasionally update product quality (competitive companies improve products)
            if (Math.random() < 0.05) { // 5% chance each month
              product.quality = Math.min(10, product.quality + 0.5);
              product.lastUpdate = date;
            }
            
            // Aggressive companies update more frequently
            if (company.aggressive && Math.random() < 0.1) { // Additional 10% chance
              product.quality = Math.min(10, product.quality + 0.5);
              product.lastUpdate = date;
            }
            
            // Quality degradation over time if not updated
            if (product.lastUpdate) {
              const lastUpdate = new Date(product.lastUpdate);
              const currentDate = new Date(date);
              const monthsSinceUpdate = (
                (currentDate.getFullYear() - lastUpdate.getFullYear()) * 12 + 
                (currentDate.getMonth() - lastUpdate.getMonth())
              );
              
              if (monthsSinceUpdate > 6) { // Degrade after 6 months without updates
                product.quality = Math.max(1, product.quality - 0.2);
              }
            }
          }
        });
        
        // Update company total users
        company.totalUsers = company.products.reduce((sum, product) => sum + product.users, 0);
      });
      
      // Recalculate market sizes and market shares
      const newMarketSizes = {};
      
      // Reset market sizes
      Object.values(PRODUCT_CATEGORIES).forEach(category => {
        newMarketSizes[category] = 0;
      });
      
      // Calculate new sizes
      state.companies.forEach(company => {
        company.products.forEach(product => {
          const productDetails = PRODUCT_TYPES[product.type];
          if (productDetails) {
            const category = productDetails.category;
            newMarketSizes[category] = (newMarketSizes[category] || 0) + product.users;
          }
        });
      });
      
      // Update market sizes
      state.marketSizes = newMarketSizes;
      
      // Calculate market shares for all products
      state.companies.forEach(company => {
        company.products.forEach(product => {
          const productDetails = PRODUCT_TYPES[product.type];
          if (productDetails) {
            const category = productDetails.category;
            const totalMarketSize = state.marketSizes[category];
            
            if (totalMarketSize > 0) {
              product.marketSharePercentage = (product.users / totalMarketSize) * 100;
            } else {
              product.marketSharePercentage = 0;
            }
          }
        });
      });
    },
    generateMarketEvent: (state, action) => {
      const { date } = action.payload;
      
      // 10% chance of a new market event each month
      if (Math.random() < 0.1) {
        const eventTypes = [
          {
            title: 'Tech Bubble Concerns',
            description: 'Investors become cautious about tech valuations, slowing growth.',
            duration: 6, // months
            effects: {
              type: 'growth_multiplier',
              value: 0.9,
              categories: Object.values(PRODUCT_CATEGORIES),
            },
          },
          {
            title: 'Mobile Revolution',
            description: 'Rapid adoption of smartphones changes the tech landscape.',
            duration: 36, // 3 years
            effects: {
              type: 'category_growth',
              value: 1.3,
              categories: [
                PRODUCT_CATEGORIES.DEVICES, 
                PRODUCT_CATEGORIES.OPERATING_SYSTEMS,
                PRODUCT_CATEGORIES.SOCIAL_NETWORKS
              ],
            },
          },
          {
            title: 'Privacy Concerns',
            description: 'Public backlash against data collection practices affects social platforms.',
            duration: 12, // 1 year
            effects: {
              type: 'category_growth',
              value: 0.85,
              categories: [PRODUCT_CATEGORIES.SOCIAL_NETWORKS],
            },
          },
          {
            title: 'Cloud Computing Boom',
            description: 'Businesses rapidly migrate to cloud services, boosting infrastructure demand.',
            duration: 24, // 2 years
            effects: {
              type: 'category_growth',
              value: 1.4,
              categories: [PRODUCT_CATEGORIES.INFRASTRUCTURE],
            },
          },
          {
            title: 'Economic Recession',
            description: 'Economic downturn leads to reduced tech spending and investment.',
            duration: 18, // 1.5 years
            effects: {
              type: 'growth_multiplier',
              value: 0.8,
              categories: Object.values(PRODUCT_CATEGORIES),
            },
          },
          {
            title: 'AI Breakthrough',
            description: 'Major advances in artificial intelligence create new market opportunities.',
            duration: 30, // 2.5 years
            effects: {
              type: 'category_growth',
              value: 1.6,
              categories: [PRODUCT_CATEGORIES.AI_ML],
            },
          },
          {
            title: 'E-commerce Expansion',
            description: 'Rapid growth in online shopping creates opportunities in digital commerce.',
            duration: 24, // 2 years
            effects: {
              type: 'category_growth',
              value: 1.3,
              categories: [PRODUCT_CATEGORIES.COMMERCE],
            },
          },
        ];
        
        // Select a random event
        const selectedEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        // Create and add the event
        state.events.push({
          id: uuidv4(),
          title: selectedEvent.title,
          description: selectedEvent.description,
          effectDate: date,
          duration: selectedEvent.duration,
          effects: selectedEvent.effects,
        });
      }
    },
    simulateCompetitorActions: (state, action) => {
      const { date } = action.payload;
      
      state.companies.forEach(company => {
        // Chance for companies to create new products
        // Higher chance for aggressive companies or those with fewer products
        const newProductChance = (
          0.02 + // Base 2% chance
          (company.aggressive ? 0.03 : 0) + // +3% for aggressive companies
          (0.05 / Math.max(1, company.products.length)) // Higher chance for companies with fewer products
        );
        
        if (Math.random() < newProductChance) {
          // Company decides to create a new product
          const productTypes = Object.keys(PRODUCT_TYPES);
          const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
          const productDetails = PRODUCT_TYPES[productType];
          
          // Companies are more likely to create products in trending categories
          const category = productDetails.category;
          const categoryTrend = state.marketTrends[category] || 1;
          
          // Skip if trend is weak
          if (categoryTrend > 1.05 || Math.random() < 0.3) { // Always 30% chance regardless of trend
            company.products.push({
              id: uuidv4(),
              type: productType,
              name: `${company.name} ${productDetails.name}`,
              quality: Math.min(10, Math.floor(Math.random() * 5) + 3), // 3-7 quality
              users: 0, // Start with 0 users
              launchDate: date,
              marketSharePercentage: 0,
              lastUpdate: date,
            });
          }
        }
        
        // Chance for companies to acquire other companies (for larger companies)
        if (company.totalUsers > 1000000 && company.cash > 100000000) { // At least 1M users and $100M cash
          const acquisitionChance = 0.01 + (company.aggressive ? 0.02 : 0); // 1-3% chance
          
          if (Math.random() < acquisitionChance) {
            // Find potential acquisition targets (smaller companies)
            const targets = state.companies.filter(target => 
              target.id !== company.id && // Not the same company
              target.totalUsers < company.totalUsers * 0.5 && // Target is smaller (< 50% of acquirer)
              target.valuation < company.cash * 0.7 // Target is affordable (< 70% of cash)
            );
            
            if (targets.length > 0) {
              // Select a random target
              const target = targets[Math.floor(Math.random() * targets.length)];
              
              // Acquire the target's products
              target.products.forEach(product => {
                company.products.push({
                  ...product,
                  id: uuidv4(), // Generate new ID for the acquired product
                  name: `${company.name} ${PRODUCT_TYPES[product.type]?.name || 'Product'}`, // Rename
                  lastUpdate: date,
                });
              });
              
              // Reduce cash by acquisition cost (roughly 2x valuation)
              const acquisitionCost = Math.min(company.cash, target.valuation * 2);
              company.cash -= acquisitionCost;
              
              // Remove the acquired company
              state.companies = state.companies.filter(c => c.id !== target.id);
            }
          }
        }
        
        // Update company valuations based on users, products, and cash
        let valuation = 0;
        
        // Value from users
        valuation += company.totalUsers * 50; // $50 per user
        
        // Value from products quality
        company.products.forEach(product => {
          valuation += product.users * product.quality * 10; // Value based on product quality and users
        });
        
        // Value from cash
        valuation += company.cash * 0.8; // 80% of cash counts towards valuation
        
        company.valuation = Math.max(valuation, 1000000); // Minimum $1M valuation
      });
    },
    resetMarket: () => initialState,
  },
});

export const {
  initializeMarket,
  updateMarketTrends,
  updateCompaniesGrowth,
  generateMarketEvent,
  simulateCompetitorActions,
  resetMarket,
} = marketSlice.actions;

// Selectors
export const selectCompanies = (state) => state.market.companies;
export const selectMarketSizes = (state) => state.market.marketSizes;
export const selectMarketTrends = (state) => state.market.marketTrends;
export const selectMarketEvents = (state) => state.market.events;
export const selectTopCompanies = (state, count = 10) => 
  [...state.market.companies].sort((a, b) => b.valuation - a.valuation).slice(0, count);
export const selectCompetitorsByProductType = (state, productType) => 
  state.market.companies.filter(company => 
    company.products.some(product => product.type === productType)
  );
export const selectMarketSizeByCategory = (state, category) => 
  state.market.marketSizes[category] || 0;
export const selectActiveEvents = (state, currentDate) => {
  const date = new Date(currentDate);
  
  return state.market.events.filter(event => {
    const eventStartDate = new Date(event.effectDate);
    const eventEndDate = new Date(eventStartDate);
    eventEndDate.setMonth(eventEndDate.getMonth() + event.duration);
    
    return date >= eventStartDate && date <= eventEndDate;
  });
};

export default marketSlice.reducer;
