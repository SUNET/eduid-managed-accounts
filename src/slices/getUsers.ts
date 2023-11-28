import { createSlice } from "@reduxjs/toolkit";
import { deleteUser, getUserDetails, postUser } from "../apis/scimUsersRequest";
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
  reducers: {
    initialize: (state) => {
      state.members = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      state.members.push(action.payload);
    });
    builder.addCase(postUser.fulfilled, (state, action) => {
      state.members.push(action.payload);
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.members = state.members?.filter((user: any) => user.id !== action.payload.id);
    });
  },
});

export const getUsersReducer = getUsersSlice.reducer;
export default getUsersSlice;
