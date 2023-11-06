import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ReduxIntlProvider } from "./common/ReduxIntl.tsx";
import { ManagedAccountApp } from "./components/ManagedAccountsApp.tsx";
import "./index.css";
import { managedAccountsStore } from "./init-app.ts";

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
