import { generateNonce } from "./CryptoUtils";

/**
 * eppn: ma-abcd1234
 */
export function fakeEPPN() {
  const eppn: string = "ma-" + generateNonce(8);
  return eppn;
}

/**
 * lösenord: a1b2 c3d4 e5g6
 */
export function fakePassword() {
  let password = `${generateNonce(4) + " " + generateNonce(4) + " " + generateNonce(4)}`;
  return password;
}
