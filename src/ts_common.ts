import file_jwks from './jwks.json'
import {AccessTokenFlags, AccessTokenRequest, GrantRequest } from './services/openapi'
import { JWK, importJWK, CompactSign } from 'jose'

export const url = "https://api.eduid.docker/auth/transaction"

const atr:AccessTokenRequest = {
    access: [{"scope": "eduid.se", "type": "scim-api"}],
    flags: [AccessTokenFlags.BEARER],
  };

  const gr:GrantRequest = {
    access_token: atr,
    client: {key: "eduid_managed_accounts_1"}
  }
    

  const alg = 'ES256'
  const privateKey = await importJWK(file_jwks as JWK, alg);


  let jws_header = {
    "typ": "gnap-binding+jws",
    "alg": alg,
    "kid": "eduid_managed_accounts_1",
    "htm": "POST",
    "uri": url,
    "created": Date.now(),
}


  const jws = await new CompactSign(
    new TextEncoder().encode(JSON.stringify(gr)),
  )
    .setProtectedHeader(jws_header)
    .sign(privateKey)
  
  console.log("JWS ", jws)

  
  // With fetch()

  
  const headers = {
    "Content-Type": "application/jose+json",
  }

  export const request:any = {
      headers: headers,
      body: jws,
      method: "POST",
  };
  console.log("REQUEST ", request)

  let response = await fetch(url, request);
  console.log("RES ", response)



  let responseJson:any = await response.json()
  console.log("JSON ", responseJson)

  let token = responseJson.access_token?.value
  console.log("TOKEN ", token)

  

  // SCIM

  
  export const scimUrl = "https://api.eduid.docker/scim/Groups"

  const scimHeaders = {
    Authorization: "Bearer " + token,

  }

  export const scimRequest:any = {
    headers: scimHeaders,
    method: "GET"
  }

  let scimResponse = await fetch(scimUrl, scimRequest);
  console.log("SCIM ", scimResponse)

