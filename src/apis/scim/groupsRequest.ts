import { createAsyncThunk } from "@reduxjs/toolkit";
import { GroupResponse, ListResponse } from "typescript-clients/scim";
import { AppDispatch, AppRootState } from "../../init-app";
import { handleErrorResponse } from "./error";

export const baseURL = "https://api.eduid.docker/scim/";

export const scimHeaders = (token: string) => {
  return {
    "Content-Type": "application/scim+json",
    Authorization: `Bearer ${token}`,
  };
};

export const createGroup = createAsyncThunk<
  GroupResponse, // return type
  { displayName: string; accessToken: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/createGroup", async (args, thunkAPI) => {
  try {
    if (args.accessToken) {
      const headers = scimHeaders(args.accessToken);
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
      const scimResponse = await fetch(baseURL + "Groups/", scimRequest);
      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        const result = await scimResponse.json();
        return await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const getGroupsSearch = createAsyncThunk<
  ListResponse, // return type
  { searchFilter: string; accessToken: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/getGroupsSearch", async (args, thunkAPI) => {
  try {
    if (args.accessToken) {
      const headers = scimHeaders(args.accessToken);
      const payload = {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
        filter: `displayName eq "${args.searchFilter}"`,
      };
      const scimRequest = {
        headers: headers,
        method: "POST",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(baseURL + "Groups/.search", scimRequest);
      if (scimResponse.ok) {
        const scimResponseJSON = await scimResponse.json();
        return scimResponseJSON;
      } else {
        const result = await scimResponse.json();
        return await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const getGroupDetails = createAsyncThunk<
  GroupResponse, // return type
  { id: string; accessToken: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/getGroupDetails", async (args, thunkAPI) => {
  try {
    if (args.accessToken) {
      const headers = scimHeaders(args.accessToken);
      const scimRequest = {
        headers: headers,
        method: "GET",
      };
      const scimResponse = await fetch(baseURL + "Groups/" + args.id, scimRequest);

      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        const result = await scimResponse.json();
        return await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const putGroup = createAsyncThunk<
  GroupResponse, // return type
  {
    group: any;
    accessToken: string;
  }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/putGroup", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const version = state.groups.managedAccounts.meta.version;
    if (args.accessToken) {
      const headers = { ...scimHeaders(args.accessToken), "If-Match": version };
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
      const scimResponse = await fetch(baseURL + "Groups/" + args.group.id, scimRequest);
      const jsonResponse = await scimResponse.json();
      if (scimResponse.ok) {
        return jsonResponse;
      } else {
        return await handleErrorResponse(jsonResponse);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});
