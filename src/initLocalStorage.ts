import { GenerateKeyPairOptions, exportJWK, generateKeyPair } from "jose";
import { requestAccess } from "./apis/gnap/requestAccess";
import { generateNonce } from "./common/CryptoUtils";

export const INTERACTION_RESPONSE = "InteractionResponse";
const INTERACTION_EXPIRATION_TIME = "InteractionExpirationTime";
export const NONCE = "Nonce";
const PRIVATE_KEY = "privateKey";
const PUBLIC_KEY = "publicKey";

export async function initLocalStorage() {
  localStorage.clear();
  const token = localStorage.getItem(INTERACTION_RESPONSE);
  if (token === null || Object.keys(token).length === 0 || token === undefined) {
    try {
      // configure request, generate key pair, generate nonce, and store in local storage
      const alg = "ES256";
      const gpo: GenerateKeyPairOptions = {
        crv: "25519",
        extractable: true,
      };
      const { publicKey, privateKey } = await generateKeyPair(alg, gpo);
      const privateJwk = await exportJWK(privateKey);
      const publicJwk = await exportJWK(publicKey);

      const nonce = generateNonce(24);

      // here Access Request
      const responseJson = await requestAccess(alg, publicJwk, privateKey, nonce);
      if (responseJson && Object.keys(responseJson).length > 0) {
        let now = new Date();
        const expiresIn = responseJson.interact.expires_in; // The number of seconds in which the access will expire
        const expiresInMilliseconds = expiresIn * 1000;
        const InteractionExpirationTime = new Date(now.getTime() + expiresInMilliseconds).getTime();
        localStorage.setItem(INTERACTION_RESPONSE, JSON.stringify(responseJson));
        localStorage.setItem(NONCE, nonce);
        localStorage.setItem(INTERACTION_EXPIRATION_TIME, InteractionExpirationTime.toString());
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
