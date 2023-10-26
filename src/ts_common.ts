import { CompactSign, exportJWK, generateKeyPair } from "jose";
import {
  AccessTokenFlags,
  AccessTokenRequest,
  ECJWK,
  FinishInteractionMethod,
  GrantRequest,
  KeyType,
  ProofMethod,
  StartInteractionMethod,
} from "./services/openapi";

export const url = "https://api.eduid.docker/auth/transaction";
export const scimUrl = "https://api.eduid.docker/scim/Groups";

const atr: AccessTokenRequest = {
  access: [{ scope: "eduid.se", type: "scim-api" }],
  flags: [AccessTokenFlags.BEARER],
};

const alg = "ES256";
const { publicKey, privateKey } = await generateKeyPair(alg);
console.log("PUBLIC KEY ", publicKey);
console.log("PRIV KEY ", privateKey);

const publicJwk = await exportJWK(publicKey);
console.log("publicJwk ", publicJwk);

//const ecjwk:ECJWK = {...publicJwk, kid: "random_generated_id"}
const ecjwk: ECJWK = {
  kid: "random_generated_id",
  kty: publicJwk.kty as KeyType,
  crv: publicJwk.crv,
  x: publicJwk.x,
  y: publicJwk.y,
};

const gr: GrantRequest = {
  access_token: atr,
  client: { key: { proof: { method: ProofMethod.JWS }, jwk: ecjwk } },
  interact: {
    start: [StartInteractionMethod.REDIRECT],
    finish: {
      method: FinishInteractionMethod.REDIRECT,
      uri: "http://localhost:5173/hash", // redirect
      nonce: "random_nonce", // generate automatically, to be verified with "hash" query parameter from redirect
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

export const jwsRequest: any = {
  headers: headers,
  body: jws,
  method: "POST",
};

export const scimHeaders = (token: string) => {
  return {
    Authorization: "Bearer " + token,
  };
};

export const scimRequest: any = {
  headers: scimHeaders,
  method: "GET",
};
