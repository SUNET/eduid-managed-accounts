import { useLocation } from "react-router-dom";
import { url } from "../apis/fetchTokenWithJws";
import { useAppSelector } from "../hooks";

async function sha256(hash_base_string: string) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(hash_base_string);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  //return hashHex;

  return encodeURIComponent(btoa(hashHex));
}

function hash256(string: string) {
  const utf8 = new TextEncoder().encode(string);
  return crypto.subtle.digest("SHA-256", utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  });
}

export function TestHash() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hash = params.get("hash");
  console.log("hash from AS ", hash);

  const nonce = useAppSelector((state) => state.fetchJWSToken.nonce);
  const finish = useAppSelector(
    (state) => state.fetchJWSToken.start_session.interact.finish
  );
  const interactRef = params.get("interact_ref");

  const hash_base_string = `${nonce}\n${finish}\n${interactRef}\n${url}`;

  // hash_method (string):
  //  An identifier of a hash calculation mechanism to be used for the callback hash in Section 4.2.3,
  //  as defined in the IANA Named Information Hash Algorithm Registry. If absent, the default value is sha-256

  // const result = sha256(hash_base_string);
  const hh = hash256(hash_base_string);
  const result = encodeURIComponent(btoa(hh));
  console.log("hash result ", result);

  // const calculated_hash = hash_base_string;

  return <h1>{hash_base_string}</h1>;
}
