import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  isLoaded: boolean;
}

export const initialState: AppState = {
  isLoaded: false,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    appIsLoaded: (state) => {
      state.isLoaded = true;
    },
  },
});

export const appReducer = appSlice.reducer;
export default appSlice;
