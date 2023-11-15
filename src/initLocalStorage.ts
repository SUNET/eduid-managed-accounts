import { CompactSign, GenerateKeyPairOptions, exportJWK, importJWK } from "jose";
import { generateNonce } from "./common/CryptoUtils";
import jwk_file from "./jwk.json";
import { AccessTokenFlags, AccessTokenRequest, ECJWK, GrantRequest, KeyType } from "./typescript-clients/gnap";

const url = "https://api.eduid.docker/auth/transaction";
export const INTERACTION_RESPONSE = "InteractionResponse";
export const INTERACTION_EXPIRES = "InteractionExpires";
export const NONCE = "Nonce";
const PRIVATE_KEY = "privateKey";
const PUBLIC_KEY = "publicKey";

export async function initLocalStorage() {
  localStorage.clear();
  const token = localStorage.getItem(INTERACTION_RESPONSE);
  if (token === null || Object.keys(token).length === 0 || token === undefined) {
    try {
      const atr: AccessTokenRequest = {
        access: [{ scope: "eduid.se", type: "scim-api" }],
        flags: [AccessTokenFlags.BEARER],
      };

      const alg = "ES256";
      const gpo: GenerateKeyPairOptions = {
        crv: "25519",
        extractable: true,
      };
      // const { publicKey, privateKey } = await generateKeyPair(alg, gpo);

      // use key i JWK
      const jwk_private = { ...jwk_file, ext: true };
      console.log("JWK FILE + ext:", jwk_private);
      // const jwk_private = {
      //   kty: "EC",
      //   kid: "eduid_managed_accounts_1",
      //   crv: "P-256",
      //   x: "dCxVL9thTTc-ZtiL_CrPpMp1Vqo2p_gUVqiVBRwqjq8",
      //   y: "P3dAvr2IYy7DQEf4vA5bPN8gCg41M1oA5993vHr9peE",
      //   d: "i9hH9BeErxtI40b0_1P4XR6CXra4itKvg8ccLrxXrhQ",
      //   ext: true,
      // };

      const privateKey = await importJWK(jwk_private, alg);
      const publicKey = await importJWK(jwk_private, alg);

      const privateJwk = await exportJWK(privateKey);
      console.log("privateKey", JSON.stringify(privateJwk));
      const publicJwk = await exportJWK(publicKey);

      const EllipticCurveJSONWebKey: ECJWK = {
        kid: "eduid_managed_accounts_1",
        kty: publicJwk.kty as KeyType,
        crv: publicJwk.crv,
        x: publicJwk.x,
        y: publicJwk.y,
      };

      const nonce = generateNonce(24);

      const gr: GrantRequest = {
        access_token: atr,
        client: { key: "eduid_managed_accounts_1" },
        // client: { key: { proof: { method: ProofMethod.JWS }, jwk: EllipticCurveJSONWebKey } },
        // interact: {
        //   start: [StartInteractionMethod.REDIRECT],
        //   finish: {
        //     method: FinishInteractionMethod.REDIRECT,
        //     uri: "http://localhost:5173/redirect", // TODO: redirect url, TO BE FIXED
        //     nonce: nonce, // generate automatically, to be verified with "hash" query parameter from redirect
        //   },
        // },
      };

      const jwsHeader = {
        typ: "gnap-binding+jws",
        alg: alg,
        kid: "eduid_managed_accounts_1", // TODO: fix, coupled with publicKey, privateKey
        htm: "POST",
        uri: url,
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

      const response = await fetch(url, jwsRequest);

      const responseJson = await response.json();
      if (responseJson && Object.keys(responseJson).length > 0) {
        let now = new Date();
        const expiresIn = responseJson.interact.expires_in;
        const expiresInMilliseconds = expiresIn * 1000;
        const InteractionExpires = new Date(now.getTime() + expiresInMilliseconds).getTime();
        localStorage.setItem(INTERACTION_RESPONSE, JSON.stringify(responseJson));
        localStorage.setItem(NONCE, nonce);
        localStorage.setItem(INTERACTION_EXPIRES, InteractionExpires.toString());
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
