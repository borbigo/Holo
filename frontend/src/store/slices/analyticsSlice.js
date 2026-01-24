import { createSlice } from '@reduxjs/toolkit';

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    topMovers: [],
    marketOverview: null,
    loading: false,
    error: null,
  },
  reducers: {
    //placeholder for future
  },
});

export default analyticsSlice.reducer;