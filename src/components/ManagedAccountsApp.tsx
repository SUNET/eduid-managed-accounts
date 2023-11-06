import { Route, Routes } from "react-router-dom";
import "../App.css";
import { Main } from "./Main";
import { TestHash } from "./TestHash";

export function ManagedAccountApp(): JSX.Element {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/hash" element={<TestHash />} />
      </Routes>
    </>
  );
}
