import React from "react";
import { Route, Routes } from "react-router-dom";
import "../App.css";
import "../styles/_base.scss";
import "../styles/_buttons.scss";
import "../styles/_fonts.scss";
import "../styles/_footer.scss";
import "../styles/_forms.scss";
import "../styles/_header.scss";
import "../styles/_inputs.scss";
import "../styles/_reset.scss";
import "../styles/_typography.scss";
import Callback from "./Callback";
import Footer from "./Footer";
import GroupManagement from "./GroupManagement";
import { Header } from "./Header";

import { StartSession } from "./StartSession";

export function ManagedAccountApp(): JSX.Element {
  return (
    <React.Fragment>
      <Header />
      <main id="panel" className="panel">
        <section id="content" className="horizontal-content-margin content">
          <Routes>
            <Route path="/" element={<StartSession />} />
            <Route path="/scim" element={<GroupManagement />} />
            <Route path="/redirect" element={<Callback />} />
            {/* <Route path="/app" element={<App />} /> */}
          </Routes>
        </section>
      </main>
      <Footer />
    </React.Fragment>
  );
}
