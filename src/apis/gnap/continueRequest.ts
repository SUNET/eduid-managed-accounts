import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "init-app";
import { CompactSign, importJWK } from "jose";
import { getSHA256Hash } from "../../common/CryptoUtils";
import { ContinueAccessToken, ContinueRequest, SubjectAssertion } from "../../typescript-clients/gnap";

export interface PostContinueRequestResponse {
  access_token: ContinueAccessToken;
  subject: { assertions: Array<SubjectAssertion> };
}

interface InteractionsTypes {
  interact: {
    access_token: {
      value: string;
    };
  };
  continue: {
    access_token: {
      value: string;
    };
    uri: string;
  };
}

export const postContinueRequest = createAsyncThunk<
  PostContinueRequestResponse, // return type
  { interactions: InteractionsTypes; interactRef: string }, // args type
  { dispatch: AppDispatch; state: AppRootState }
>("auth/continueRequest", async (args, thunkAPI) => {
  try {
    if (args.interactions) {
      const access_token_calculated = await getSHA256Hash(args.interactions.continue.access_token.value);
      const continue_request: ContinueRequest = {
        interact_ref: args.interactRef,
      };
      const alg = "ES256";
      const privateJwk = JSON.parse(sessionStorage.getItem("privateKey") ?? "");
      const privateKey = await importJWK(privateJwk, alg);

      const jwsHeader = {
        typ: "gnap-binding+jws",
        alg: alg,
        kid: "random_generated_id", // TODO: fix, coupled with publicKey, privateKey
        htm: "POST",
        uri: args.interactions.continue.uri,
        created: Date.now(),
        ath: access_token_calculated,
      };

      const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(continue_request)))
        .setProtectedHeader(jwsHeader)
        .sign(privateKey);

      const request = {
        method: "POST",
        headers: {
          Authorization: `GNAP ${args.interactions.continue.access_token.value}`,
          "Content-Type": "application/jose+json",
        },
        body: jws,
      };
      const response = await fetch(args.interactions.continue.uri, { ...request });
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
