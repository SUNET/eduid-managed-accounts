import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postContinueRequest } from "../apis/gnap/continueRequest";
import { getSHA256Hash } from "../common/CryptoUtils";
import { useAppDispatch, useAppSelector } from "../hooks";
import { INTERACTION_RESPONSE, NONCE, RANDOM_GENERATED_KID } from "../initSessionStorage";

export default function Callback() {
  const auth_server_url = useAppSelector((state) => state.config.auth_server_url);
  const dispatch = useAppDispatch();

  // Get "InteractionResponse" from sessionStorage
  const value = sessionStorage.getItem(INTERACTION_RESPONSE) ?? "";
  const interactions = JSON.parse(value) ? JSON.parse(value) : {};
  // Get "finish", "nonce" and "random_generated_kid" from sessionStorage
  const finish = interactions.interact.finish;
  const nonce = sessionStorage.getItem(NONCE);
  const random_generated_kid = sessionStorage.getItem(RANDOM_GENERATED_KID) ?? "";

  // Get "hash" and "interact_ref" from URL query parameters
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hashURL = params.get("hash");
  const interactRef = params.get("interact_ref") ?? undefined;
  const transaction_url = `${auth_server_url}/transaction`;

  const navigate = useNavigate();

  /**
   * 1 - Test hash in url is the same than hash we calculate
   * https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol-16#name-calculating-the-interaction
   */
  useEffect(() => {
    async function testHash() {
      try {
        const hashBaseString = `${nonce}\n${finish}\n${interactRef}\n${transaction_url}`;
        const hashCalculated = await getSHA256Hash(hashBaseString);
        if (hashCalculated === hashURL) {
          await continueRequest();
        } else navigate("/");
      } catch (error) {
        console.error("testHash error", error);
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
      const response = await dispatch(
        postContinueRequest({
          interactions: interactions,
          interactRef: interactRef,
          random_generated_kid: random_generated_kid,
        })
      );
      if (postContinueRequest.fulfilled.match(response)) {
        sessionStorage.clear(); // remove unnecessary data from sessionStorage
        navigate("/manage", {
          state: response.payload,
        });
      }
    }
  };
  return <React.Fragment> </React.Fragment>;
}
