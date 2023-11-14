import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";

export const baseURL = "https://api.eduid.docker/scim/";

export const accessTokenTest =
  "eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJlZHVpZC5kb2NrZXIiLCJhdXRoX3NvdXJjZSI6ImNvbmZpZyIsImV4cCI6MTY5OTk3OTQ2MiwiaWF0IjoxNjk5OTc1ODYyLCJpc3MiOiJhcGkuZWR1aWQuZG9ja2VyIiwibmJmIjoxNjk5OTc1ODYyLCJyZXF1ZXN0ZWRfYWNjZXNzIjpbeyJzY29wZSI6ImVkdWlkLnNlIiwidHlwZSI6InNjaW0tYXBpIn1dLCJzY29wZXMiOlsiZWR1aWQuc2UiXSwic291cmNlIjoiY29uZmlnIiwic3ViIjoiZWR1aWRfbWFuYWdlZF9hY2NvdW50c18xIiwidmVyc2lvbiI6MX0.4_BDThJlSdM67dV_FL9kZlYWHbimADY7VgtiKfwaR82X7yKLNsccjUcV2DVM98Fujh8KjfOLclIngNtrLj4wsw";

const scimHeaders = (token: string) => {
  return {
    "Content-Type": "application/scim+json",
    Authorization: "Bearer " + token,
  };
};

function createScimRequest(body?: string) {
  const scimRequest = {
    headers: scimHeaders,
    method: body ? "POST" : "GET",
  };
  return scimRequest;
}

interface fetchGroupsResponse {}

export const fetchGroups = createAsyncThunk<
  fetchGroupsResponse, // return type
  undefined, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/fetchGroups", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = scimHeaders(accessTokenTest);
      const scimRequest = createScimRequest();
      const scimResponse = await fetch(baseURL + "Groups/", { ...scimRequest, headers });
      if (scimResponse.ok) {
        return await scimResponse.json();
      } else {
        throw new Error("Failed to fetch SCIM data");
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

interface getGroupsSearchResponse {}

export const getGroupsSearch = createAsyncThunk<
  getGroupsSearchResponse, // return type
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
        throw new Error("Failed to fetch SCIM data");
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

interface getGroupDetailsResponse {}

export const getGroupDetails = createAsyncThunk<
  getGroupDetailsResponse, // return type
  { id: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/getGroupDetails", async (args, thunkAPI) => {
  console.log("getGroupDetails", args.id);
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
        throw new Error("Failed to fetch SCIM data");
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

interface postUserResponse {}

export const postUser = createAsyncThunk<
  postUserResponse, // return type
  { familyName: string; givenName: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/postUser", async (args, thunkAPI) => {
  try {
    if (accessTokenTest) {
      const headers = scimHeaders(accessTokenTest);
      const scimRequest = createScimRequest(args.familyName);
      const payload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        externalId: args.givenName,
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
        throw new Error("Failed to fetch SCIM data");
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});
