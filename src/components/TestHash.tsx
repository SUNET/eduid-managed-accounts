import { CompactSign, importJWK } from "jose";
import { useLocation } from "react-router-dom";
import { ContinueRequest } from "services/openapi";

// https://stackoverflow.com/questions/59777670/how-can-i-hash-a-string-with-sha256-in-js
const getSHA256Hash = async (input: string) => {
  // const textAsBuffer = new TextEncoder().encode(input);
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
  console.log("urlSafeBase64", urlSafeBase64);
  // const hash = hashArray
  //   .map((item) => item.toString(16).padStart(2, "0"))
  //   .join("");
  // return hash;
};

export async function TestHash() {
  console.log("COMPONENT: TestHash");
  // Get "finish" and "nonce" from LocalStorage
  const value = localStorage.getItem("JWSToken") || "";
  console.log("VALUE: ", value);
  const JWSToken = JSON.parse(value) ? JSON.parse(value) : {};
  console.log("JWSToken: ", JWSToken);
  const finish = JWSToken.interact.finish;
  const nonce = localStorage.getItem("Nonce");

  // Get "hash" and "interact_ref" from URL query parameters
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hash = params.get("hash");
  console.log("hash from AS ", hash);
  const interactRef = params.get("interact_ref") || undefined;

  // Get other parameters
  // const nonce = useAppSelector((state) => state.fetchJWSToken.nonce);
  // const finish = useAppSelector(
  //   (state) => state.fetchJWSToken.start_session.interact.finish
  // );

  const url = "https://api.eduid.docker/auth/transaction";
  const hash_base_string = `${nonce}\n${finish}\n${interactRef}\n${url}`;

  // test
  const a = "VJLO6A4CATR0KRO";
  const b = "MBDOFXG4Y5CVJCX821LH";
  const c = "4IFWWIKYB2PQ6U56NL1";
  const d = "https://server.example.com/tx";

  const hash_base_string_test = `${a}\n${b}\n${c}\n${d}`;
  console.log("TEST STRING; ", hash_base_string_test);

  const hashed_test = await getSHA256Hash(hash_base_string_test);
  console.log("HASHED TEST", hashed_test);

  // var strBytes = new Uint8Array(hashed_test);
  // console.log("strBytes TEST", strBytes);

  // const btoa_test = btoa(hashed_test);
  // console.log("btoa TEST", btoa_test);

  // const result_test = encodeURIComponent(btoa_test);
  // console.log("Result Encoded TEST", result_test);

  // hash_method (string):
  //  An identifier of a hash calculation mechanism to be used for the callback hash in Section 4.2.3,
  //  as defined in the IANA Named Information Hash Algorithm Registry. If absent, the default value is sha-256
  //
  // BUT
  // sunet-auth-server has implemented after the specs:
  // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-07#section-4.2.3
  // So the default hash algorithm is SHA3_512
  // It is possible to require which algorithm to use from client request. However BE implementation co
  // covers for now SHA512() or SHA3_512()

  /**
   * BE hash calculation:
   *
   * hash_with(hash_alg: HashAlgorithm, data: bytes) -> bytes:
   *  h = hashes.Hash(hash_alg)
   *  h.update(data)
   *  return h.finalize()
   *
   * get_interaction_hash() -> str
   *  hash_alg = get_hash_by_name(hash_name=hash_method.value)
   *  plaintext = f"{client_nonce}\n{as_nonce}\n{interact_ref}\n{transaction_url}".encode()
   *  hash_res = hash_with(hash_alg, plaintext)
   *  return urlsafe_b64encode(hash_res).decode(encoding="utf-8")
   */

  // const x = hash256(hash_base_string);
  // console.log("HASHH: ", x);

  // const result = encodeURIComponent(btoa(x));
  // console.log("hash result Encoded", result);

  // clear LocalStorage
  // window.localStorage.clear();

  /**
   * CONTINUE FLOW
   *
   * */

  const continue_url = JWSToken.continue.uri;
  const continue_access_token = JWSToken.continue.access_token.value;

  const continue_request: ContinueRequest = {
    interact_ref: interactRef,
  };
  console.log("JSON.stringify(): ", JSON.stringify(continue_request));

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
    ath: "ath-test",
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

  const is_loaded = true;
  const start_session = {};

  const response = await fetch(continue_url, config);
  const resp_json = await response.json();
  console.log("RESPONSE CONTINUE: ", response);
  console.log("RESPONSE CONTINUE JSON: ", resp_json);

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
