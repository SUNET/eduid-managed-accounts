export const INTERACTION_RESPONSE = "InteractionResponse";
const INTERACTION_EXPIRATION_TIME = "InteractionExpirationTime";
export const NONCE = "Nonce";
const PRIVATE_KEY = "privateKey";
const PUBLIC_KEY = "publicKey";

export function initLocalStorage(response: any, nonce: string, publicJwk: any, privateJwk: any) {
  localStorage.clear();
  try {
    let now = new Date();
    const expiresIn = response.interact.expires_in; // The number of seconds in which the access will expire
    const expiresInMilliseconds = expiresIn * 1000;
    const InteractionExpirationTime = new Date(now.getTime() + expiresInMilliseconds).getTime();
    localStorage.setItem(INTERACTION_RESPONSE, JSON.stringify(response));
    localStorage.setItem(NONCE, nonce);
    localStorage.setItem(INTERACTION_EXPIRATION_TIME, InteractionExpirationTime.toString());
    localStorage.setItem(PUBLIC_KEY, JSON.stringify(publicJwk));
    localStorage.setItem(PRIVATE_KEY, JSON.stringify(privateJwk));
  } catch (error) {
    console.error("error:", error);
  }
}
