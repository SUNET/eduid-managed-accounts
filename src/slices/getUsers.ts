import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Group } from "typescript-clients/scim/models/Group";
import { Name } from "typescript-clients/scim/models/Name";
import { NutidUserExtensionV1 } from "typescript-clients/scim/models/NutidUserExtensionV1";
import { UserResponse } from "typescript-clients/scim/models/UserResponse";
import { deleteUser, getUserDetails, postUser } from "../apis/scim/usersRequest";

type ExternalProfileWithScope = {
  profiles: { connectIdp: { attributes: { eduPersonPrincipalName: string } } } & NutidUserExtensionV1;
};

export type AccountState = { externalId: string; password?: string; selected?: boolean };

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
  deletedMembers: Array<string>;
}

export const initialState: GetUsersState = {
  members: [],
  deletedMembers: [],
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
    setSelected: (state, action: PayloadAction<{ id: string; value: boolean }>) => {
      const index = state.members.findIndex((member) => member.id === action.payload.id);
      state.members[index].selected = action.payload.value;
    },
    setAllSelected: (state, action: PayloadAction<boolean>) => {
      state.members = state.members.map((member) => ({ ...member, selected: action.payload }));
    },
    setAccountsState: (state, action: PayloadAction<Array<AccountState>>) => {
      action.payload.forEach((accountStateMember) => {
        const index = state.members.findIndex(
          (storeMember) => storeMember.externalId === accountStateMember.externalId
        );
        state.members[index].password = accountStateMember.password ? accountStateMember.password : undefined;
        state.members[index].selected = accountStateMember.selected ? accountStateMember.selected : false;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      // this initialize the state adding the property "selected" with default value "false"
      action.payload.selected = false;
      state.members.push(action.payload);
    });
    builder.addCase(getUserDetails.rejected, (state, action: any) => {
      if (action.payload?.status === 404) {
        state.deletedMembers.push(action.payload.id);
      }
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
