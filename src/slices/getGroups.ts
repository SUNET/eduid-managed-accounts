import { createSlice } from "@reduxjs/toolkit";
import { fetchGroups, getGroupDetails, getGroupsSearch } from "../apis/scim";

interface GetGroupsState {
  groups: any;
  searchedGroups: any;
  members: any;
}

export const initialState: GetGroupsState = {
  groups: [],
  searchedGroups: [],
  members: [],
};

export const getGroupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      state.groups = action.payload.Resources;
    });
    builder.addCase(getGroupsSearch.fulfilled, (state, action) => {
      state.searchedGroups = action.payload.Resources;
    });
    builder.addCase(getGroupDetails.fulfilled, (state, action) => {
      state.members = action.payload.members;
    });
  },
});

export const getGroupsReducer = getGroupsSlice.reducer;
export default getGroupsSlice;
