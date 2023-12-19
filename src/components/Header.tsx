import { useAppSelector } from "../hooks";

export function Header(): JSX.Element {
  const loggedInUser = useAppSelector((state) => state.personalData.loggedInUser);
  const userMail = loggedInUser.user.attributes.mail;

  return (
    <header id="header">
      <a aria-label="eduID start" title="eduID start">
        <div id="eduid-logo" className="eduid-logo" />
      </a>
      {userMail}
    </header>
  );
}
