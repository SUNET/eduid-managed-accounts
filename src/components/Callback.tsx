import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postContinueRequest } from "../apis/gnap/continueRequest";
import { getSHA256Hash } from "../common/CryptoUtils";
import { useAppDispatch } from "../hooks";
import { INTERACTION_RESPONSE, NONCE } from "./../initLocalStorage";

export default function Callback() {
  const dispatch = useAppDispatch();

  // Get "InteractionResponse" from LocalStorage
  const value = localStorage.getItem(INTERACTION_RESPONSE) ?? "";
  const interactions = JSON.parse(value) ? JSON.parse(value) : {};
  // Get "finish" and "nonce" from LocalStorage
  const finish = interactions.interact.finish;
  const nonce = localStorage.getItem(NONCE);

  // Get "hash" and "interact_ref" from URL query parameters
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hashURL = params.get("hash");
  const interactRef = params.get("interact_ref") ?? undefined;
  const url = "https://api.eduid.docker/auth/transaction";

  const navigate = useNavigate();

  /**
   * 1 - Test hash in url is the same than hash we calculate
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-calculating-the-interaction
   */
  useEffect(() => {
    async function testHash() {
      try {
        const hashBaseString = `${nonce}\n${finish}\n${interactRef}\n${url}`;
        const hashCalculated = await getSHA256Hash(hashBaseString);
        if (hashCalculated === hashURL) {
          await continueRequest();
        } else navigate("/");
      } catch {
        console.log("error");
      }
    }
    testHash();
  }, []);

  /**
   * 2 -Continue Request Flow
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-continuing-a-grant-request
   *
   * */
  const continueRequest = async () => {
    if (interactions && interactRef) {
      const response = await dispatch(postContinueRequest({ interactions: interactions, interactRef: interactRef }));
      if (postContinueRequest.fulfilled.match(response)) {
        navigate("/scim", {
          state: response.payload,
        });
      }
    }
  };
  return <></>;
}
