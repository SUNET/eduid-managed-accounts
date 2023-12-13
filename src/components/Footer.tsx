import { useAppDispatch, useAppSelector } from "../hooks";
import { updateIntl } from "../slices/Internationalisation";
import { messages as translateMessages } from "../translation/messages";

const Footer = (): JSX.Element => {
  const currentLocale = useAppSelector((state) => state.intl.locale);
  const dispatch = useAppDispatch();
  const LOCALIZED_MESSAGES = translateMessages as unknown as { [key: string]: { [key: string]: string } };
  const messages = LOCALIZED_MESSAGES;

  let translateTo: string[][] = [];
  let locale = "";
  let language = "";

  const AVAILABLE_LANGUAGES: { [key: string]: string } = {
    en: "English",
    sv: "Svenska",
  };

  if (AVAILABLE_LANGUAGES !== undefined) {
    /* Filter out all the available languages _except_ the currently used one */
    translateTo = Object.entries(AVAILABLE_LANGUAGES).filter(([_locale, _language]) => _locale !== currentLocale);
    /* Offer the user the choice to switch to the other language below */
    locale = translateTo[0][0];
    language = translateTo[0][1];
  }

  const changeLanguage = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (locale) {
      dispatch(
        updateIntl({
          locale: locale,
          messages: messages[locale],
        })
      );
    }
  };

  return (
    <footer key="0" id="footer">
      <div className="logo-wrapper">
        <a href="https://www.sunet.se/" aria-label="Sunet.se" title="Sunet.se">
          <div className="sunet-logo" />
        </a>
        <span>&copy; 2013-2023</span>
      </div>

      <nav>
        <ul>
          <li>
            {/* <Link className="help-link" to="#">
              Help
            </Link> */}
          </li>
          <li id="language-selector">
            <span className="lang-selected" data-lang={locale}>
              <a className="link" href="#" onClick={(e) => changeLanguage(e)}>
                {language}
              </a>
            </span>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
