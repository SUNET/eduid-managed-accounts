import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { UserResponse } from "typescript-clients/scim";
import { fakeEPPN } from "../common/testEPPNData";
import { baseURL, handleErrorResponse, scimHeaders } from "./scimGroupsRequest";

export const postUser = createAsyncThunk<
  UserResponse, // return type
  {
    familyName: string;
    givenName: string;
    accessToken: string;
    scope: string;
  }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/postUser", async (args, thunkAPI) => {
  try {
    if (args.accessToken) {
      const eduIdEppn: string = fakeEPPN(); // what could be expected from eppn API
      const organizerEppn: string = `${eduIdEppn.split("@")[0]}@${args.scope}`;
      const headers = scimHeaders(args.accessToken);
      const payload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User", "https://scim.eduid.se/schema/nutid/user/v1"],
        externalId: eduIdEppn,
        name: {
          familyName: args.familyName,
          givenName: args.givenName,
        },
        "https://scim.eduid.se/schema/nutid/user/v1": {
          profiles: { connectIdp: { attributes: { eduPersonPrincipalName: organizerEppn } } },
        },
      };
      const scimRequest = {
        headers: headers,
        method: "POST",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(baseURL + "Users", scimRequest);

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
      const scimRequest = {
        headers: headers,
        method: "GET",
      };
      const scimResponse = await fetch(baseURL + "Users/" + args.id, scimRequest);

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
      const headers = { ...scimHeaders(args.accessToken), "If-Match": args.user.version };
      const scimRequest = {
        headers: headers,
        method: "DELETE",
      };
      const scimResponse = await fetch(baseURL + "Users/" + args.user.id, scimRequest);
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
