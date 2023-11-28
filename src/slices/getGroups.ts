import { createSlice } from "@reduxjs/toolkit";
import {
  createGroup,
  fetchAllGroups,
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
    builder.addCase(createGroup.fulfilled, (state, action) => {
      state.managedAccounts = action.payload;
    });
    builder.addCase(fetchAllGroups.fulfilled, (state, action) => {
      state.managedAccounts.id = action.payload?.Resources[0].id;
    });
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
