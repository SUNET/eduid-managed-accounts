import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import "./styles/_fonts.scss";
import "./styles/_typography.scss";
import "./styles/_base.scss";
import "./styles/_header.scss";
import "./styles/_footer.scss";
import "./styles/_buttons.scss";
import React from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <React.StrictMode>
      <header id="header"></header>
      <main id="panel" className="panel">
        <section id="content" className="horizontal-content-margin content">
          <h1>eduID Managed Accounts</h1>
        </section>
      </main>
      <footer key="0" id="footer">
        <div className="logo-wrapper"></div>

        <nav>
          <ul>
            <li></li>
            <li id="language-selector"></li>
          </ul>
        </nav>
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
