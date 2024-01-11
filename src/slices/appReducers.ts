import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  isLoaded: boolean;
  accessToken: any;
}

export const initialState: AppState = {
  isLoaded: false,
  accessToken: undefined,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    appIsLoaded: (state, action) => {
      state.isLoaded = action.payload;
    },
  },
});

export const appReducer = appSlice.reducer;
export default appSlice;
