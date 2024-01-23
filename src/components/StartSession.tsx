import { GenerateKeyPairOptions, exportJWK, generateKeyPair } from "jose";
import { FormattedMessage } from "react-intl";
import { requestAccess } from "../apis/gnap/requestAccess";
import { generateNonce } from "../common/CryptoUtils";
import { useAppDispatch, useAppSelector } from "../hooks";
import { initLocalStorage } from "../initLocalStorage";
import appSlice from "../slices/appReducers";
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

  // TODO Inizialize store here?
  const dispatch = useAppDispatch();
  dispatch(getUsersSlice.actions.initialize());
  dispatch(getGroupsSlice.actions.initialize());
  dispatch(getPersonalDataSlice.actions.initialize());
  dispatch(appSlice.actions.initialize());

  async function redirect() {
    if (transaction_url && redirect_url) {
      try {
        // configure request, generate key pair, generate nonce
        const alg = "ES256";
        const gpo: GenerateKeyPairOptions = {
          crv: "25519",
          extractable: true,
        };
        const { publicKey, privateKey } = await generateKeyPair(alg, gpo);
        const privateJwk = await exportJWK(privateKey);
        const publicJwk = await exportJWK(publicKey);

        const nonce = generateNonce(24);

        const response = await requestAccess(alg, publicJwk, privateKey, nonce, transaction_url, redirect_url);

        if (response && Object.keys(response).length > 0) {
          // Save in local storage and redirect
          initLocalStorage(response, nonce, publicJwk, privateJwk);
          window.location.href = response.interact.redirect;
        }
      } catch (error) {
        console.error("error:", error);
      }
    }
  }

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
      {/* </Splash> */}
    </>
  );
}
