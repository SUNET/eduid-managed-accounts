import React from "react";
import { Route, Routes } from "react-router-dom";
import "../App.css";
import Footer from "./Footer";
import GroupManagement from "./GroupManagement";
import { Header } from "./Header";
import { Main } from "./ManagedAccountsMain";
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
            <Route path="/scim" element={<GroupManagement />} />
          </Routes>
        </section>
      </main>
      <Footer />
    </React.Fragment>
  );
}
