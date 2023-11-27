import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { MANAGED_ACCOUNTS_GROUP_ID } from "../components/GroupManagement";

export const baseURL = "https://api.eduid.docker/scim/";

export const accessTokenTest =
  "eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTcwMTEwMDc1OSwiaWF0IjoxNzAxMDk3MTU5LCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNzAxMDk3MTU5LCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.pye05L26iFhJfc3tHzh2-mBou2zngR3fPzOC9wK3rSGttqGxdrcFcesJIiqpO6vXBqz_YiRBSK32qXa2PeVhMw";

export const scimHeaders = (token: string) => {
  return {
    "Content-Type": "application/scim+json",
    Authorization: `Bearer ${token}`,
  };
};

export function createScimRequest(body?: string) {
  const scimRequest = {
    headers: scimHeaders,
    method: body ? "POST" : "GET",
  };
  return scimRequest;
}

function putRequest() {
  const scimRequest = {
    headers: scimHeaders,
    method: "PUT",
  };
  return scimRequest;
}

export interface Group {
  id: string;
  displayName: string;
}

export interface GroupsResponse {
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
  GroupsResponse, // return type
  { displayName: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/createGroup", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = scimHeaders(accessTokenTest);
      const scimRequest = createScimRequest(accessTokenTest);
      const payload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        displayName: args.displayName,
        members: [],
      };
      const scimResponse = await fetch(baseURL + "Groups/", {
        ...scimRequest,
        headers,
        body: JSON.stringify(payload),
      });
      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        const result = await scimResponse.json();
        await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const deleteGroup = createAsyncThunk<
  GroupsResponse, // return type
  { group: { id: string; version: string } }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/deleteGroup", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = {
        "Content-Type": "application/scim+json",
        Authorization: `Bearer ${accessTokenTest}`,
        "If-Match": args.group.version,
      };
      const scimRequest = {
        headers: scimHeaders,
        method: "DELETE",
      };
      const scimResponse = await fetch(baseURL + "Groups/" + args.group.id, {
        ...scimRequest,
        headers,
      });

      if (scimResponse.ok) {
        console.log("successfully deleted group");
      } else {
        const result = await scimResponse.json();
        await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const fetchGroups = createAsyncThunk<
  GroupsResponse, // return type
  undefined, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/fetchGroups", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = scimHeaders(accessTokenTest);
      const scimRequest = createScimRequest();
      const scimResponse = await fetch(baseURL + "Groups/", {
        ...scimRequest,
        headers,
      });

      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        const result = await scimResponse.json();
        await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const getGroupsSearch = createAsyncThunk<
  GroupsSearchResponse, // return type
  { searchFilter: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/getGroupsSearch", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = scimHeaders(accessTokenTest);
      const scimRequest = createScimRequest(args.searchFilter);
      const payload = {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
        filter: `displayName eq "${args.searchFilter}"`,
      };
      const scimResponse = await fetch(baseURL + "Groups/.search", {
        ...scimRequest,
        headers,
        body: JSON.stringify(payload),
      });
      if (scimResponse.ok) {
        const scimResponseJSON = await scimResponse.json();
        console.log("SEARCH GROUPS RESPONSE: ", scimResponseJSON);
        return scimResponseJSON;
      } else {
        const result = await scimResponse.json();
        await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

interface GetGroupDetailsResponse {}

export const getGroupDetails = createAsyncThunk<
  any, // return type
  { id: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/getGroupDetails", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = scimHeaders(accessTokenTest);
      const scimRequest = createScimRequest();
      const scimResponse = await fetch(baseURL + "Groups/" + args.id, {
        ...scimRequest,
        headers,
      });

      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        const result = await scimResponse.json();
        await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

interface PostGroupResponse {}

export const postGroup = createAsyncThunk<
  PostGroupResponse, // return type
  { displayName: any }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/postGroup", async (args, thunkAPI) => {
  const state = thunkAPI.getState();
  try {
    if (accessTokenTest) {
      const headers = {
        "Content-Type": "application/scim+json",
        Authorization: `Bearer ${accessTokenTest}`,
      };
      const scimRequest = {
        headers: scimHeaders,
        method: "POST",
      };
      const payload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
        displayName: args.displayName,
        members: [],
      };
      const scimResponse = await fetch(baseURL + "Groups/", {
        ...scimRequest,
        headers,
        body: JSON.stringify(payload),
      });
      if (scimResponse.ok) {
        await scimResponse.json();
      } else {
        const result = await scimResponse.json();
        await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

interface PutGroupResponse {}

export const putGroup = createAsyncThunk<
  any, // return type
  { result: any }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/putGroup", async (args, thunkAPI) => {
  console.log("result", args.result);
  const state = thunkAPI.getState();
  try {
    if (accessTokenTest) {
      const headers = {
        "Content-Type": "application/scim+json",
        Authorization: `Bearer ${accessTokenTest}`,
        "If-Match": state.groups.managedAccounts.meta.version,
      };
      const scimRequest = putRequest();
      delete args.result.meta;
      delete args.result.schemas;
      const payload = {
        ...args.result,
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      };
      const scimResponse = await fetch(baseURL + "Groups/" + MANAGED_ACCOUNTS_GROUP_ID, {
        ...scimRequest,
        headers,
        body: JSON.stringify(payload),
      });
      if (scimResponse.ok) {
        await scimResponse.json();
      } else {
        const result = await scimResponse.json();
        await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const handleErrorResponse = async (response: ErrorResponse) => {
  const errorMessage = `Failed with status ${response.status}: ${response.message || response.detail}`;
  throw new Error(errorMessage);
};

// curl -X PUT -vv --insecure https://api.eduid.docker/scim/Groups/16bda7c5-b7f7-470a-b44a-0a7a32b4876c -H "If-Match: W/\"65646f1cbc2e092fda29c465\"" -H "Content-Type: application/scim+json" -H "Authorization: Bearer eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTcwMTA4NDEyOCwiaWF0IjoxNzAxMDgwNTI4LCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNzAxMDgwNTI4LCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.qnXOseUTLfmhaCbb1-hL_R9hOKW6o3IfWbdSItoIFoR7RIo3_UhDOzxshjwqx5_5to8W7NkQ92r29qKQU0pG9g" -d '{"displayName" : "Test Group 1", "schemas":["urn:ietf:params:scim:schemas:core:2.0:Group"], "id":"16bda7c5-b7f7-470a-b44a-0a7a32b4876c","members":[]}' | json_pp
