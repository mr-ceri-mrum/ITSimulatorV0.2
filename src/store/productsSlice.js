import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Product categories from the game description
export const PRODUCT_CATEGORIES = {
  SEARCH_SERVICES: 'Search Services',
  MEDIA_PLATFORMS: 'Media Platforms',
  SOCIAL_NETWORKS: 'Social Networks',
  OPERATING_SYSTEMS: 'Operating Systems',
  DEVICES: 'Devices',
  INFRASTRUCTURE: 'Infrastructure',
  COMMERCE: 'Commerce and Services',
  SOFTWARE: 'Software',
  AI_ML: 'AI and Machine Learning',
};

// Product types with their ideal resource distributions
export const PRODUCT_TYPES = {
  // Search Services
  SEARCH_ENGINE: {
    name: 'Search Engine',
    category: PRODUCT_CATEGORIES.SEARCH_SERVICES,
    maxMarketSize: 4000000000, // 4 billion users
    idealResourceDistribution: {
      backend: 35,
      frontend: 20,
      infrastructure: 25,
      ai: 15,
      database: 5,
    },
    competitiveness: 'High',
    description: 'A web search engine with indexing and ranking algorithms.',
  },
  MAPS: {
    name: 'Maps',
    category: PRODUCT_CATEGORIES.SEARCH_SERVICES,
    maxMarketSize: 3000000000, // 3 billion users
    idealResourceDistribution: {
      backend: 30,
      frontend: 25,
      infrastructure: 20,
      ai: 10,
      database: 15,
    },
    competitiveness: 'Medium',
    description: 'A mapping and navigation service with geographic data.',
  },
  NEWS_SERVICE: {
    name: 'News Service',
    category: PRODUCT_CATEGORIES.SEARCH_SERVICES,
    maxMarketSize: 2500000000, // 2.5 billion users
    idealResourceDistribution: {
      backend: 25,
      frontend: 30,
      infrastructure: 15,
      ai: 15,
      database: 15,
    },
    competitiveness: 'Medium',
    description: 'An aggregator of news from various sources with personalization.',
  },
  
  // Media Platforms
  VIDEO_PLATFORM: {
    name: 'Video Platform',
    category: PRODUCT_CATEGORIES.MEDIA_PLATFORMS,
    maxMarketSize: 2000000000, // 2 billion users
    idealResourceDistribution: {
      backend: 30,
      frontend: 25,
      infrastructure: 30,
      ai: 5,
      database: 10,
    },
    competitiveness: 'High',
    description: 'A platform for hosting, sharing and watching videos.',
  },
  MUSIC_SERVICE: {
    name: 'Music Service',
    category: PRODUCT_CATEGORIES.MEDIA_PLATFORMS,
    maxMarketSize: 1500000000, // 1.5 billion users
    idealResourceDistribution: {
      backend: 25,
      frontend: 30,
      infrastructure: 20,
      ai: 15,
      database: 10,
    },
    competitiveness: 'Medium',
    description: 'A streaming service for music with recommendation algorithms.',
  },
  STREAMING_SERVICE: {
    name: 'Streaming Service',
    category: PRODUCT_CATEGORIES.MEDIA_PLATFORMS,
    maxMarketSize: 1000000000, // 1 billion users
    idealResourceDistribution: {
      backend: 25,
      frontend: 25,
      infrastructure: 35,
      ai: 5,
      database: 10,
    },
    competitiveness: 'High',
    description: 'A platform for streaming movies and TV shows.',
  },
  
  // Social Networks
  SOCIAL_NETWORK: {
    name: 'Social Network',
    category: PRODUCT_CATEGORIES.SOCIAL_NETWORKS,
    maxMarketSize: 3500000000, // 3.5 billion users
    idealResourceDistribution: {
      backend: 30,
      frontend: 30,
      infrastructure: 15,
      ai: 10,
      database: 15,
    },
    competitiveness: 'Very High',
    description: 'A platform connecting people and allowing content sharing.',
  },
  PROFESSIONAL_NETWORK: {
    name: 'Professional Network',
    category: PRODUCT_CATEGORIES.SOCIAL_NETWORKS,
    maxMarketSize: 1000000000, // 1 billion users
    idealResourceDistribution: {
      backend: 25,
      frontend: 30,
      infrastructure: 15,
      ai: 15,
      database: 15,
    },
    competitiveness: 'Medium',
    description: 'A platform for professional connections and job opportunities.',
  },
  MESSAGING_PLATFORM: {
    name: 'Messaging Platform',
    category: PRODUCT_CATEGORIES.SOCIAL_NETWORKS,
    maxMarketSize: 3000000000, // 3 billion users
    idealResourceDistribution: {
      backend: 35,
      frontend: 25,
      infrastructure: 25,
      ai: 5,
      database: 10,
    },
    competitiveness: 'High',
    description: 'An instant messaging platform for communication.',
  },
  DATING_APP: {
    name: 'Dating App',
    category: PRODUCT_CATEGORIES.SOCIAL_NETWORKS,
    maxMarketSize: 500000000, // 500 million users
    idealResourceDistribution: {
      backend: 25,
      frontend: 30,
      infrastructure: 10,
      ai: 25,
      database: 10,
    },
    competitiveness: 'Medium',
    description: 'An app for finding romantic connections.',
  },
  
  // Operating Systems
  MOBILE_OS: {
    name: 'Mobile OS',
    category: PRODUCT_CATEGORIES.OPERATING_SYSTEMS,
    maxMarketSize: 2500000000, // 2.5 billion devices
    idealResourceDistribution: {
      backend: 30,
      frontend: 20,
      infrastructure: 20,
      ai: 10,
      database: 20,
    },
    competitiveness: 'Very High',
    description: 'An operating system for mobile devices.',
  },
  DESKTOP_OS: {
    name: 'Desktop OS',
    category: PRODUCT_CATEGORIES.OPERATING_SYSTEMS,
    maxMarketSize: 1500000000, // 1.5 billion devices
    idealResourceDistribution: {
      backend: 35,
      frontend: 20,
      infrastructure: 15,
      ai: 10,
      database: 20,
    },
    competitiveness: 'High',
    description: 'An operating system for desktop and laptop computers.',
  },
  
  // Many more product types would be defined here...
  // This is just a subset of the products from the game description
};

