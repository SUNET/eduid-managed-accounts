import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  auth_server_url?: string;
  scim_server_url?: string;
  redirect_url?: string;
}

export const initialState: AppState = {
  auth_server_url: undefined,
  scim_server_url: undefined,
  redirect_url: undefined,
};

export const configSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchConfig: (state, action) => {
      state.auth_server_url = action.payload.auth_server_url;
      state.scim_server_url = action.payload.scim_server_url;
      state.redirect_url = action.payload.redirect_url;
    },
  },
});

export const configReducer = configSlice.reducer;
export default configSlice;
