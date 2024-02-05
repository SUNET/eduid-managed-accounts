import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  auth_server_url?: string;
  scim_server_url?: string;
  redirect_url?: string;
  maccapi_url?: string;
}

export const initialState: AppState = {
  auth_server_url: undefined,
  scim_server_url: undefined,
  redirect_url: undefined,
  maccapi_url: undefined,
};

export const configSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchConfig: (state, action) => {
      const removeTrailingSlash = (url: string) => (url.endsWith("/") ? url.slice(0, -1) : url);
      state.auth_server_url = removeTrailingSlash(action.payload.auth_server_url);
      state.scim_server_url = removeTrailingSlash(action.payload.scim_server_url);
      state.redirect_url = removeTrailingSlash(action.payload.redirect_url);
      state.maccapi_url = removeTrailingSlash(action.payload.maccapi_url);
    },
  },
});

export const configReducer = configSlice.reducer;
export default configSlice;