const initialState = {
  owned: [], // Player's products
  inDevelopment: [], // Products being developed
  acquisitions: [], // Acquired products/companies
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    startDevelopingProduct: (state, action) => {
      const { productType, name, resourceAllocation } = action.payload;
      
      const newProduct = {
        id: uuidv4(),
        type: productType,
        name: name,
        developmentProgress: 0,
        resourceAllocation: resourceAllocation || {
          backend: 20,
          frontend: 20,
          infrastructure: 20,
          ai: 20,
          database: 20,
        },
        developmentStartDate: new Date().toISOString(),
        status: 'in_development',
      };
      
      state.inDevelopment.push(newProduct);
    },
    updateDevelopmentProgress: (state, action) => {
      const { id, progress } = action.payload;
      const product = state.inDevelopment.find(p => p.id === id);
      
      if (product) {
        product.developmentProgress = Math.min(100, product.developmentProgress + progress);
        
        // If development is complete, product is ready to launch
        if (product.developmentProgress >= 100) {
          product.developmentProgress = 100;
          product.status = 'ready_to_launch';
        }
      }
    },
    updateResourceAllocation: (state, action) => {
      const { id, allocation } = action.payload;
      const product = state.inDevelopment.find(p => p.id === id);
      
      if (product) {
        product.resourceAllocation = allocation;
      }
    },
    launchProduct: (state, action) => {
      const { id } = action.payload;
      const productIndex = state.inDevelopment.findIndex(p => p.id === id);
      
      if (productIndex !== -1 && state.inDevelopment[productIndex].developmentProgress >= 100) {
        const product = state.inDevelopment[productIndex];
        
        // Calculate initial quality based on resource allocation match to ideal
        const idealDistribution = PRODUCT_TYPES[product.type]?.idealResourceDistribution || {
          backend: 20,
          frontend: 20,
          infrastructure: 20,
          ai: 20,
          database: 20,
        };
        
        let allocationScore = 0;
        let totalDifference = 0;
        
        // Calculate how close allocation is to ideal
        for (const resource in idealDistribution) {
          const difference = Math.abs(
            (product.resourceAllocation[resource] || 0) - idealDistribution[resource]
          );
          totalDifference += difference;
        }
        
        // Convert difference to a 1-10 score
        // Lower difference = higher score
        allocationScore = Math.max(1, 10 - Math.floor(totalDifference / 10));
        
        // Launch the product with initial stats
        const launchedProduct = {
          ...product,
          launchDate: new Date().toISOString(),
          status: 'active',
          quality: allocationScore,
          users: 0,
          revenue: 0,
          lastUpdate: null,
          marketSharePercentage: 0,
          history: [],
        };
        
        // Remove from development and add to owned
        state.inDevelopment.splice(productIndex, 1);
        state.owned.push(launchedProduct);
      }
    },
    updateProduct: (state, action) => {
      const { id, updateType } = action.payload;
      const product = state.owned.find(p => p.id === id);
      
      if (product) {
        const currentDate = new Date().toISOString();
        
        switch (updateType) {
          case 'minor':
            product.quality = Math.min(10, product.quality + 1);
            break;
          case 'major':
            product.quality = Math.min(10, product.quality + 2);
            break;
          case 'maintenance':
            // Prevent quality degradation
            break;
          default:
            // No update
            break;
        }
        
        product.lastUpdate = currentDate;
      }
    },
    updateProductQuality: (state, action) => {
      const { id, quality } = action.payload;
      const product = state.owned.find(p => p.id === id);
      
      if (product) {
        product.quality = Math.max(1, Math.min(10, quality));
      }
    },
    updateProductUsers: (state, action) => {
      const { id, users } = action.payload;
      const product = state.owned.find(p => p.id === id);
      
      if (product) {
        product.users = Math.max(0, users);
        
        // Update history
        product.history.push({
          date: new Date().toISOString(),
          users: product.users,
          quality: product.quality,
          revenue: product.revenue,
        });
      }
    },
    updateProductMarketShare: (state, action) => {
      const { id, marketSharePercentage } = action.payload;
      const product = state.owned.find(p => p.id === id);
      
      if (product) {
        product.marketSharePercentage = Math.max(0, Math.min(100, marketSharePercentage));
      }
    },
    discontinueProduct: (state, action) => {
      const { id } = action.payload;
      const productIndex = state.owned.findIndex(p => p.id === id);
      
      if (productIndex !== -1) {
        state.owned[productIndex].status = 'discontinued';
        state.owned[productIndex].users = 0;
        state.owned[productIndex].revenue = 0;
      }
    },
    acquireProduct: (state, action) => {
      const { product, cost } = action.payload;
      
      // Add to acquisitions list
      state.acquisitions.push({
        ...product,
        acquisitionDate: new Date().toISOString(),
        acquisitionCost: cost,
      });
      
      // Add to owned products
      state.owned.push({
        ...product,
        id: uuidv4(), // Generate new ID for the acquired product
        status: 'active',
        history: [],
      });
    },
    resetProducts: () => initialState,
  },
});

export const {
  startDevelopingProduct,
  updateDevelopmentProgress,
  updateResourceAllocation,
  launchProduct,
  updateProduct,
  updateProductQuality,
  updateProductUsers,
  updateProductMarketShare,
  discontinueProduct,
  acquireProduct,
  resetProducts,
} = productsSlice.actions;

// Selectors
export const selectOwnedProducts = (state) => state.products.owned;
export const selectProductsInDevelopment = (state) => state.products.inDevelopment;
export const selectAcquisitions = (state) => state.products.acquisitions;
export const selectActiveProducts = (state) => 
  state.products.owned.filter(p => p.status === 'active');
export const selectProductById = (state, id) => 
  state.products.owned.find(p => p.id === id) || 
  state.products.inDevelopment.find(p => p.id === id);

export default productsSlice.reducer;
