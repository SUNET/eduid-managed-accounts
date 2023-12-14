import { createSlice } from "@reduxjs/toolkit";

interface GetLoggedInUserInfoState {
  loggedInUser: {};
}

export const initialState: GetLoggedInUserInfoState = {
  loggedInUser: {},
};

export const getPersonalDataSlice = createSlice({
  name: "personalData",
  initialState,
  reducers: {
    updateUserInfo: (state, action) => {
      state.loggedInUser = action.payload;
    },
  },
});

export const getPersonalDataReducer = getPersonalDataSlice.reducer;
export default getPersonalDataSlice;
