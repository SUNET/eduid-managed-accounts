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
    // let JWSToken = getTokenFromLocalStorage();
    // save JWSToken and Nonce in LocalStorage
    const token = localStorage.getItem("JWSToken");
    if (!token) {
      try {
        const response = await fetch(url, jwsRequest);
        console.log("response", response);
        // const response: any = await dispatch(fetchTokenWithJws());
        // console.log("RESPONSE: ", response);
        // if (fetchTokenWithJws.fulfilled.match(response)) {
        //   dispatch(fetchJWSSlice.actions.appLoaded());
        // }
        console.log("Save LocalStorage");
        // save in LocalStorage
        const response_json = response.json();
        console.log("[response_json]", response_json);
        console.log(
          "JSON.stringify(response_json)",
          JSON.stringify(response_json)
        );
        // JWSTokenExpire
        // let now = new Date();
        // const expires_in = response_json.interact.expires_in; // seconds
        // const expires_in_milliseconds = expires_in * 1000; // 10 seconds = 10000 milliseconds
        // const JWSTokenExpires = new Date(
        //   now.getTime() + expires_in_milliseconds
        // ).getTime();

        localStorage.setItem("JWSToken", JSON.stringify(response_json));
        localStorage.setItem("Nonce", nonce);
        // localStorage.setItem("JWSTokenExpires", JWSTokenExpires.toString());
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
