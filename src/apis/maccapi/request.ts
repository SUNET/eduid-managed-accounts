import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "../../init-app";

type MaccapiResponse = {
  status: string;
  scope: string;
  user: {
    eppn: string;
    given_name: string;
    surname: string;
    password?: string;
  };
};

export const maccapiHeaders = (token: string) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const createUser = createAsyncThunk<
  MaccapiResponse, // return type
  {
    familyName: string;
    givenName: string;
  }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("maccapi/createUser", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const accessToken = state.app.accessToken;
    if (accessToken) {
      const headers = maccapiHeaders(accessToken);
      const payload = {
        given_name: args.givenName,
        surname: args.familyName,
      };
      const scimRequest = {
        headers: headers,
        method: "POST",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(state.config.backend_url + "/Users/create", scimRequest);

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

export const removeUser = createAsyncThunk<
  MaccapiResponse, // return type
  {
    eppn: string;
  }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("maccapi/removeUser", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const accessToken = state.app.accessToken;
    if (accessToken) {
      const headers = maccapiHeaders(accessToken);
      const payload = {
        eppn: args.eppn,
      };
      const scimRequest = {
        headers: headers,
        method: "POST",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(state.config.backend_url + "/Users/remove", scimRequest);

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

export const resetPassword = createAsyncThunk<
  MaccapiResponse, // return type
  {
    eppn: string;
  }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("maccapi/resetPassword", async (args, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const accessToken = state.app.accessToken;
    if (accessToken) {
      const headers = maccapiHeaders(accessToken);
      const payload = {
        eppn: args.eppn,
      };
      const scimRequest = {
        headers: headers,
        method: "POST",
        body: JSON.stringify(payload),
      };
      const scimResponse = await fetch(state.config.backend_url + "/Users/reset_password", scimRequest);

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
