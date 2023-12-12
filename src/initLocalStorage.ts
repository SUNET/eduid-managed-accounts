import { CompactSign, GenerateKeyPairOptions, exportJWK, generateKeyPair } from "jose";
import { generateNonce } from "./common/CryptoUtils";
import {
  AccessTokenFlags,
  AccessTokenRequest,
  ECJWK,
  FinishInteractionMethod,
  GrantRequest,
  KeyType,
  ProofMethod,
  StartInteractionMethod,
  SubjectAssertionFormat,
} from "./typescript-clients/gnap";

const url = "https://api.eduid.docker/auth/transaction";
export const INTERACTION_RESPONSE = "InteractionResponse";
export const INTERACTION_EXPIRES = "InteractionExpires";
export const NONCE = "Nonce";
const PRIVATE_KEY = "privateKey";
const PUBLIC_KEY = "publicKey";

export async function initLocalStorage() {
  localStorage.clear();
  const token = localStorage.getItem(INTERACTION_RESPONSE);
  if (token === null || Object.keys(token).length === 0 || token === undefined) {
    try {
      const atr: AccessTokenRequest = {
        // TODO
        access: [{ scope: "eduid.docker", type: "scim-api" }],
        flags: [AccessTokenFlags.BEARER],
      };

      const alg = "ES256";
      const gpo: GenerateKeyPairOptions = {
        crv: "25519",
        extractable: true,
      };
      const { publicKey, privateKey } = await generateKeyPair(alg, gpo);

      const privateJwk = await exportJWK(privateKey);
      const publicJwk = await exportJWK(publicKey);

      const EllipticCurveJSONWebKey: ECJWK = {
        kid: "random_generated_id",
        kty: publicJwk.kty as KeyType,
        crv: publicJwk.crv,
        x: publicJwk.x,
        y: publicJwk.y,
      };

      const nonce = generateNonce(24);

      const gr: GrantRequest = {
        access_token: atr,
        client: { key: { proof: { method: ProofMethod.JWS }, jwk: EllipticCurveJSONWebKey } },
        subject: {
          assertion_formats: [SubjectAssertionFormat.SAML2],
        },
        interact: {
          start: [StartInteractionMethod.REDIRECT],
          finish: {
            method: FinishInteractionMethod.REDIRECT,
            uri: "http://localhost:5173/redirect", // TODO: redirect url, TO BE FIXED
            nonce: nonce, // generate automatically, to be verified with "hash" query parameter from redirect
          },
        },
      };

      const jwsHeader = {
        typ: "gnap-binding+jws",
        alg: alg,
        kid: "random_generated_id", // TODO: fix, coupled with publicKey, privateKey
        htm: "POST",
        uri: url,
        created: Date.now(),
      };

      const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(gr)))
        .setProtectedHeader(jwsHeader)
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

      const responseJson = await response.json();
      if (responseJson && Object.keys(responseJson).length > 0) {
        let now = new Date();
        const expiresIn = responseJson.interact.expires_in;
        const expiresInMilliseconds = expiresIn * 1000;
        const InteractionExpires = new Date(now.getTime() + expiresInMilliseconds).getTime();
        localStorage.setItem(INTERACTION_RESPONSE, JSON.stringify(responseJson));
        localStorage.setItem(NONCE, nonce);
        localStorage.setItem(INTERACTION_EXPIRES, InteractionExpires.toString());
        localStorage.setItem(PRIVATE_KEY, JSON.stringify(privateJwk));
        localStorage.setItem(PUBLIC_KEY, JSON.stringify(publicJwk));
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
