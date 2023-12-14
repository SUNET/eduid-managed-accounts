import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { GroupResponse } from "typescript-clients/scim";

export const baseURL = "https://api.eduid.docker/scim/";

export const scimHeaders = (token: string) => {
  return {
    "Content-Type": "application/scim+json",
    Authorization: `Bearer ${token}`,
  };
};

export interface Group {
  id: string;
  displayName: string;
}

export interface AllGroupsResponse {
  groups: Group[];
  Resources: any;
}

export interface GroupsSearchResponse {
  totalResults: number;
  Resources: [{ id: string; displayName: string }];
}

export interface ErrorResponse {
  status: string;
  detail: string;
  message: string;
}

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
  GroupsSearchResponse, // return type
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
  { result: any; accessToken: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/putGroup", async (args, thunkAPI) => {
  try {
    if (args.accessToken) {
      const headers = { ...scimHeaders(args.accessToken), "If-Match": args.result.meta.version };
      // arg.result is the same response from getGroup. It is needed to clear properties that are not needed
      delete args.result.meta;
      delete args.result.schemas;
      const payload = {
        ...args.result,
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      };
      const scimRequest = {
        headers: headers,
        method: "PUT",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(baseURL + "Groups/" + args.result.id, scimRequest);
      if (scimResponse.ok) {
        const json_response = await scimResponse.json();
        return json_response;
      } else {
        const result = await scimResponse.json();
        return await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const handleErrorResponse = async (response: ErrorResponse) => {
  const errorMessage = `Failed with status ${response.status}: ${response.message || response.detail}`;
  throw errorMessage;
};
