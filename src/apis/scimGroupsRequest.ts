import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { MANAGED_ACCOUNTS_GROUP_ID } from "../components/GroupManagement";

export const baseURL = "https://api.eduid.docker/scim/";

export const accessTokenTest =
  "eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTcwMTA3NTg4OSwiaWF0IjoxNzAxMDcyMjg5LCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNzAxMDcyMjg5LCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.wGW2HDyuM26vywtvZNwgUAVVQFkmbr7qeqAtcXsEhkdQPxlI24PRkFjjNqvNWPpau6WsCHN0Q-Pj7u-bbd8-dw";

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
  Resources: object[];
}

export interface ErrorResponse {
  status: string;
  detail: string;
  message: string;
}

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
  PutGroupResponse, // return type
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
        "If-Match": state.groups.version,
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

// curl -X PUT -vv --insecure https://api.eduid.docker/scim/Groups/16bda7c5-b7f7-470a-b44a-0a7a32b4876c -H "If-Match: W/\"655dfff7632f3b8148fef4c2\"" -H "Content-Type: application/scim+json" -H "Authorization: Bearer eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTcwMDY3MDAzNCwiaWF0IjoxNzAwNjY2NDM0LCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNzAwNjY2NDM0LCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.cClPWOmZhsQg6mrBG-yQ2KG-aXrqRxI29lmg0MQOflJtfxvLjTVhhTfvEkB_nzEnnRLzT0tnrHH8EXdWQJonXw" -d '{"displayName" : "Test Group 1", "schemas":["urn:ietf:params:scim:schemas:core:2.0:Group"], "id":"16bda7c5-b7f7-470a-b44a-0a7a32b4876c","members":[]}' | json_pp
