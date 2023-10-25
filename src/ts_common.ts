import { CompactSign, JWK, importJWK } from "jose";
import file_jwks from "./jwks.json";
import { AccessTokenFlags, AccessTokenRequest, GrantRequest } from "./services/openapi";

export const url = "https://api.eduid.docker/auth/transaction";
export const scimUrl = "https://api.eduid.docker/scim/Groups";

const atr: AccessTokenRequest = {
  access: [{ "scope": "eduid.se", "type": "scim-api" }],
  flags: [AccessTokenFlags.BEARER],
};

const gr: GrantRequest = {
  access_token: atr,
  client: { key: "eduid_managed_accounts_1" },
};

const alg = "ES256";
const privateKey = await importJWK(file_jwks as JWK, alg);

let jws_header = {
  "typ": "gnap-binding+jws",
  "alg": alg,
  "kid": "eduid_managed_accounts_1",
  "htm": "POST",
  "uri": url,
  "created": Date.now(),
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
