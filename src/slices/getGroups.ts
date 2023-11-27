import { createSlice } from "@reduxjs/toolkit";
import { fetchGroups, getGroupDetails } from "../apis/scimGroupsRequest";
import { GroupMember } from "../typescript-clients/scim";

interface GetGroupsState {
  // managedAccounts: {
  //   id: string;
  //   version: string;
  //   displayName: string;
  //   members: [
  //     {
  //       version: string;
  //       value: string;
  //       $ref: string;
  //       familyName: string;
  //       givenName: string;
  //       eppn: string;
  //       password: string;
  //     }
  //   ];
  // };
  managedAccounts: {
    id: string;
    meta: {
      location: string;
      lastModified: string;
      resourceType: string;
      created: string;
      version: string;
    };
    displayName: string;
    members: GroupMember[];
  };
}

export const initialState: GetGroupsState = {
  managedAccounts: {
    id: "",
    meta: {
      location: "",
      lastModified: "",
      resourceType: "",
      created: "",
      version: "",
    },
    displayName: "",
    members: [],
  },
};

export const getGroupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      state.managedAccounts.id = action.payload?.Resources[0].id;
    });
    // builder.addCase(getGroupsSearch.fulfilled, (state, action) => {
    //   state.searchedGroups = action.payload?.Resources;
    // });
    builder.addCase(getGroupDetails.fulfilled, (state, action) => {
      state.managedAccounts.meta.version = action.payload.meta.version;
      state.managedAccounts.members = action.payload?.members;
    });
  },
});

export const getGroupsReducer = getGroupsSlice.reducer;
export default getGroupsSlice;
