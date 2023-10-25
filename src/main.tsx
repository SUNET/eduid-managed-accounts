import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReduxIntlProvider } from './common/ReduxIntl.tsx';
import ManagedAccountApp from './components/ManagedAccountsApp.tsx';
import './index.css';
import { managedAccountsStore } from './init-app.ts';
import { jwsRequest, url } from './ts_common.ts';

function setTokenFromLocalStorage(token:any) {
  localStorage.setItem('JWSToken', token);
}

function getTokenFromLocalStorage() {
  return localStorage.getItem('JWSToken');
}

async function getToken() {
  console.log("App loaded..")
  let token = getTokenFromLocalStorage();
  if (!token) {
    try {
      let response = await fetch(url, jwsRequest);
      if (response.status === 401) {
        const refreshedToken = await fetch(url, jwsRequest);
  
        if (refreshedToken) {
          setTokenFromLocalStorage(refreshedToken); 
        } else {
          return null;
        }
      } else if (response instanceof Error) {
        throw response;
      } else {
        const result = await response.json();
        token = result?.access_token?.value;
        if (token) {
          setTokenFromLocalStorage(token);
        }
      }
    } catch (error) {
      console.error('error:', error);
      return null;
    }
  }
  return token;
};

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
  getToken(); 
}
