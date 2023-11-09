import React from "react";
import { Route, Routes } from "react-router-dom";
import "../App.css";
import Footer from "./Footer";
import { Header } from "./Header";
import { Main } from "./ManagedAccountsMain";
import Scim from "./Scim";
import TestHash from "./TestHash";

export function ManagedAccountApp(): JSX.Element {
  return (
    <React.Fragment>
      <Header />
      <main id="panel" className="panel">
        <section id="content" className="horizontal-content-margin content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/redirect" element={<TestHash />} />
            <Route path="/scim" element={<Scim />} />
          </Routes>
        </section>
      </main>
      <Footer />
    </React.Fragment>
  );
}
