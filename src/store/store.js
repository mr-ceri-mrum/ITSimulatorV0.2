import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import gameReducer from './gameSlice';
import companyReducer from './companySlice';
import marketReducer from './marketSlice';
import productsReducer from './productsSlice';
import timeReducer from './timeSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['game', 'company', 'market', 'products', 'time']
};

const rootReducer = combineReducers({
  game: gameReducer,
  company: companyReducer,
  market: marketReducer,
  products: productsReducer,
  time: timeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
