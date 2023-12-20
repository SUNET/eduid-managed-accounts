import { createSlice } from "@reduxjs/toolkit";
import { putGroup } from "../apis/scimGroupsRequest";
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
    sortByLatest: (state) => {
      state.members?.sort(function (a, b) {
        return new Date(b.meta.created).valueOf() - new Date(a.meta.created).valueOf();
      });
    },
    generatedNewPassword: (state, action) => {
      state.members = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      state.members.push(action.payload);
    });
    builder.addCase(postUser.fulfilled, (state, action) => {
      const payloadWithPassword = { ...action.payload, password: fakePassword() };
      state.members.unshift(payloadWithPassword);
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.members = state.members?.filter((user) => user.id !== action.payload.id);
    });
    builder.addCase(putGroup.rejected, (state, action) => {
      state.members = [];
    });
  },
});

export const getUsersReducer = getUsersSlice.reducer;
export default getUsersSlice;
