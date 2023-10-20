import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import "./styles/_reset.scss";
import "./styles/_anti-bootstrap.scss";
import "./styles/_fonts.scss";
import "./styles/_typography.scss";
import "./styles/_base.scss";
import "./styles/_forms.scss";
import "./styles/_inputs.scss";
import "./styles/_buttons.scss";
import "./styles/_footer.scss";
import "./styles/_header.scss";
import React from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <React.StrictMode>
      <header id="header">
        <a href="#" title="eduID logo">
          <div className="eduid-logo" />
        </a>
      </header>
      <main id="panel" className="panel">
        <section id="content" className="horizontal-content-margin content">
          <section className="intro">
            <h1>Hantera elevkonton</h1>
            <div className="lead">
              <p>Här beskriver vi vad som behöver göras, vilket vi inte riktigt vet ännu...</p>
            </div>
          </section>
          <article>
            <h2>Registrera elev</h2>
            <form id="personaldata-view-form">
              <fieldset>
                <fieldset>
                  <div id="given_name-wrapper">
                    <div className="input-label-help-text-container">
                      <label htmlFor="given_name" className="required form-label">
                        Förnamn
                      </label>
                    </div>
                    <input
                      name="given_name"
                      id="given_name"
                      placeholder="Förnamn"
                      type="text"
                      className="form-control"
                      value=""
                    />
                    <small className="form-text text-muted">
                      <span role="alert" aria-invalid="true" className="input-validate-error">
                        *Fältet kan inte vara tomt
                      </span>
                    </small>
                  </div>
                </fieldset>
                <fieldset>
                  <div id="surname-wrapper">
                    <div className="input-label-help-text-container">
                      <label htmlFor="surname" className="required form-label">
                        Efternamn
                      </label>
                    </div>
                    <input
                      name="surname"
                      id="surname"
                      placeholder="Efternamn"
                      type="text"
                      className="form-control"
                      value=""
                    />
                    <small className="form-text text-muted">
                      <span role="alert" aria-invalid="true" className="input-validate-error">
                        *Fältet kan inte vara tomt
                      </span>
                    </small>
                  </div>
                </fieldset>
                <fieldset id="nins-form">
                  <div id="nin-wrapper">
                    <div className="input-label-help-text-container">
                      <label htmlFor="nin" className="form-label">
                        Personnummer
                      </label>
                      <span className="help-block">Personnummer med 12 siffror</span>
                    </div>
                    <input
                      name="nin"
                      id="nin"
                      placeholder="ååååmmddnnnn"
                      type="text"
                      className="form-control"
                      value=""
                    />
                    <small className="form-text text-muted">
                      <span role="alert" aria-invalid="true" className="input-validate-error">
                        *Fältet kan inte vara tomt
                      </span>
                    </small>
                  </div>
                </fieldset>
              </fieldset>
              <div className="buttons">
                <button id="personal-data-button" className="btn btn-primary disabled">
                  spara
                </button>
              </div>
            </form>
          </article>
        </section>
      </main>
      <footer key="0" id="footer">
        <div className="logo-wrapper">
          {" "}
          <a href="#" title="Sunet logo">
            <div className="sunet-logo" />
          </a>
        </div>

        <nav></nav>
      </footer>
    </React.StrictMode>
    // <>
    //   <div>
    //     <a href="https://vitejs.dev" target="_blank">
    //       <img src={viteLogo} className="logo" alt="Vite logo" />
    //     </a>
    //     <a href="https://react.dev" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a>
    //   </div>
    //   <h1>Vite + React</h1>
    //   <div className="card">
    //     <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
    //     <p>
    //       Edit <code>src/App.tsx</code> and save to test HMR
    //     </p>
    //   </div>
    //   <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    // </>
  );
}

export default App;
