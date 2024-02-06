import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Group } from "typescript-clients/scim/models/Group";
import { Name } from "typescript-clients/scim/models/Name";
import { NutidUserExtensionV1 } from "typescript-clients/scim/models/NutidUserExtensionV1";
import { UserResponse } from "typescript-clients/scim/models/UserResponse";
import { deleteUser, getUserDetails, postUser } from "../apis/scim/usersRequest";

type ExternalProfileWithScope = {
  profiles: { connectIdp: { attributes: { eduPersonPrincipalName: string } } } & NutidUserExtensionV1;
};

// Managed Accounts required data format
export type ExtendedUserResponse = UserResponse & {
  externalId: string;
  name: {
    familyName: string;
    givenName: string;
  } & Name;
  groups: Array<Group>;
  "https://scim.eduid.se/schema/nutid/user/v1"?: ExternalProfileWithScope;
  password?: string;
};

export interface GetUsersState {
  members: ExtendedUserResponse[];
}

export const initialState: GetUsersState = {
  members: [],
};

export const getUsersSlice = createSlice({
  name: "users",
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
    addPassword: (state, action: PayloadAction<{ externalId: string; password: string }>) => {
      // find externalId and add password to that object
      const index = state.members.findIndex((member) => member.externalId === action.payload.externalId);
      state.members[index].password = action.payload.password;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      state.members.push(action.payload);
    });
    builder.addCase(postUser.fulfilled, (state, action) => {
      state.members.unshift(action.payload);
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.members = state.members?.filter((user) => user.id !== action.payload.id);
    });
  },
});

export const getUsersReducer = getUsersSlice.reducer;
export default getUsersSlice;
