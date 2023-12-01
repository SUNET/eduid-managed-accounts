import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { GroupResponse } from "typescript-clients/scim";

export const baseURL = "https://api.eduid.docker/scim/";

export const accessTokenTest =
  "eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTcwMTQ0NTE3OSwiaWF0IjoxNzAxNDQxNTc5LCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNzAxNDQxNTc5LCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.1XFcV1XZhqeBVVvZ5e6IF3RxK5SlftnT6AR6WJTpimRtmBNRIt_gj7o5QKgPsC1JOdfNAKwa4xfaUkLFh0LQBA";

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
        return await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const deleteGroup = createAsyncThunk<
  any, // return type
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
        return await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const fetchAllGroups = createAsyncThunk<
  AllGroupsResponse, // return type
  undefined, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/fetchAllGroups", async (args, thunkAPI) => {
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
        return await handleErrorResponse(result);
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
        return await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const postGroup = createAsyncThunk<
  GroupResponse, // return type
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
  { result: any }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/putGroup", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = {
        "Content-Type": "application/scim+json",
        Authorization: `Bearer ${accessTokenTest}`,
        "If-Match": args.result.meta.version,
      };
      const scimRequest = putRequest();
      delete args.result.meta;
      delete args.result.schemas;
      const payload = {
        ...args.result,
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      };
      const scimResponse = await fetch(baseURL + "Groups/" + args.result.id, {
        ...scimRequest,
        headers,
        body: JSON.stringify(payload),
      });
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
  const errorMessage = `Failed with status ${response.status}: ${
    response.message || response.detail
  }`;
  throw errorMessage;
};

//curl -X PUT -vv --insecure https://api.eduid.docker/scim/Groups/9ccc1331-fd60-4715-8728-962c35034f33 -H "If-Match: W/\"6569aec2467f09ca6d7a0c45\"" -H "Content-Type: application/scim+json" -H "Authorization: Bearer eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTcwMTQyNzc3MSwiaWF0IjoxNzAxNDI0MTcxLCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNzAxNDI0MTcxLCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.i24yhdqlZe7stCJAlq_9WfhB6RztUyJwcg7LgOQ6p2uLDZPZWex_y8oXq78seFSUNAP0b0S2lL0RX1lychUoeg" -d '{"displayName" : "Test Group 1", "id":"9ccc1331-fd60-4715-8728-962c35034f33","members":[],"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group"]}' | json_pp
