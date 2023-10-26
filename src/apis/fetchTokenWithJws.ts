import { createAsyncThunk } from "@reduxjs/toolkit";
import { jwsRequest, url } from "../ts_common";

export const fetchTokenWithJws = createAsyncThunk(
  "auth/fetchTokenWithJws",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(url, jwsRequest);
      if (response.ok) {
        const response_json = await response.json();
        // console.log("jwsRequest", response_json);
        // const redirect_url = response_json?.interact.redirect;
        // window.location.href = redirect_url;
        // console.log("window.location.hash", window.location.hash);
        return response_json;
      } else {
        throw new Error("Failed to fetch token");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
