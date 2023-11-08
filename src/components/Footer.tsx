import { Link } from "react-router-dom";

const Footer = (): JSX.Element => {
  return (
    <footer key="0" id="footer">
      <div className="logo-wrapper">
        <a href="https://www.sunet.se/" aria-label="Sunet.se" title="Sunet.se">
          <div className="sunet-logo" />
        </a>
        <span>&copy; copyright</span>
      </div>

      <nav>
        <ul>
          <li>
            <Link className="help-link" to="#">
              Help
            </Link>
          </li>
          <li id="language-selector">
            <span className="lang-selected">
              <a className="link" href="#">
                Svenska
              </a>
            </span>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
