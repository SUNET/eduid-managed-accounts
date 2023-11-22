import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  Group,
  fetchGroups,
  fetchGroupsResponse,
  getGroupDetails,
  getGroupsSearch,
  getUserDetails,
  postUser,
} from "../apis/scimRequest";

interface GetGroupsState {
  groups: Group[];
  searchedGroups: any;
  members: any;
  version: string;
  userVersion: string;
}

export const initialState: GetGroupsState = {
  groups: [],
  searchedGroups: [],
  members: [],
  version: "",
};

export const getGroupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGroups.fulfilled, (state, action: PayloadAction<fetchGroupsResponse>) => {
      state.groups = action.payload?.Resources;
    });
    builder.addCase(getGroupsSearch.fulfilled, (state, action) => {
      state.searchedGroups = action.payload?.Resources;
    });
    builder.addCase(getGroupDetails.fulfilled, (state, action) => {
      console.log("action.payload", action.payload);
      state.version = action.payload.meta.version;
      state.members = action.payload?.members;
    });
    builder.addCase(postUser.fulfilled, (state, action) => {
      console.log("postUser action", action.payload);
    });
    builder.addCase(getUserDetails.fulfilled, (state, action) => {
      state.userVersion = action.payload.meta.version;
    });
  },
});

export const getGroupsReducer = getGroupsSlice.reducer;
export default getGroupsSlice;
