import { createSlice } from "@reduxjs/toolkit";
import { deleteUser, getUserDetails, postUser } from "../apis/scimUsersRequest";
import { fakePassword } from "../common/testEPPNData";

interface GetUsersState {
  //members: UserResponse[];
  members: any[];
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
      const payloadWithPassword = { ...action.payload, password: fakePassword() };
      state.members.push(payloadWithPassword);
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.members = state.members?.filter((user: any) => user.id !== action.payload.id);
    });
  },
});

export const getUsersReducer = getUsersSlice.reducer;
export default getUsersSlice;
