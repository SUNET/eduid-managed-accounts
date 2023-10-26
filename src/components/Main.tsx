import { useEffect } from "react";
import { useAppSelector } from "../hooks";

export function Main() {
  const is_loaded = useAppSelector((state) => state.fetchJWSToken.is_loaded);
  const start_session = useAppSelector(
    (state) => state.fetchJWSToken.start_session
  );

  useEffect(() => {
    if (start_session?.interact.redirect) {
      window.location.href = start_session?.interact.redirect;
    }
  }, [is_loaded]);
  return <h1>hello world</h1>;
}
