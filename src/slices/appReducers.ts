import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  isLoaded: boolean;
  accessToken: any;
  forcedLogout: boolean;
  isFetching: boolean;
}

export const initialState: AppState = {
  isLoaded: false,
  accessToken: null,
  forcedLogout: false,
  isFetching: false,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    initialize: (state) => {
      state.accessToken = null;
      state.isLoaded = false;
      state.forcedLogout = false;
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    forcedLogout: (state) => {
      state.forcedLogout = true;
    },
    appIsLoaded: (state, action) => {
      state.isLoaded = action.payload;
    },
    isFetching: (state, action) => {
      state.isFetching = action.payload;
    },
  },
});

export const appReducer = appSlice.reducer;
export default appSlice;
