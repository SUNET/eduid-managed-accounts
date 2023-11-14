import { createSlice } from "@reduxjs/toolkit";

interface FetchInteractionState {
  is_loaded: boolean;
  start_session: {
    interact: {
      redirect?: string;
      finish?: string;
    };
  };
  nonce: string;
}

export const initialState: FetchInteractionState = {
  is_loaded: false,
  start_session: {
    interact: {
      redirect: "",
      finish: "",
    },
  },
  nonce: "",
};

export const fetchInteractionSlice = createSlice({
  name: "fetchInteraction",
  initialState,
  reducers: {
    appLoaded: (state) => {
      state.is_loaded = true;
    },
  },
  // extraReducers: (builder) => {
  //   builder.addCase(fetchTokenWithJws.fulfilled, (state, action) => {
  //     state.start_session = action.payload.response_json;
  //     state.nonce = action.payload.nonce;
  //   });
  // },
});

export const fetchJWSReducer = fetchInteractionSlice.reducer;
export default fetchInteractionSlice;
