import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ReduxIntlProvider } from "./common/ReduxIntl.tsx";
import { ManagedAccountApp } from "./components/ManagedAccountsApp.tsx";
import "./index.css";
import { managedAccountsStore } from "./init-app.ts";

// function setTokenFromLocalStorage(token: any) {
//   localStorage.setItem("JWSToken", token);
//   console.log("setTokenFromLocalStorage", token);
// }

// function getTokenFromLocalStorage() {
//   console.log("getTokenFromLocalStorage");
//   return localStorage.getItem("JWSToken");
// }

// async function initLocalStorage() {
//   // let JWSToken = getTokenFromLocalStorage();
//   // save JWSToken and Nonce in LocalStorage
//   const token = getTokenFromLocalStorage();
//   if (!token) {
//     try {
//       const response: any = await managedAccountsStore.dispatch(
//         fetchTokenWithJws()
//       );
//       console.log("RESPONSE: ", response);
//       if (fetchTokenWithJws.fulfilled.match(response)) {
//         managedAccountsStore.dispatch(fetchJWSSlice.actions.appLoaded());
//       }
//       console.log("Save LocalStorage");
//       // save in LocalStorage
//       const response_json = response.payload.response_json;
//       // JWSTokenExpire
//       let now = new Date();
//       const expires_in = response_json.interact.expires_in; // seconds
//       const expires_in_milliseconds = expires_in * 1000; // 10 seconds = 10000 milliseconds
//       const JWSTokenExpires = new Date(
//         now.getTime() + expires_in_milliseconds
//       ).getTime();

//       localStorage.setItem("JWSToken", JSON.stringify(response_json));
//       localStorage.setItem("Nonce", nonce);
//       localStorage.setItem("JWSTokenExpires", JWSTokenExpires.toString());
//     } catch (error) {
//       console.error("error:", error);
//     }
//   } else {
//     console.log("LOCAL STORAGE ALREADY SAVED");
//   }
// }

// async function initAppCompleteFlow() {
//   console.log("App loaded..");
//   let token = getTokenFromLocalStorage();
//   // 1 - Get token from local storage (if previously logged in) or from Gnap
//   if (!token) {
//     console.log("No token in Local Storage");
//     try {
//       const response: any = await managedAccountsStore.dispatch(
//         fetchTokenWithJws()
//       );
//       console.log("RESPONSE: ", response);
//       if (fetchTokenWithJws.fulfilled.match(response)) {
//         managedAccountsStore.dispatch(fetchJWSSlice.actions.appLoaded());

//         // COMMENT: We do not set yet the access token because we need to follow the interact flow
//         // if (response?.payload.response_json.continue.access_token.value) {
//         //   console.log("HERE");
//         //   token = response.payload.response_json.continue.access_token.value;
//         //   setTokenFromLocalStorage(token);
//         //   return token;
//         // }
//       } else {
//         throw new Error("Invalid access token in the response.");
//       }
//     } catch (error) {
//       console.error("error:", error);
//       return null;
//     }
//   } else {
//     console.log("Token found in Local Storage: ", token);
//     // // 2 - Send a request to SCIM with token
//     // const scimResponse = await managedAccountsStore.dispatch(
//     //   fetchScimData(token)
//     // );
//     // // Renew token if expired
//     // if (fetchScimData.rejected.match(scimResponse)) {
//     //   const refreshedToken = await managedAccountsStore.dispatch(
//     //     fetchTokenWithJws()
//     //   );
//     //   if (refreshedToken) {
//     //     setTokenFromLocalStorage(refreshedToken);
//     //   } else {
//     //     return null;
//     //   }
//     // }
//     // return await fetchScimData(token);
//   }
// }

const initDomTarget = document.getElementById("root");

if (initDomTarget) {
  const root = ReactDOM.createRoot(initDomTarget);
  root.render(
    // <React.StrictMode>
    <ReduxIntlProvider store={managedAccountsStore}>
      <BrowserRouter>
        <ManagedAccountApp />
      </BrowserRouter>
    </ReduxIntlProvider>
    // </React.StrictMode>
  );
}
