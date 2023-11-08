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
import Footer from "./Footer";
import { Header } from "./Header";
import { Main } from "./Main";
import Scim from "./Scim";
import TestHash from "./TestHash";

export function ManagedAccountApp(): JSX.Element {
  return (
    <>
      <Header />
      <main id="panel" className="panel">
        <section id="content" className="horizontal-content-margin content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/hash" element={<TestHash />} />
            <Route path="/scim" element={<Scim />} />
            {/* <Route path="/app" element={<App />} /> */}
          </Routes>
        </section>
      </main>
      <Footer />
    </>
  );
}
