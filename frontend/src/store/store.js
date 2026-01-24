// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import cardsReducer from './slices/cardsSlice';
import setsReducer from './slices/setsSlice';
import analyticsReducer from './slices/analyticsSlice';
import authReducer from './slices/authSlice';
import collectionReducer from './slices/collectionSlice';

export const store = configureStore({
  reducer: {
    cards: cardsReducer,
    sets: setsReducer,
    analytics: analyticsReducer,
    auth: authReducer,
    collections: collectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['cards/fetchCards/fulfilled'],
      },
    }),
});

export default store;