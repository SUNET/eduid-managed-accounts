import { FormattedMessage } from "react-intl";
import { useAppSelector } from "../hooks";

export function PageNotFound(): JSX.Element {
  const ma_website_url = useAppSelector((state) => state.config.ma_website_url);

  return (
    <section className="intro">
      <h1>
        <FormattedMessage id="not found heading" defaultMessage="Page not found" />
      </h1>
      <p>
        <FormattedMessage
          id="not found paragraph"
          defaultMessage={`We can't find what you are looking for. This may be due to a technical error or a typo. 
                Please try again or use the link to move forward.`}
        />
      </p>
      <div>
        <a href={ma_website_url} id="not-found-link">
          <FormattedMessage id="not found link" defaultMessage="Go to Managed Accounts" />
        </a>
      </div>
    </section>
  );
}
