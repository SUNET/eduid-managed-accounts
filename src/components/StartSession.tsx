import { useEffect } from "react";
import { initLocalStorage } from "../initLocalStorage";

// TODO: Gnap TypeScript Client could be used here

const url = "https://api.eduid.docker/auth/transaction";

/**
 * Implement Redirect-based Interaction flow
 *
 * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-redirect-based-interaction
 */
export function StartSession() {
  useEffect(() => {
    initLocalStorage();
  }, []);

  // for debugging/development
  async function redirect() {
    const value = localStorage.getItem("InteractionResponse");
    if (value) {
      try {
        const interactionResponse = JSON.parse(value);

        if (interactionResponse && interactionResponse.interact && interactionResponse.interact.redirect) {
          window.location.href = interactionResponse.interact.redirect;
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    } else {
      console.error("Token is null or undefined");
    }
  }

  return (
    <>
      <h1>Press the button to redirect</h1>
      <button className="btn btn-primary" onClick={redirect}>
        Redirect
      </button>
    </>
  );
}
