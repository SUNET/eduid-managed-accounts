import { createSlice } from "@reduxjs/toolkit";
import { createGroup, getGroupDetails, putGroup } from "../apis/scimGroupsRequest";
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
  reducers: {
    initialize: (state) => {
      state.managedAccounts = {
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
      };
    },
    updateState: (state, action) => {
      state.managedAccounts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createGroup.fulfilled, (state, action) => {
      state.managedAccounts = action.payload;
    });
    builder.addCase(getGroupDetails.fulfilled, (state, action) => {
      state.managedAccounts = action.payload;
    });
    builder.addCase(putGroup.fulfilled, (state, action) => {
      state.managedAccounts = action.payload;
    });
  },
});

export const getGroupsReducer = getGroupsSlice.reducer;
export default getGroupsSlice;
