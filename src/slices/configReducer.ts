import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  auth_server_url?: string;
  scim_server_url?: string;
  ma_website_url?: string;
  maccapi_url?: string;
}

export const initialState: AppState = {
  auth_server_url: undefined,
  scim_server_url: undefined,
  ma_website_url: undefined,
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
      state.ma_website_url = removeTrailingSlash(action.payload.ma_website_url);
      state.maccapi_url = removeTrailingSlash(action.payload.maccapi_url);
    },
  },
});

export const configReducer = configSlice.reducer;
export default configSlice;
