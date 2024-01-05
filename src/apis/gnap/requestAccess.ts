import { CompactSign, JWK } from "jose";
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
} from "../../typescript-clients/gnap";

export async function requestAccess(alg: string, publicJwk: JWK, privateKey: JWK, nonce: string) {
  const TRANSACTION_URL = "https://api.eduid.docker/auth/transaction";
  const REDIRECT_URL = "http://localhost:5173/callback";

  const atr: AccessTokenRequest = {
    access: [{ scope: "eduid.docker", type: "scim-api" }],
    flags: [AccessTokenFlags.BEARER],
  };

  const EllipticCurveJSONWebKey: ECJWK = {
    kid: "random_generated_id",
    kty: publicJwk.kty as KeyType,
    crv: publicJwk.crv,
    x: publicJwk.x,
    y: publicJwk.y,
  };

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
        uri: REDIRECT_URL,
        nonce: nonce, // generate automatically, to be verified with "hash" query parameter from redirect
      },
    },
  };

  const jwsHeader = {
    typ: "gnap-binding+jws",
    alg: alg,
    kid: "random_generated_id", // TODO: fix, coupled with publicKey, privateKey
    htm: "POST",
    uri: TRANSACTION_URL,
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

  const response = await fetch(TRANSACTION_URL, jwsRequest);

  const responseJson = await response.json();
  return responseJson;
}
