import { interactionCallback } from "gnap-client-js";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { TRANSACTION_PATH } from "./StartSession";

// This is a configuration for the client, that configure also the routing in ManagedAccountApp
export const REDIRECT_PATH = "/callback";

export default function Callback() {
  const auth_server_url = useAppSelector((state) => state.config.auth_server_url) ?? null;
  const transactionUrl = auth_server_url + TRANSACTION_PATH;

  const navigate = useNavigate();

  useEffect(() => {
    async function callback() {
      try {
        const response = await interactionCallback(transactionUrl);
        navigate("/manage", {
          state: response,
        });
      } catch (error) {
        console.log("error");
        if (error instanceof Error && error.message === "Invalid hash") {
          navigate("/");
        }
      }
    }
    callback();
  }, []);

  return <React.Fragment> </React.Fragment>;
}
