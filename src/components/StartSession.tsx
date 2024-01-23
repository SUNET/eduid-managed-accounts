import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useAppDispatch, useAppSelector } from "../hooks";
import { INTERACTION_RESPONSE, initLocalStorage } from "../initLocalStorage";
import getGroupsSlice from "../slices/getGroups";
import getPersonalDataSlice from "../slices/getLoggedInUserInfo";
import getUsersSlice from "../slices/getUsers";

/**
 * Implement Redirect-based Interaction flow
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-redirect-based-interaction
 */
export function StartSession(): JSX.Element {
  const auth_server_url = useAppSelector((state) => state.config.auth_server_url);
  const redirect_url = useAppSelector((state) => state.config.redirect_url);
  const transaction_url = `${auth_server_url}/transaction`;
  const dispatch = useAppDispatch();
  // for debugging/development
  localStorage.clear();

  async function redirect() {
    const token = localStorage.getItem(INTERACTION_RESPONSE);
    if (token) {
      try {
        const tokenObject = JSON.parse(token);

        if (tokenObject?.interact?.redirect) {
          window.location.href = tokenObject.interact.redirect;
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    } else {
      console.error("Token is null or undefined");
    }
  }

  useEffect(() => {
    if (transaction_url !== undefined && redirect_url !== undefined) {
      initLocalStorage(transaction_url, redirect_url);
    }
    dispatch(getUsersSlice.actions.initialize());
    dispatch(getGroupsSlice.actions.initialize());
    dispatch(getPersonalDataSlice.actions.initialize());
  }, []);

  return (
    <>
      {/* <Splash showChildren={token !== null}> */}
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
          defaultMessage="Continue by pressing the link below to log in at your appropriate service, after which you will automatically be
        redirected back to this service, to start managing your account."
          id="landing-paragraph-2"
        />
      </p>
      <div className="buttons">
        <button className="btn btn-link" onClick={redirect}>
          <FormattedMessage defaultMessage="Go to login service" id="landing-link" />
        </button>
      </div>
      <div className="text-small">
        <em>
          <FormattedMessage
            defaultMessage="Det här är en produktutveckling av eduID som ett led i Sunets regeringsuppdrag att bistå Skolverket kring digital identitet för nationella prov och bedömningsstöd, genom att erbjuda skolhuvudmän som har behov en inloggningstjänst (IdP) eller e-legitimation."
            id="landing-info"
          />
        </em>
      </div>
      {/* </Splash> */}
    </>
  );
}
