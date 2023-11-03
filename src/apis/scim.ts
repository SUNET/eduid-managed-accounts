import { createAsyncThunk } from "@reduxjs/toolkit";

const scimUrl = "https://api.eduid.docker/scim/Groups";

const scimHeaders = (token: string) => {
  return {
    Authorization: "Bearer " + token,
  };
};

const scimRequest: any = {
  headers: scimHeaders,
  method: "GET",
};

export const fetchScimData = createAsyncThunk(
  "auth/fetchScimData",
  async (token: null | string, thunkAPI) => {
    try {
      if (token) {
        const headers = scimHeaders(token);
        const scimResponse = await fetch(scimUrl, { ...scimRequest, headers });
        if (scimResponse.ok) {
          return await scimResponse.json();
        } else {
          throw new Error("Failed to fetch SCIM data");
        }
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export default fetchScimData;
