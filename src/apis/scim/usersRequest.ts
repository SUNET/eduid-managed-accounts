import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { fakeEPPNaccount } from "../../common/testEPPNData";
import { ExtendedUserResponse } from "../../slices/getUsers";
import { scimHeaders } from "./groupsRequest";

export const postUser = createAsyncThunk<
  ExtendedUserResponse, // return type
  {
    familyName: string;
    givenName: string;
    loggedInUserScope: string;
  }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("scim/postUser", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const scim_server_url = state.config.scim_server_url;
    const accessToken = state.app.accessToken;
    if (accessToken) {
      const eduIdEppnAccount: string = fakeEPPNaccount(); // what could be expected from Eppn API?
      //const organizerEppn: string = `${eduIdEppn.split("@")[0]}@${args.scope}`;
      const headers = scimHeaders(accessToken);
      const payload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User", "https://scim.eduid.se/schema/nutid/user/v1"],
        externalId: `${eduIdEppnAccount}@dev.eduid.se`, // PRODUCTION @eduid.se or STAGING @dev.eduid.se
        name: {
          familyName: args.familyName,
          givenName: args.givenName,
        },
        "https://scim.eduid.se/schema/nutid/user/v1": {
          profiles: {
            connectIdp: { attributes: { eduPersonPrincipalName: `${eduIdEppnAccount}@${args.loggedInUserScope}` } },
          },
        },
      };
      const scimRequest = {
        headers: headers,
        method: "POST",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(scim_server_url + "/Users/", scimRequest);

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

export const getUserDetails = createAsyncThunk<
  ExtendedUserResponse, // return type
  { id: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("scim/getUserDetails", async (args, thunkAPI) => {
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
      const scimResponse = await fetch(scim_server_url + "/Users/" + args.id, scimRequest);

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

export const deleteUser = createAsyncThunk<
  any, // return type
  { user: { id: string; version: string } }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("scim/deleteUser", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const scim_server_url = state.config.scim_server_url;
    const accessToken = state.app.accessToken;
    if (accessToken) {
      const headers = { ...scimHeaders(accessToken), "If-Match": args.user.version };
      const scimRequest = {
        headers: headers,
        method: "DELETE",
      };
      const scimResponse = await fetch(scim_server_url + "/Users/" + args.user.id, scimRequest);
      if (scimResponse.ok) {
        return args.user;
      } else {
        throw await scimResponse.json();
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});
