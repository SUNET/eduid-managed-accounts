import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { generateNonce } from "../common/CryptoUtils";
import { MANAGED_ACCOUNTS_GROUP_ID } from "../components/GroupManagement";

export const baseURL = "https://api.eduid.docker/scim/";

export const accessTokenTest =
  "eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTcwMDY3MDAzNCwiaWF0IjoxNzAwNjY2NDM0LCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNzAwNjY2NDM0LCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.cClPWOmZhsQg6mrBG-yQ2KG-aXrqRxI29lmg0MQOflJtfxvLjTVhhTfvEkB_nzEnnRLzT0tnrHH8EXdWQJonXw";

const scimHeaders = (token: string) => {
  return {
    "Content-Type": "application/scim+json",
    Authorization: `Bearer ${token}`,
  };
};

function createScimRequest(body?: string) {
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
  GroupsResponse, // return type
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
        // startIndex: 1,
        // count: 100,
        // attributes: ["string"],
      };
      const scimResponse = await fetch(baseURL + "Groups/.search", {
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

interface PostUserResponse {}

export const postUser = createAsyncThunk<
  any, // return type
  {
    familyName: string;
    givenName: string;
  }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/postUser", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = scimHeaders(accessTokenTest);
      const scimRequest = createScimRequest(args.familyName);
      const payload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        externalId: generateNonce(12),
        name: {
          familyName: args.familyName,
          givenName: args.givenName,
        },
      };
      const scimResponse = await fetch(baseURL + "Users", {
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

export const getUserDetails = createAsyncThunk<
  any, // return type
  { id: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/getUserDetails", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = scimHeaders(accessTokenTest);
      const scimRequest = createScimRequest();
      const scimResponse = await fetch(baseURL + "Users/" + args.id, {
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

export const deleteUser = createAsyncThunk<
  any, // return type
  { user: { id: string; version: string } }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/deleteUser", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = {
        "Content-Type": "application/scim+json",
        Authorization: `Bearer ${accessTokenTest}`,
        "If-Match": args.user.version,
      };
      const scimRequest = {
        headers: scimHeaders,
        method: "DELETE",
      };

      const scimResponse = await fetch(baseURL + "Users/" + args.user.id, {
        ...scimRequest,
        headers,
      });
      if (scimResponse.ok) {
        console.log("Successfully deleted user");
      } else {
        const result = await scimResponse.json();
        await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

const handleErrorResponse = async (response: ErrorResponse) => {
  const errorMessage = `Failed with status ${response.status}: ${response.message || response.detail}`;
  throw new Error(errorMessage);
};

// curl -X PUT -vv --insecure https://api.eduid.docker/scim/Groups/16bda7c5-b7f7-470a-b44a-0a7a32b4876c -H "If-Match: W/\"655dfff7632f3b8148fef4c2\"" -H "Content-Type: application/scim+json" -H "Authorization: Bearer eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTcwMDY3MDAzNCwiaWF0IjoxNzAwNjY2NDM0LCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNzAwNjY2NDM0LCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.cClPWOmZhsQg6mrBG-yQ2KG-aXrqRxI29lmg0MQOflJtfxvLjTVhhTfvEkB_nzEnnRLzT0tnrHH8EXdWQJonXw" -d '{"displayName" : "Test Group 1", "schemas":["urn:ietf:params:scim:schemas:core:2.0:Group"], "id":"16bda7c5-b7f7-470a-b44a-0a7a32b4876c","members":[]}' | json_pp
