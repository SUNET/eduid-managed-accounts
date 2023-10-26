import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function Hash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "hash") {
    }
  });

  return <h1>hello world</h1>;
}
