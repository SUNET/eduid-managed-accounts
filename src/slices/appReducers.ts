import { createSlice } from "@reduxjs/toolkit";
import { PostContinueRequestResponse } from "apis/gnap/continueRequest";

interface AppState {
  isLoaded: boolean;
  accessToken: PostContinueRequestResponse;
}

export const initialState: AppState = {
  isLoaded: false,
  accessToken: {
    access_token: {
      value: "",
    },
    subject: {
      assertions: [],
    },
  },
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    appIsLoaded: (state) => {
      state.isLoaded = true;
    },
    saveAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
  },
});

export const appReducer = appSlice.reducer;
export default appSlice;
