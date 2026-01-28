// frontend/src/store/slices/onePieceSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Async thunks
export const fetchOnePieceSets = createAsyncThunk(
  'onePiece/fetchSets',
  async () => {
    const response = await axios.get(`${API_URL}/onepiece/sets`);
    return response.data;
  }
);

export const fetchOnePieceSetById = createAsyncThunk(
  'onePiece/fetchSetById',
  async (setId) => {
    const response = await axios.get(`${API_URL}/onepiece/sets/${setId}`);
    return response.data;
  }
);

export const fetchOnePieceCards = createAsyncThunk(
  'onePiece/fetchCards',
  async () => {
    const response = await axios.get(`${API_URL}/onepiece/cards`);
    return response.data;
  }
);

export const fetchOnePieceCardById = createAsyncThunk(
  'onePiece/fetchCardById',
  async (cardId) => {
    const response = await axios.get(`${API_URL}/onepiece/cards/${cardId}`);
    return response.data;
  }
);

export const searchOnePieceCards = createAsyncThunk(
  'onePiece/searchCards',
  async ({ query, type = 'all' }) => {
    const response = await axios.get(`${API_URL}/onepiece/cards/search`, {
      params: { query, type }
    });
    return response.data;
  }
);

export const fetchFilteredOnePieceCards = createAsyncThunk(
  'onePiece/fetchFilteredCards',
  async (filters) => {
    const response = await axios.get(`${API_URL}/onepiece/cards/filtered`, {
      params: filters
    });
    return response.data;
  }
);

export const fetchRecentOnePieceCards = createAsyncThunk(
  'onePiece/fetchRecentCards',
  async () => {
    const response = await axios.get(`${API_URL}/onepiece/cards/recent`);
    return response.data;
  }
);

export const fetchOnePieceStarterDecks = createAsyncThunk(
  'onePiece/fetchStarterDecks',
  async () => {
    const response = await axios.get(`${API_URL}/onepiece/starter-decks`);
    return response.data;
  }
);

export const fetchOnePieceStarterDeckById = createAsyncThunk(
  'onePiece/fetchStarterDeckById',
  async (stId) => {
    const response = await axios.get(`${API_URL}/onepiece/starter-decks/${stId}`);
    return response.data;
  }
);

export const fetchOnePiecePromos = createAsyncThunk(
  'onePiece/fetchPromos',
  async () => {
    const response = await axios.get(`${API_URL}/onepiece/promos`);
    return response.data;
  }
);

export const fetchOnePiecePromoById = createAsyncThunk(
  'onePiece/fetchPromoById',
  async (cardId) => {
    const response = await axios.get(`${API_URL}/onepiece/promos/${cardId}`);
    return response.data;
  }
);

// Slice
const onePieceSlice = createSlice({
  name: 'onePiece',
  initialState: {
    sets: [],
    selectedSet: null,
    cards: [],
    selectedCard: null,
    searchResults: null,
    recentCards: [],
    starterDecks: [],
    selectedStarterDeck: null,
    promoCards: [],
    selectedPromo: null,
    filters: {
      color: '',
      category: '',
      rarity: '',
      attribute: '',
      cost: '',
      power: '',
      counter: ''
    },
    loading: false,
    error: null,
  },
  reducers: {
    setOnePieceFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearOnePieceFilters: (state) => {
      state.filters = {
        color: '',
        category: '',
        rarity: '',
        attribute: '',
        cost: '',
        power: '',
        counter: ''
      };
    },
    clearSelectedOnePieceCard: (state) => {
      state.selectedCard = null;
    },
    clearOnePieceSearchResults: (state) => {
      state.searchResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sets
      .addCase(fetchOnePieceSets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnePieceSets.fulfilled, (state, action) => {
        state.loading = false;
        state.sets = action.payload;
      })
      .addCase(fetchOnePieceSets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch set by ID
      .addCase(fetchOnePieceSetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnePieceSetById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSet = action.payload;
      })
      .addCase(fetchOnePieceSetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch cards
      .addCase(fetchOnePieceCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnePieceCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchOnePieceCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch card by ID
      .addCase(fetchOnePieceCardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnePieceCardById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCard = action.payload;
      })
      .addCase(fetchOnePieceCardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Search cards
      .addCase(searchOnePieceCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOnePieceCards.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchOnePieceCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch filtered cards
      .addCase(fetchFilteredOnePieceCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredOnePieceCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchFilteredOnePieceCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch recent cards
      .addCase(fetchRecentOnePieceCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentOnePieceCards.fulfilled, (state, action) => {
        state.loading = false;
        state.recentCards = action.payload;
      })
      .addCase(fetchRecentOnePieceCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch starter decks
      .addCase(fetchOnePieceStarterDecks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnePieceStarterDecks.fulfilled, (state, action) => {
        state.loading = false;
        state.starterDecks = action.payload;
      })
      .addCase(fetchOnePieceStarterDecks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch starter deck by ID
      .addCase(fetchOnePieceStarterDeckById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnePieceStarterDeckById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStarterDeck = action.payload;
      })
      .addCase(fetchOnePieceStarterDeckById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch promos
      .addCase(fetchOnePiecePromos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnePiecePromos.fulfilled, (state, action) => {
        state.loading = false;
        state.promoCards = action.payload;
      })
      .addCase(fetchOnePiecePromos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch promo by ID
      .addCase(fetchOnePiecePromoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnePiecePromoById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPromo = action.payload;
      })
      .addCase(fetchOnePiecePromoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setOnePieceFilters,
  clearOnePieceFilters,
  clearSelectedOnePieceCard,
  clearOnePieceSearchResults,
} = onePieceSlice.actions;

export default onePieceSlice.reducer;
