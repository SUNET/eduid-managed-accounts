import { redirectURICallback } from "gnap-client-js";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This is a configuration for the client, that configure also the routing in ManagedAccountApp
export const REDIRECT_PATH = "/callback";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function callback() {
      try {
        const response = await redirectURICallback();
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
