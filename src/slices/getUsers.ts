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
  selected?: boolean;
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
      state.members?.sort((a, b) => b.meta.created.localeCompare(a.meta.created));
    },
    sortByGivenName: (state) => {
      state.members?.sort((a, b) => a.name.givenName.toUpperCase().localeCompare(b.name.givenName, "sv"));
    },
    sortBySurname: (state) => {
      state.members?.sort((a, b) => a.name.familyName.toUpperCase().localeCompare(b.name.familyName, "sv"));
    },
    addPassword: (state, action: PayloadAction<{ externalId: string; password: string }>) => {
      const index = state.members.findIndex((member) => member.externalId === action.payload.externalId);
      state.members[index].password = action.payload.password;
      state.members[index].selected = true;
    },
    setSelected: (state, action: PayloadAction<{ id: string; value: boolean }>) => {
      const index = state.members.findIndex((member) => member.id === action.payload.id);
      state.members[index].selected = action.payload.value;
    },
    setAllSelected: (state, action: PayloadAction<boolean>) => {
      state.members = state.members.map((member) => ({ ...member, selected: action.payload }));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      // this initialize the state adding the property "selected" with default value "false"
      action.payload.selected = false;
      state.members.push(action.payload);
    });
    builder.addCase(postUser.fulfilled, (state, action) => {
      action.payload.selected = true;
      state.members.unshift(action.payload);
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.members = state.members?.filter((user) => user.id !== action.payload.id);
    });
  },
});

export const getUsersReducer = getUsersSlice.reducer;
export default getUsersSlice;
