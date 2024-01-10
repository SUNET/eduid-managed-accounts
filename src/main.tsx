import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ReduxIntlProvider } from "./common/ReduxIntl.tsx";
import { ManagedAccountApp } from "./components/ManagedAccountsApp.tsx";
import { managedAccountsStore } from "./init-app.ts";
import { setupLanguage } from "./translation/index.tsx";
declare const managed_accounts_config: object | undefined;

setupLanguage(managedAccountsStore.dispatch);

const initDomTarget = document.getElementById("root");

if (managed_accounts_config === undefined) {
  console.log("managed_accounts_config", managed_accounts_config);
}

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
