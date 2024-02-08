import { createSlice } from "@reduxjs/toolkit";

interface GetLoggedInUserInfoState {
  loggedInUser: {
    user?: {
      attributes: {
        eduPersonAssurance: string[];
        eduPersonEntitlement: string[];
        eduPersonTargetedID: string;
        eduPersonPrincipalName: string;
        givenName: string;
        sn: string;
      };
    };
  };
}

export const initialState: GetLoggedInUserInfoState = {
  loggedInUser: {
    user: {
      attributes: {
        eduPersonAssurance: [],
        eduPersonEntitlement: [],
        eduPersonTargetedID: "",
        eduPersonPrincipalName: "",
        givenName: "",
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
