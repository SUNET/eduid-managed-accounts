import { useEffect } from "react";
import { jwsRequest, nonce, url } from "../apis/fetchTokenWithJws";
import { useAppDispatch } from "../hooks";

export function Main() {
  console.log("COMPONENT: Main");

  // -
  // const is_loaded = useAppSelector((state) => state.fetchJWSToken.is_loaded);
  // const start_session = useAppSelector(
  //   (state) => state.fetchJWSToken.start_session
  // );
  const dispatch = useAppDispatch();

  // for debugging/development
  function redirect() {
    const token = localStorage.getItem("JWSToken");
    if (token) {
      try {
        const tokenObject = JSON.parse(token);

        if (tokenObject && tokenObject.interact && tokenObject.interact.redirect) {
          // window.location.href = tokenObject.interact.redirect;
          console.log("tokenObject", tokenObject.interact.redirect);
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    } else {
      console.error("Token is null or undefined");
    }

    // if (is_loaded && start_session?.interact.redirect) {
    //   window.location.href = start_session?.interact.redirect;
    // } else {
    //   console.log("fetchJWSToken not has received an answer yet");
    // }
  }
  console.log("hi from Main!");
  useEffect(() => {
    initLocalStorage();
  }, []);

  async function initLocalStorage() {
    const token = localStorage.getItem("JWSToken");
    if (token === null || Object.keys(token).length === 0) {
      try {
        const response = await fetch(url, jwsRequest);
        const response_json = await response.json();
        if (response_json && Object.keys(response_json).length > 0) {
          let now = new Date();
          const expires_in = response_json.interact.expires_in;
          const expires_in_milliseconds = expires_in * 1000;
          const JWSTokenExpires = new Date(now.getTime() + expires_in_milliseconds).getTime();

          localStorage.setItem("JWSToken", JSON.stringify(response_json));
          localStorage.setItem("Nonce", nonce);
          localStorage.setItem("JWSTokenExpires", JWSTokenExpires.toString());
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

  return (
    <>
      <h1>Press the button to redirect</h1>
      {<button onClick={redirect}>Redirect</button>}
      {/* {is_loaded && <button onClick={redirect}>Redirect</button>} */}
    </>
  );
}
// function getTokenFromLocalStorage() {
//   throw new Error("Function not implemented.");
// }
