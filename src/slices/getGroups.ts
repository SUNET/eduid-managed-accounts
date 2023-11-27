import { createSlice } from "@reduxjs/toolkit";
import { Group, fetchGroups, getGroupDetails, getGroupsSearch } from "../apis/scimGroupsRequest";
import { getUserDetails } from "../apis/scimUsersRequest";

interface GetGroupsState {
  groups: Group[];
  searchedGroups: object[];
  members: any;
  version: string;
  userVersion: string;

  managedAccounts: {
    id: string;
    version: string;
    displayName: string;
    members: [
      {
        version: string;
        value: string;
        $ref: string;
        familyName: string;
        givenName: string;
        eppn: string;
        password: string;
      }
    ];
  };
}

export const initialState: GetGroupsState = {
  groups: [],
  searchedGroups: [], // TODO: Should it be in its own slice?
  members: [],
  version: "",
  userVersion: "", // TODO: Should it be in its own slice?

  managedAccounts: {
    id: "",
    version: "",
    displayName: "",
    members: [
      {
        //   {
        //     "value": "2496714d-700f-4791-a6b0-f82a390d7035",
        //     "$ref": "https://api.eduid.docker/scim/Users/2496714d-700f-4791-a6b0-f82a390d7035",
        //     "display": "ss s"
        // }
        version: "",
        value: "",
        $ref: "",
        familyName: "",
        givenName: "",
        eppn: "",
        password: "",
      },
    ],
  },
};

export const getGroupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      state.groups = action.payload?.Resources;
    });
    builder.addCase(getGroupsSearch.fulfilled, (state, action) => {
      state.searchedGroups = action.payload?.Resources;
    });
    builder.addCase(getGroupDetails.fulfilled, (state, action) => {
      console.log("action", action);
      state.managedAccounts.version = action.payload.meta.version;
      state.managedAccounts.members = action.payload?.members;
    });
    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      state.userVersion = action.payload.meta.version;
    });
  },
});

export const getGroupsReducer = getGroupsSlice.reducer;
export default getGroupsSlice;
