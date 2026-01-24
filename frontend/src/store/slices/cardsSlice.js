import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Async thunks
export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async ({ page = 1, limit = 20, search = '', setId = '', rarity = '', type = '' }) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(setId && { setId }),
      ...(rarity && { rarity }),
      ...(type && { type }),
    });
    
    const response = await axios.get(`${API_URL}/cards?${params}`);
    return response.data;
  }
);

export const fetchCardById = createAsyncThunk(
  'cards/fetchCardById',
  async (cardId) => {
    const response = await axios.get(`${API_URL}/cards/${cardId}`);
    return response.data;
  }
);

export const searchCards = createAsyncThunk(
  'cards/searchCards',
  async (query) => {
    const response = await axios.get(`${API_URL}/cards/search?q=${query}`);
    return response.data.cards;
  }
);

export const fetchCardStats = createAsyncThunk(
  'cards/fetchCardStats',
  async () => {
    const response = await axios.get(`${API_URL}/cards/stats`);
    return response.data;
  }
);

export const fetchCardsBySet = createAsyncThunk(
  'cards/fetchCardsBySet',
  async ({ setId, page = 1, limit = 50 }) => {
    const response = await axios.get(`${API_URL}/cards/set/${setId}?page=${page}&limit=${limit}`);
    return response.data;
  }
);

// Slice
const cardsSlice = createSlice({
  name: 'cards',
  initialState: {
    cards: [],
    selectedCard: null,
    searchResults: [],
    stats: null,
    pagination: {
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 0,
    },
    filters: {
      search: '',
      setId: '',
      rarity: '',
      type: '',
    },
    loading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        setId: '',
        rarity: '',
        type: '',
      };
    },
    clearSelectedCard: (state) => {
      state.selectedCard = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cards
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload.cards;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch card by ID
      .addCase(fetchCardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCard = action.payload;
      })
      .addCase(fetchCardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Search cards
      .addCase(searchCards.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchCards.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch stats
      .addCase(fetchCardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Fetch cards by set
      .addCase(fetchCardsBySet.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCardsBySet.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload.cards;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCardsBySet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters, clearFilters, clearSelectedCard, clearSearchResults } = cardsSlice.actions;
export default cardsSlice.reducer;