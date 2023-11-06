import { CompactSign, GenerateKeyPairOptions, exportJWK, generateKeyPair } from "jose";
import { useEffect } from "react";
import { generateNonce } from "../common/CryptoUtils";
import {
  AccessTokenFlags,
  AccessTokenRequest,
  ECJWK,
  FinishInteractionMethod,
  GrantRequest,
  KeyType,
  ProofMethod,
  StartInteractionMethod,
} from "../services/openapi";

const url = "https://api.eduid.docker/auth/transaction";

export function Main() {
  // for debugging/development
  async function redirect() {
    const token = localStorage.getItem("JWSToken");
    if (token) {
      try {
        const tokenObject = JSON.parse(token);

        if (tokenObject && tokenObject.interact && tokenObject.interact.redirect) {
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

  async function initLocalStorage() {
    const token = localStorage.getItem("JWSToken");
    if (token === null || Object.keys(token).length === 0) {
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
        const { publicKey, privateKey } = await generateKeyPair(alg, gpo);

        const privateJwk = await exportJWK(privateKey);
        localStorage.setItem("[privateKey", JSON.stringify(privateJwk));
        console.log("[privateKey", JSON.stringify(privateJwk));
        const publicJwk = await exportJWK(publicKey);
        localStorage.setItem("[publicKey", JSON.stringify(publicJwk));
        console.log("[publicKey", JSON.stringify(publicJwk));

        const ecjwk: ECJWK = {
          kid: "random_generated_id",
          kty: publicJwk.kty as KeyType,
          crv: publicJwk.crv,
          x: publicJwk.x,
          y: publicJwk.y,
        };

        const nonce = generateNonce(24);

        const gr: GrantRequest = {
          access_token: atr,
          client: { key: { proof: { method: ProofMethod.JWS }, jwk: ecjwk } },
          interact: {
            start: [StartInteractionMethod.REDIRECT],
            finish: {
              method: FinishInteractionMethod.REDIRECT,
              uri: "http://localhost:5173/hash", // redirect url, TO BE FIXED
              nonce: nonce, // generate automatically, to be verified with "hash" query parameter from redirect
            },
          },
        };

        let jws_header = {
          typ: "gnap-binding+jws",
          alg: alg,
          kid: "random_generated_id", // fix, coupled with publicKey, privateKey
          htm: "POST",
          uri: url,
          created: Date.now(),
        };

        const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(gr)))
          .setProtectedHeader(jws_header)
          .sign(privateKey);

        const headers = {
          "Content-Type": "application/jose+json",
        };

        const jwsRequest = {
          headers: headers,
          body: jws,
          method: "POST",
        };

        const response = await fetch(url, jwsRequest);
        const response_json = await response.json();
        if (response_json && Object.keys(response_json).length > 0) {
          let now = new Date();
          const expires_in = response_json.interact.expires_in;
          const expires_in_milliseconds = expires_in * 1000;
          const JWSTokenExpires = new Date(now.getTime() + expires_in_milliseconds).getTime();

          localStorage.setItem("JWSToken", JSON.stringify(response_json));
          localStorage.setItem("Nonce", nonce);
          localStorage.setItem("JWSTokenExpires", JWSTokenExpires.toString());
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

  return (
    <>
      <h1>Press the button to redirect</h1>
      {<button onClick={redirect}>Redirect</button>}
    </>
  );
}
