import React from "react";
import { Route, Routes } from "react-router-dom";
import "../App.css";
import Callback from "./Callback";
import Footer from "./Footer";
import GroupManagement from "./GroupManagement";
import { Header } from "./Header";
import { Notifications } from "./Notifications";
import { StartSession } from "./StartSession";

export function ManagedAccountApp(): JSX.Element {
  return (
    <React.Fragment>
      <Header />
      <main id="panel" className="panel">
        <Notifications />
        <section id="content" className="horizontal-content-margin content">
          <Routes>
            <Route path="/" element={<StartSession />} />
            <Route path="/manage" element={<GroupManagement />} />
            <Route path="/callback" element={<Callback />} />
          </Routes>
        </section>
      </main>
      <Footer />
    </React.Fragment>
  );
}
