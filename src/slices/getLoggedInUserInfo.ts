import { createSlice } from "@reduxjs/toolkit";

interface GetLoggedInUserInfoState {
  loggedInUser: {
    user?: {
      attributes: {
        displayName: string;
        eduPersonAssurance: string[];
        eduPersonEntitlement: string[];
        eduPersonTargetedID: string;
        givenName: string;
        mail: string;
        sn: string;
      };
    };
  };
}

export const initialState: GetLoggedInUserInfoState = {
  loggedInUser: {
    user: {
      attributes: {
        displayName: "",
        eduPersonAssurance: [],
        eduPersonEntitlement: [],
        eduPersonTargetedID: "",
        givenName: "",
        mail: "",
        sn: "",
      },
    },
  },
};

export const getPersonalDataSlice = createSlice({
  name: "personalData",
  initialState,
  reducers: {
    updateUserInfo: (state, action) => {
      state.loggedInUser = action.payload;
    },
    initialize: (state) => {
      state.loggedInUser = {};
    },
  },
});

export const getPersonalDataReducer = getPersonalDataSlice.reducer;
export default getPersonalDataSlice;
