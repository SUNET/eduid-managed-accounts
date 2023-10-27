import { createAsyncThunk } from "@reduxjs/toolkit";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { fetchTokenWithJws } from "./apis/fetchTokenWithJws";
import { scimHeaders, scimRequest, scimUrl } from "./apis/scim.ts";
import { ReduxIntlProvider } from "./common/ReduxIntl.tsx";
import { ManagedAccountApp } from "./components/ManagedAccountsApp.tsx";
import "./index.css";
import { managedAccountsStore } from "./init-app.ts";
import fetchJWSSlice from "./slices/fetchJWS.ts";

function setTokenFromLocalStorage(token: any) {
  localStorage.setItem("JWSToken", token);
}

function getTokenFromLocalStorage() {
  return localStorage.getItem("JWSToken");
}

async function initApp() {
  console.log("App loaded..");
  let token = getTokenFromLocalStorage();
  if (!token) {
    try {
      const response: any = await managedAccountsStore.dispatch(
        fetchTokenWithJws()
      );
      if (fetchTokenWithJws.fulfilled.match(response)) {
        managedAccountsStore.dispatch(fetchJWSSlice.actions.appLoaded());
      }
      if (response?.access_token?.value) {
        token = response.access_token.value;
        setTokenFromLocalStorage(token);
        const scimResponse = await managedAccountsStore.dispatch(
          fetchScimData(token)
        );
        if (fetchScimData.rejected.match(scimResponse)) {
          const refreshedToken = await managedAccountsStore.dispatch(
            fetchTokenWithJws()
          );
          if (refreshedToken) {
            setTokenFromLocalStorage(refreshedToken);
          } else {
            return null;
          }
        }
        return token;
      } else {
        throw new Error("Invalid access token in the response.");
      }
    } catch (error) {
      console.error("error:", error);
      return null;
    }
  } else return await fetchScimData(token);
}

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

const initDomTarget = document.getElementById("root");

if (initDomTarget) {
  const root = ReactDOM.createRoot(initDomTarget);
  root.render(
    <React.StrictMode>
      <ReduxIntlProvider store={managedAccountsStore}>
        <BrowserRouter>
          <ManagedAccountApp />
        </BrowserRouter>
      </ReduxIntlProvider>
    </React.StrictMode>
  );
  initApp();
}
