import { createSlice } from "@reduxjs/toolkit";
import {
  fetchGroups,
  getGroupDetails,
  putGroup,
} from "../apis/scimGroupsRequest";
import { GroupResponse, SCIMResourceType } from "../typescript-clients/scim";

interface GetGroupsState {
  managedAccounts: GroupResponse;
}

export const initialState: GetGroupsState = {
  managedAccounts: {
    id: "",
    meta: {
      location: "",
      lastModified: "",
      resourceType: SCIMResourceType.GROUP,
      created: "",
      version: null,
    },
    schemas: [],
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
      state.managedAccounts = action.payload;
    });
    builder.addCase(putGroup.fulfilled, (state, action) => {
      console.log("action", action);
      state.managedAccounts = action.payload;
    });
  },
});

export const getGroupsReducer = getGroupsSlice.reducer;
export default getGroupsSlice;
