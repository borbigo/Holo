import { createSlice } from '@reduxjs/toolkit';

const setsSlice = createSlice({
  name: 'sets',
  initialState: {
    sets: [],
    selectedSet: null,
    loading: false,
    error: null,
  },
  reducers: {
    //placeholder for future 
  },
});

export default setsSlice.reducer;
