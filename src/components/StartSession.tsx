import {
  CompactSign,
  GenerateKeyPairOptions,
  exportJWK,
  importJWK,
} from "jose";
import { useEffect } from "react";
import { generateNonce } from "../common/CryptoUtils";
import jwk_file from "../jwk.json";
import {
  AccessTokenFlags,
  AccessTokenRequest,
  ECJWK,
  GrantRequest,
  KeyType,
} from "../typescript-clients/gnap";

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

  async function initLocalStorage() {
    // TODO: localStorage.clear();
    const interactionLocalStorage = localStorage.getItem("InteractionResponse");
    if (
      interactionLocalStorage === null ||
      Object.keys(interactionLocalStorage).length === 0 ||
      interactionLocalStorage === undefined
    ) {
      try {
        const atr: AccessTokenRequest = {
          access: [{ scope: "eduid.se", type: "scim-api" }],
          flags: [AccessTokenFlags.BEARER],
        };

        const alg = "ES256";
        const gpo: GenerateKeyPairOptions = {
          crv: "25519",
          extractable: true,
        };
        // const { publicKey, privateKey } = await generateKeyPair(alg, gpo);

        // use key i JWK
        const jwk_private = { ...jwk_file, ext: true };
        console.log("JWK FILE + ext:", jwk_private);

        const privateKey = await importJWK(jwk_private, alg);
        const publicKey = await importJWK(jwk_private, alg);
        console.log("JWK PUBLIC/PRIVATE KEY", JSON.stringify(privateKey));

        const privateJwk = await exportJWK(privateKey);
        console.log("privateKey", JSON.stringify(privateJwk));
        const publicJwk = await exportJWK(publicKey);
        console.log("publicKey", JSON.stringify(publicJwk));

        const kid = "eduid_managed_accounts_1";

        const ecjwk: ECJWK = {
          kid: kid,
          kty: publicJwk.kty as KeyType,
          crv: publicJwk.crv,
          x: publicJwk.x,
          y: publicJwk.y,
        };

        const nonce = generateNonce(24);

        const gr: GrantRequest = {
          access_token: atr,
          client: { key: kid },
          // client: { key: { proof: { method: ProofMethod.JWS }, jwk: ecjwk } },
          // interact: {
          //   start: [StartInteractionMethod.REDIRECT],
          //   finish: {
          //     method: FinishInteractionMethod.REDIRECT,
          //     uri: "http://localhost:5173/callback", // redirect url, TO BE FIXED
          //     nonce: nonce, // generate automatically, to be verified with "hash" query parameter from redirect
          //   },
          // },
        };

        let jws_header = {
          typ: "gnap-binding+jws",
          alg: alg,
          kid: kid, // TODO: couple "kid" with publicKey, privateKey
          htm: "POST",
          uri: url,
          created: Date.now(),
        };

        const jws = await new CompactSign(
          new TextEncoder().encode(JSON.stringify(gr))
        )
          .setProtectedHeader(jws_header)
          .sign(privateKey);

        const headers = {
          "Content-Type": "application/jose+json",
        };

        const interactionRequestConfig = {
          headers: headers,
          body: jws,
          method: "POST",
        };

        const response = await fetch(url, interactionRequestConfig);
        console.log("response:", response);

        const response_json = await response.json();
        // if successful response save in localStorage
        if (response_json && Object.keys(response_json).length > 0) {
          // save InteractionResponse
          localStorage.setItem(
            "InteractionResponse",
            JSON.stringify(response_json)
          );

          // save nonce
          localStorage.setItem("Nonce", nonce);

          // save publicKey and privateKey
          localStorage.setItem("publicKey", JSON.stringify(publicJwk));
          localStorage.setItem("privateKey", JSON.stringify(privateJwk));

          // calculate and store when the response expires
          let now = new Date();
          const expires_in = response_json.interact.expires_in;
          const expires_in_milliseconds = expires_in * 1000;
          const InteractionResponseExpires = new Date(
            now.getTime() + expires_in_milliseconds
          ).getTime();
          localStorage.setItem(
            "InteractionResponseExpires",
            InteractionResponseExpires.toString()
          );
        } else {
          console.error("response_json is empty or null");
        }
      } catch (error) {
        console.error("error:", error);
      }
    } else {
      console.log("LOCAL STORAGE ALREADY SAVED");
    }
  }

  // for debugging/development
  async function redirect() {
    const value = localStorage.getItem("InteractionResponse");
    if (value) {
      try {
        const interactionResponse = JSON.parse(value);

        if (
          interactionResponse &&
          interactionResponse.interact &&
          interactionResponse.interact.redirect
        ) {
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
