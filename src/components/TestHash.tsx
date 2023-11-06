import { CompactSign, importJWK } from "jose";
import { useLocation } from "react-router-dom";
import { ContinueRequest } from "services/openapi";

const getSHA256Hash = async (input: string) => {
  const hashBuffer = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64String = btoa(String.fromCharCode(...hashArray));
  const urlSafeBase64 = base64String
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return urlSafeBase64;
};

export default async function TestHash() {
  /**
   * 1 - Test hash in url is the same than hash we calculate
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-calculating-the-interaction
   */
  // Get "finish" and "nonce" from LocalStorage
  const value = localStorage.getItem("JWSToken") || "";
  const JWSToken = JSON.parse(value) ? JSON.parse(value) : {};
  const finish = JWSToken.interact.finish;
  const nonce = localStorage.getItem("Nonce");

  // Get "hash" and "interact_ref" from URL query parameters
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hash_url = params.get("hash");
  const hash_url_without_padding = hash_url?.replace(/=+$/, "");
  const interactRef = params.get("interact_ref") || undefined;

  const url = "https://api.eduid.docker/auth/transaction";
  const hash_base_string = `${nonce}\n${finish}\n${interactRef}\n${url}`;

  const hash_calculated = await getSHA256Hash(hash_base_string);

  const continueRequest = async () => {
    const continue_url = JWSToken.continue.uri;
    const continue_access_token = JWSToken.continue.access_token.value;
    const access_token_calculated = await getSHA256Hash(continue_access_token);

    const continue_request: ContinueRequest = {
      interact_ref: interactRef,
    };
    const alg = "ES256";
    const privateJwk = JSON.parse(localStorage.getItem("privateKey") || "");
    const privateKey = await importJWK(privateJwk, alg);

    let jws_header = {
      typ: "gnap-binding+jws",
      alg: alg,
      kid: "random_generated_id", // fix, coupled with publicKey, privateKey
      htm: "POST",
      uri: continue_url,
      created: Date.now(),
      ath: access_token_calculated,
    };

    const jws = await new CompactSign(
      new TextEncoder().encode(JSON.stringify(continue_request))
    )
      .setProtectedHeader(jws_header)
      .sign(privateKey);

    const config = {
      method: "POST",
      headers: {
        Authorization: `GNAP ${continue_access_token}`,
        "Content-Type": "application/jose+json",
      },
      body: jws,
    };

    const response = await fetch(continue_url, config);
    const resp_json = await response.json();
    console.log("RESPONSE CONTINUE: ", response);
    console.log("RESPONSE CONTINUE JSON: ", resp_json);
  };

  if (hash_calculated === hash_url_without_padding) {
    console.log("hash_calculated === hash_url_without_padding TRUE");
    continueRequest();
  } else {
    // Send an error
  }

  /**
   * 2 -Continue Request Flow
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-continuing-a-grant-request
   *
   * */

  // for debugging/development
  function redirect() {
    window.location.href = window.location.href;
    // if (is_loaded && start_session?.interact.redirect) {
    //   window.location.href = start_session?.interact.redirect;
    // } else {
    //   console.log("fetchJWSToken not has received an answer yet");
    // }
  }

  return (
    <>
      <h1>{hash_base_string}</h1>
      <br></br>
      <h1>Press the button to redirect</h1>
      {/* {is_loaded && <button onClick={redirect}>Redirect</button>} */}
    </>
  );
}
