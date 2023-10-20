import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

//@ts-ignore
//import { GnapClient } from './gnapclient.js'
import jwks from './jwks.json'
import {AccessTokenFlags, AccessTokenRequest, DefaultService, GrantRequest } from './services/openapi'
import { JWK, importJWK, CompactSign } from 'jose'


async function App() {
  const [count, setCount] = useState(0)

  // {"access_token": [
  //  {"flags": ["bearer"], 
  // "access": [{"scope": "eduid.se", "type": "scim-api"}]}], 
  // "client": {"key": {"proof": {"method": "test"}}}}'  https://auth-test.sunet.se/transaction

  const atr:AccessTokenRequest = {
    access: [{"scope": "eduid.se", "type": "scim-api"}],
    flags: [AccessTokenFlags.BEARER],
  };

  const gr:GrantRequest = {
    access_token: atr,
    client: {key: "eduid_managed_accounts_1"}
  }
  console.log("")


  // JWSd
  
  //const parsedData = JSON.parse(jwks.toString());
  // console.log(parsedData)

  const parsedData:JWK = {
    "kty": "EC",
    "kid": "eduid_managed_accounts_1",
    "crv": "P-256",
    "x": "dCxVL9thTTc-ZtiL_CrPpMp1Vqo2p_gUVqiVBRwqjq8",
    "y": "P3dAvr2IYy7DQEf4vA5bPN8gCg41M1oA5993vHr9peE",
    "d": "i9hH9BeErxtI40b0_1P4XR6CXra4itKvg8ccLrxXrhQ"
    }
    

  const alg = 'ES256'
  //console.log(jwks)
  //console.log(typeof jwks)
  //const jwk = jwks["keys"][0]

  // const privateKey = await jose.importJWK(parsedData)
  const privateKey = await importJWK(parsedData, alg)


  let jws_header = {
    "typ": "gnap-binding+jwsd",
    "alg": alg,
    "kid": "eduid_managed_accounts_1",
    "htm": "POST",
    "uri": "https://auth-test.sunet.se/transaction",
    "created": Date.now(),
}


  const jws = await new CompactSign(
    new TextEncoder().encode(JSON.stringify(gr)),
  )
    .setProtectedHeader(jws_header)
    .sign(privateKey)
  
  console.log("JWS ", jws)

  // jws detached
  // const jwsd = jws.replace(/^\.+|\.+$/g, '');

  const splitString = jws.split(".");

  const clientHeader = splitString[0]+".."+splitString[2]

  console.log("JWSD ", clientHeader)


  // let res = DefaultService.transactionTransactionPost(gr, undefined, clientHeader)
  // console.log(res)


  const url = "https://auth-test.sunet.se/transaction"
  
  const headers = {
    'detached-jws': clientHeader,
    'Content-Type': "application/json",
  
  }

  const request: RequestInit = {
      headers: headers,
      body: JSON.stringify(gr),
      method: "POST",
      // signal: controller.signal,
      mode: "no-cors"
  };

  let response = await fetch(url, request);
  console.log("RES ", response)


  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
