import React from "react";
import ReactDOM from "react-dom/client";
import { ReduxIntlProvider } from "./common/ReduxIntl.tsx";
import ManagedAccountApp from "./components/ManagedAccountsApp.tsx";
import "./index.css";
import { managedAccountsStore } from "./init-app.ts";
import { jwsRequest, scimHeaders, scimRequest, scimUrl, url } from "./ts_common.ts";

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
      const response = await fetchTokenWithJws();
      if (response?.access_token?.value) {
        token = response.access_token.value;
        setTokenFromLocalStorage(token);
        const scimResponse = await fetchScimData(token);
        if (scimResponse.status === 401) {
          const refreshedToken = await fetchTokenWithJws();
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

async function fetchTokenWithJws() {
  const response = await fetch(url, jwsRequest);
  if (response instanceof Error) {
    throw response;
  }
  return await response.json();
}

async function fetchScimData(token: any) {
  const headers = scimHeaders(token);
  const scimResponse = await fetch(scimUrl, { ...scimRequest, headers });
  if (scimResponse instanceof Error) {
    throw scimResponse;
  }
  return await scimResponse.json();
}

const initDomTarget = document.getElementById("root");

if (initDomTarget) {
  const root = ReactDOM.createRoot(initDomTarget);
  root.render(
    <React.StrictMode>
      <ReduxIntlProvider store={managedAccountsStore}>
        <ManagedAccountApp />
      </ReduxIntlProvider>
    </React.StrictMode>
  );
  initApp();
}
