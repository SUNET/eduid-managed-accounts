import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { postContinueRequest } from "../apis/continueRequest";
import { useAppDispatch } from "../hooks";
import { JWS_TOKEN, NONCE } from "./../initLocalStorage";

export const getSHA256Hash = async (input: string) => {
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64String = btoa(String.fromCharCode(...hashArray));
  const urlSafeBase64 = base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return urlSafeBase64;
};

export default function TestHash() {
  const dispatch = useAppDispatch();

  // Get "JWSToken" from LocalStorage
  const value = localStorage.getItem(JWS_TOKEN) ?? "";
  const JWSToken = JSON.parse(value) ? JSON.parse(value) : {};
  // Get "finish" and "nonce" from LocalStorage
  const finish = JWSToken.interact.finish;
  const nonce = localStorage.getItem(NONCE);

  // Get "hash" and "interact_ref" from URL query parameters
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hash_url = params.get("hash");
  const interactRef = params.get("interact_ref") ?? undefined;

  /**
   * 1 - Test hash in url is the same than hash we calculate
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-calculating-the-interaction
   */
  useEffect(() => {
    async function testHash() {
      try {
        const url = "https://api.eduid.docker/auth/transaction";
        const hash_base_string = `${nonce}\n${finish}\n${interactRef}\n${url}`;
        const hash_calculated = await getSHA256Hash(hash_base_string);
        if (hash_calculated === hash_url) {
          await continueRequest();
        }
      } catch {}
    }
    testHash();
  }, []);

  /**
   * 2 -Continue Request Flow
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-continuing-a-grant-request
   *
   * */
  const continueRequest = async () => {
    if (JWSToken && interactRef) {
      dispatch(postContinueRequest({ JWSToken: JWSToken, interactRef: interactRef }));
    }
  };

  return (
    <>
      <br></br>
      <h1>Press the button to redirect</h1>
      {/* <Link to="/scim" state={{ accessToken: accessToken }}>
        Next Step
      </Link> */}
    </>
  );
}
