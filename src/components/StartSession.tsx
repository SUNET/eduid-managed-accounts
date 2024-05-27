import { Access, ProofMethod, redirectURIStart } from "gnap-client-js";
import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useAppDispatch, useAppSelector } from "../hooks";
import appSlice from "../slices/appReducers";
import getGroupsSlice from "../slices/getGroups";
import getPersonalDataSlice from "../slices/getLoggedInUserInfo";
import getUsersSlice from "../slices/getUsers";
import { REDIRECT_PATH } from "./Callback";

// This is a configuration for the client
export const TRANSACTION_PATH = "/transaction";

/**
 * Implement Redirect-based Interaction flow
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-redirect-based-interaction
 */
export function StartSession(): JSX.Element {
  const dispatch = useAppDispatch();
  const auth_server_url = useAppSelector((state) => state.config.auth_server_url);
  const ma_website_url = useAppSelector((state) => state.config.ma_website_url);
  const redirectUrl = ma_website_url + REDIRECT_PATH;
  const transactionUrl = auth_server_url + TRANSACTION_PATH;

  useEffect(() => {
    const initializeStore = () => {
      dispatch(getUsersSlice.actions.initialize());
      dispatch(getGroupsSlice.actions.initialize());
      dispatch(getPersonalDataSlice.actions.initialize());
      dispatch(appSlice.actions.initialize());
    };
    initializeStore();
  }, []);

  async function loginRedirect() {
    try {
      // config for which scopes request access
      const accessArray: Array<string | Access> = [{ type: "scim-api" }, { type: "maccapi" }];
      await redirectURIStart(redirectUrl, accessArray, transactionUrl, ProofMethod.JWSD);
    } catch (error) {
      console.error("error:", error);
    }
  }

  return (
    <React.Fragment>
      <h1>
        <FormattedMessage defaultMessage="Welcome to Managed Accounts with eduID" id="landing-header" />
      </h1>
      <p>
        <FormattedMessage
          defaultMessage="To manage your organisation you first need to log in."
          id="landing-paragraph-1"
        />
      </p>
      <p>
        <FormattedMessage
          defaultMessage={`Continue by pressing the link below to log in at your appropriate service, after which you 
            will automatically be redirected back to this service, to start managing your account.`}
          id="landing-paragraph-2"
        />
      </p>
      <div className="buttons">
        <button className="btn btn-link" onClick={loginRedirect}>
          <FormattedMessage defaultMessage="Go to login service" id="landing-link" />
        </button>
      </div>
      <hr className="border-line trim" />
      <div className="text-small">
        <em>
          <FormattedMessage
            defaultMessage={`This is a product development of eduID as part of Sunet's government assignment to assist 
              Skolverket with digital identity regarding the digital national exam and assessment support, by offering 
              school principals in need thereof an IdP or e-identity.`}
            id="landing-info"
          />
        </em>
      </div>
    </React.Fragment>
  );
}
