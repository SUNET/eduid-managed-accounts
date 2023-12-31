import { useEffect } from "react";
import { initLocalStorage, INTERACTION_RESPONSE } from "../initLocalStorage";

/**
 * Implement Redirect-based Interaction flow
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-redirect-based-interaction
 */
export function StartSession(): JSX.Element {
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
    initLocalStorage();
  }, []);

  return (
    <>
      {/* <Splash showChildren={token !== null}> */}
      <h1>Press the button to redirect</h1>
      <button className="btn btn-primary" onClick={redirect}>
        Redirect
      </button>
      {/* </Splash> */}
    </>
  );
}
