import { createSlice } from "@reduxjs/toolkit";
import { getUserDetails, postUser } from "../apis/scimUsersRequest";
import { UserResponse } from "../typescript-clients/scim";

interface GetUsersState {
  members: UserResponse[];
}

export const initialState: GetUsersState = {
  members: [],
};

export const getUsersSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      state.members.push(action.payload);
    });
    builder.addCase(postUser.fulfilled, (state, action) => {
      state.members.push(action.payload);
    });
  },
});

export const getUsersReducer = getUsersSlice.reducer;
export default getUsersSlice;
