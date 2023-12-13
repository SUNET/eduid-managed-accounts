import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { UserResponse } from "typescript-clients/scim";
import { fakeEPPN } from "../common/testEPPNData";
import { baseURL, createScimRequest, handleErrorResponse, scimHeaders } from "./scimGroupsRequest";

export const postUser = createAsyncThunk<
  UserResponse, // return type
  {
    familyName: string;
    givenName: string;
    accessToken: string;
  }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/postUser", async (args, thunkAPI) => {
  try {
    if (args.accessToken) {
      const headers = scimHeaders(args.accessToken);
      const scimRequest = createScimRequest(args.familyName);
      const payload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        externalId: fakeEPPN(),
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

export const getUserDetails = createAsyncThunk<
  UserResponse, // return type
  { id: string; accessToken: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/getUserDetails", async (args, thunkAPI) => {
  try {
    if (args.accessToken) {
      const headers = scimHeaders(args.accessToken);
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
  { user: { id: string; version: string }; accessToken: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/deleteUser", async (args, thunkAPI) => {
  try {
    if (args.accessToken) {
      const headers = {
        "Content-Type": "application/scim+json",
        Authorization: `Bearer ${args.accessToken}`,
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
        return args.user;
      } else {
        const result = await scimResponse.json();
        await handleErrorResponse(result);
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});
