import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";

export function Header(): JSX.Element {
  const loggedInUser = useAppSelector((state) => state.personalData.loggedInUser);
  const userMail = loggedInUser?.user?.attributes?.mail;
  const navigate = useNavigate();
  let logoutButton;

  function logout() {
    navigate("/");
  }

  if (userMail) {
    logoutButton = (
      <button className="btn btn-link btn-sm" id="logout" onClick={logout}>
        <FontAwesomeIcon icon={faArrowRightFromBracket as IconProp} />
        <FormattedMessage defaultMessage="Log out" id="header-logoutLink" />
      </button>
    );
  }

  return (
    <header id="header">
      <a aria-label="eduID start" title="eduID start">
        <div id="eduid-logo" className="eduid-logo" />
      </a>

      <span className="header-user">
        <div>{userMail}</div>
        {logoutButton}
      </span>
    </header>
  );
}
