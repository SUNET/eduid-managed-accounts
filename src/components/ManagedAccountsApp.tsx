import { Route, Routes } from "react-router-dom";
import "../App.css";
import { Main } from "./Main";
import Scim from "./Scim";
import TestHash from "./TestHash";

export function ManagedAccountApp(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/hash" element={<TestHash />} />
      <Route path="/scim" element={<Scim />} />
    </Routes>
  );
}
