import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { CompactSign, importJWK } from "jose";
import { ContinueRequest } from "services/openapi";
import { getSHA256Hash } from "../components/TestHash";

interface postContinueRequestResponse {}

export const postContinueRequest = createAsyncThunk<
  postContinueRequestResponse, // return type
  { JWSToken: any; interactRef: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/continueRequest", async (args, thunkAPI) => {
  try {
    if (args.JWSToken) {
      const access_token_calculated = await getSHA256Hash(args.JWSToken.continue_access_token);
      const continue_request: ContinueRequest = {
        interact_ref: args.interactRef,
      };
      const alg = "ES256";
      const privateJwk = JSON.parse(localStorage.getItem("privateKey") ?? "");
      const privateKey = await importJWK(privateJwk, alg);

      const jwsHeader = {
        typ: "gnap-binding+jws",
        alg: alg,
        kid: "random_generated_id", // TODO: fix, coupled with publicKey, privateKey
        htm: "POST",
        uri: args.JWSToken.continue_url,
        created: Date.now(),
        ath: access_token_calculated,
      };

      const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(continue_request)))
        .setProtectedHeader(jwsHeader)
        .sign(privateKey);

      const request = {
        method: "POST",
        headers: {
          Authorization: `GNAP ${args.JWSToken.continue_access_token}`,
          "Content-Type": "application/jose+json",
        },
        body: jws,
      };
      const response = await fetch(args.JWSToken.continue_url, { ...request });
      console.log("response", response);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Failed to fetch SCIM data");
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});
