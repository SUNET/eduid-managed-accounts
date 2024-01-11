import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ReduxIntlProvider } from "./common/ReduxIntl.tsx";
import { ManagedAccountApp } from "./components/ManagedAccountsApp.tsx";
import { managedAccountsStore } from "./init-app.ts";
import configSlice from "./slices/configReducer.ts";
import { setupLanguage } from "./translation/index.tsx";
declare const managed_accounts_config: object | undefined;

/* Get configuration */
const getConfig = function () {
  managedAccountsStore.dispatch(configSlice.actions.fetchConfig(managed_accounts_config));
};

setupLanguage(managedAccountsStore.dispatch);

if (managed_accounts_config === undefined) {
  // TODO: setup production url
} else {
  getConfig();
}

const initDomTarget = document.getElementById("root");

if (initDomTarget) {
  const root = ReactDOM.createRoot(initDomTarget);

  root.render(
    <ReduxIntlProvider store={managedAccountsStore}>
      <BrowserRouter>
        <ManagedAccountApp />
      </BrowserRouter>
    </ReduxIntlProvider>
  );
}
