import React from "react";
import { Route, Routes } from "react-router-dom";
import "../App.css";
import { Hash } from "./Hash";
import { Main } from "./Main";

export function ManagedAccountApp(): JSX.Element {
  return (
    <React.StrictMode>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/hash" element={<Hash />} />
      </Routes>
    </React.StrictMode>
  );
}
