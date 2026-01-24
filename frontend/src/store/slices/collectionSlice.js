// src/store/slices/collectionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Async thunks
export const fetchCollections = createAsyncThunk(
  'collections/fetchCollections',
  async () => {
    const response = await axios.get(`${API_URL}/collections`, getAuthHeaders());
    return response.data.collections;
  }
);

export const fetchCollectionById = createAsyncThunk(
  'collections/fetchCollectionById',
  async (collectionId) => {
    const response = await axios.get(`${API_URL}/collections/${collectionId}`, getAuthHeaders());
    return response.data.collection;
  }
);

export const createCollection = createAsyncThunk(
  'collections/createCollection',
  async (collectionData) => {
    const response = await axios.post(`${API_URL}/collections`, collectionData, getAuthHeaders());
    return response.data.collection;
  }
);

export const updateCollection = createAsyncThunk(
  'collections/updateCollection',
  async ({ id, data }) => {
    const response = await axios.put(`${API_URL}/collections/${id}`, data, getAuthHeaders());
    return response.data.collection;
  }
);

export const deleteCollection = createAsyncThunk(
  'collections/deleteCollection',
  async (collectionId) => {
    await axios.delete(`${API_URL}/collections/${collectionId}`, getAuthHeaders());
    return collectionId;
  }
);

export const addCardToCollection = createAsyncThunk(
  'collections/addCardToCollection',
  async ({ collectionId, cardData }) => {
    const response = await axios.post(
      `${API_URL}/collections/${collectionId}/items`,
      cardData,
      getAuthHeaders()
    );
    return { collectionId, item: response.data.item };
  }
);

export const removeCardFromCollection = createAsyncThunk(
  'collections/removeCardFromCollection',
  async ({ collectionId, itemId }) => {
    await axios.delete(
      `${API_URL}/collections/${collectionId}/items/${itemId}`,
      getAuthHeaders()
    );
    return { collectionId, itemId };
  }
);

// Slice
const collectionSlice = createSlice({
  name: 'collections',
  initialState: {
    collections: [],
    selectedCollection: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedCollection: (state) => {
      state.selectedCollection = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch collections
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch collection by ID
      .addCase(fetchCollectionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollectionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCollection = action.payload;
      })
      .addCase(fetchCollectionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create collection
      .addCase(createCollection.fulfilled, (state, action) => {
        state.collections.unshift(action.payload);
      })
      // Update collection
      .addCase(updateCollection.fulfilled, (state, action) => {
        const index = state.collections.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.collections[index] = { ...state.collections[index], ...action.payload };
        }
      })
      // Delete collection
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.collections = state.collections.filter(c => c.id !== action.payload);
      })
      // Add card to collection
      .addCase(addCardToCollection.fulfilled, (state, action) => {
        if (state.selectedCollection?.id === action.payload.collectionId) {
          state.selectedCollection.items.unshift(action.payload.item);
        }
      })
      // Remove card from collection
      .addCase(removeCardFromCollection.fulfilled, (state, action) => {
        if (state.selectedCollection?.id === action.payload.collectionId) {
          state.selectedCollection.items = state.selectedCollection.items.filter(
            item => item.id !== action.payload.itemId
          );
        }
      });
  },
});

export const { clearSelectedCollection } = collectionSlice.actions;
export default collectionSlice.reducer;