import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "../../init-app";
import { GroupResponse, ListResponse } from "../../typescript-clients/scim";

export const scimHeaders = (token: string) => {
  return {
    "Content-Type": "application/scim+json",
    Authorization: `Bearer ${token}`,
  };
};

export const createGroup = createAsyncThunk<
  GroupResponse, // return type
  { displayName: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("scim/createGroup", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const scim_server_url = state.config.scim_server_url;
    const accessToken = state.app.accessToken;
    if (accessToken) {
      const headers = scimHeaders(accessToken);
      const payload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        displayName: args.displayName,
        members: [],
      };
      const scimRequest = {
        headers: headers,
        method: "POST",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(scim_server_url + "/Groups/", scimRequest);
      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        throw await scimResponse.json();
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const getGroupsSearch = createAsyncThunk<
  ListResponse, // return type
  { searchFilter: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("scim/getGroupsSearch", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const scim_server_url = state.config.scim_server_url;
    const accessToken = state.app.accessToken;
    if (accessToken) {
      const headers = scimHeaders(accessToken);
      const payload = {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
        filter: `displayName eq "${args.searchFilter}"`,
      };
      const scimRequest = {
        headers: headers,
        method: "POST",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(scim_server_url + "/Groups/.search", scimRequest);
      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        throw await scimResponse.json();
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const getGroupDetails = createAsyncThunk<
  GroupResponse, // return type
  { id: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("scim/getGroupDetails", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const scim_server_url = state.config.scim_server_url;
    const accessToken = state.app.accessToken;
    if (accessToken) {
      const headers = scimHeaders(accessToken);
      const scimRequest = {
        headers: headers,
        method: "GET",
      };
      const scimResponse = await fetch(scim_server_url + "/Groups/" + args.id, scimRequest);

      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        throw await scimResponse.json();
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const putGroup = createAsyncThunk<
  GroupResponse, // return type
  { group: any }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("scim/putGroup", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const version = state.groups.managedAccounts.meta.version;
    const scim_server_url = state.config.scim_server_url;
    const accessToken = state.app.accessToken;
    if (accessToken) {
      const headers = { ...scimHeaders(accessToken), "If-Match": version };
      // arg.result is the same response from getGroup. It is needed to clear properties that are not needed
      delete args.group.meta;
      delete args.group.schemas;
      const payload = {
        ...args.group,
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"], // this is different from getGroup
      };
      const scimRequest = {
        headers: headers,
        method: "PUT",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(scim_server_url + "/Groups/" + args.group.id, scimRequest);
      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        throw await scimResponse.json();
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});
