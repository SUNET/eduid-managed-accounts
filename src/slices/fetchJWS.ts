import { createSlice } from "@reduxjs/toolkit";
import { fetchTokenWithJws } from "../apis/fetchTokenWithJws";

interface FetchJWSState {
  is_loaded: boolean;
  start_session: {
    interact: {
      redirect?: string;
    };
  };
}

export const initialState: FetchJWSState = {
  is_loaded: false,
  start_session: {
    interact: {
      redirect: "",
    },
  },
};

export const fetchJWSSlice = createSlice({
  name: "fetchJWS",
  initialState,
  reducers: {
    appLoaded: (state) => {
      state.is_loaded = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTokenWithJws.fulfilled, (state, action) => {
      state.start_session = action.payload;
    });
  },
});

export const fetchJWSReducer = fetchJWSSlice.reducer;
export default fetchJWSSlice;
