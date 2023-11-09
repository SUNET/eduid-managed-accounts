export function Main() {
  // for debugging/development
  async function redirect() {
    const token = localStorage.getItem("JWSToken");
    if (token) {
      try {
        const tokenObject = JSON.parse(token);

        if (tokenObject && tokenObject.interact && tokenObject.interact.redirect) {
          window.location.href = tokenObject.interact.redirect;
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    } else {
      console.error("Token is null or undefined");
    }
  }

  // useEffect(() => {
  //   initLocalStorage();
  // }, []);

  // async function initLocalStorage() {
  //   // localStorage.clear();
  //   const token = localStorage.getItem("JWSToken");
  //   if (token === null || Object.keys(token).length === 0 || token === undefined) {
  //     try {
  //       const atr: AccessTokenRequest = {
  //         access: [{ scope: "eduid.se", type: "scim-api" }],
  //         flags: [AccessTokenFlags.BEARER],
  //       };

  //       const alg = "ES256";
  //       const gpo: GenerateKeyPairOptions = {
  //         crv: "25519",
  //         extractable: true,
  //       };
  //       // const { publicKey, privateKey } = await generateKeyPair(alg, gpo);

  //       // use key i JWK
  //       const jwk_private = { ...jwk_file, ext: true };
  //       console.log("JWK FILE + ext:", jwk_private);
  //       // const jwk_private = {
  //       //   kty: "EC",
  //       //   kid: "eduid_managed_accounts_1",
  //       //   crv: "P-256",
  //       //   x: "dCxVL9thTTc-ZtiL_CrPpMp1Vqo2p_gUVqiVBRwqjq8",
  //       //   y: "P3dAvr2IYy7DQEf4vA5bPN8gCg41M1oA5993vHr9peE",
  //       //   d: "i9hH9BeErxtI40b0_1P4XR6CXra4itKvg8ccLrxXrhQ",
  //       //   ext: true,
  //       // };

  //       const privateKey = await importJWK(jwk_private, alg);
  //       const publicKey = await importJWK(jwk_private, alg);
  //       console.log("JWK PUBLIC/PRIVATE KEY", JSON.stringify(privateKey));

  //       const privateJwk = await exportJWK(privateKey);
  //       localStorage.setItem("privateKey", JSON.stringify(privateJwk));
  //       console.log("privateKey", JSON.stringify(privateJwk));
  //       const publicJwk = await exportJWK(publicKey);
  //       localStorage.setItem("publicKey", JSON.stringify(publicJwk));
  //       console.log("publicKey", JSON.stringify(publicJwk));

  //       const ecjwk: ECJWK = {
  //         kid: "eduid_managed_accounts_1",
  //         kty: publicJwk.kty as KeyType,
  //         crv: publicJwk.crv,
  //         x: publicJwk.x,
  //         y: publicJwk.y,
  //       };

  //       const nonce = generateNonce(24);

  //       const gr: GrantRequest = {
  //         access_token: atr,
  //         client: { key: "eduid_managed_accounts_1" },
  //         // client: { key: { proof: { method: ProofMethod.JWS }, jwk: ecjwk } },
  //         // interact: {
  //         //   start: [StartInteractionMethod.REDIRECT],
  //         //   finish: {
  //         //     method: FinishInteractionMethod.REDIRECT,
  //         //     uri: "http://localhost:5173/redirect", // redirect url, TO BE FIXED
  //         //     nonce: nonce, // generate automatically, to be verified with "hash" query parameter from redirect
  //         //   },
  //         // },
  //       };

  //       let jws_header = {
  //         typ: "gnap-binding+jws",
  //         alg: alg,
  //         kid: "eduid_managed_accounts_1", // fix, coupled with publicKey, privateKey
  //         htm: "POST",
  //         uri: url,
  //         created: Date.now(),
  //       };

  //       const jws = await new CompactSign(new TextEncoder().encode(JSON.stringify(gr)))
  //         .setProtectedHeader(jws_header)
  //         .sign(privateKey);

  //       const headers = {
  //         "Content-Type": "application/jose+json",
  //       };

  //       const jwsRequest = {
  //         headers: headers,
  //         body: jws,
  //         method: "POST",
  //       };

  //       const response = await fetch(url, jwsRequest);
  //       console.log("response:", response);

  //       const response_json = await response.json();
  //       if (response_json && Object.keys(response_json).length > 0) {
  //         let now = new Date();
  //         const expires_in = response_json.interact.expires_in;
  //         const expires_in_milliseconds = expires_in * 1000;
  //         const JWSTokenExpires = new Date(now.getTime() + expires_in_milliseconds).getTime();

  //         localStorage.setItem("JWSToken", JSON.stringify(response_json));
  //         localStorage.setItem("Nonce", nonce);
  //         localStorage.setItem("JWSTokenExpires", JWSTokenExpires.toString());
  //       } else {
  //         console.error("response_json is empty or null");
  //       }
  //     } catch (error) {
  //       console.error("error:", error);
  //     }
  //   } else {
  //     console.log("LOCAL STORAGE ALREADY SAVED");
  //   }
  // }

  return (
    <>
      <h1>Press the button to redirect</h1>
      <button className="btn btn-primary" onClick={redirect}>
        Redirect
      </button>
    </>
  );
}
