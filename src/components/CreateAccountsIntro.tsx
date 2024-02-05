import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

interface CreateAccountsTypes {
  readonly scope: string;
}

export default function CreateAccountsIntro({ scope }: CreateAccountsTypes): JSX.Element {
  const [showMore, setShowMore] = useState(true);

  function toggleShowMore() {
    setShowMore(!showMore);
  }

  return (
    <React.Fragment>
      <h2>
        <FormattedMessage defaultMessage="Add account to organisation" id="addToGroup-heading" />
      </h2>
      <p>
        <span className="heading-5">
          <FormattedMessage defaultMessage="CURRENT SCOPE: " id="intro-scope" />
        </span>
        <strong>&nbsp;{scope}</strong>
      </p>
      <p>
        <FormattedMessage
          defaultMessage={`Add every account, either by first importing your prepared Excel-document or one by one using 
            the form.`}
          id="addToGroup-paragraph"
        />
      </p>
      {showMore ? (
        <button
          type="button"
          aria-label={showMore ? "hide instructions" : "show instructions"}
          className="btn btn-link"
          onClick={toggleShowMore}
        >
          <FormattedMessage defaultMessage="READ MORE ON HOW TO ADD ACCOUNTS" id="addToGroup-showList" />
          <FontAwesomeIcon icon={faChevronDown as IconProp} />
        </button>
      ) : (
        <React.Fragment>
          <button
            type="button"
            aria-label={showMore ? "hide instructions" : "show instructions"}
            className="btn btn-link"
            onClick={toggleShowMore}
          >
            <FormattedMessage defaultMessage="READ LESS ON HOW TO ADD ACCOUNTS" id="addToGroup-hideList" />
            <FontAwesomeIcon icon={faChevronUp as IconProp} />
          </button>

          <h3>
            <FormattedMessage defaultMessage="Add account by file import" id="addToGroup-headingImport" />
          </h3>
          <ol className="listed-steps">
            <li>
              <FormattedMessage
                defaultMessage={`Create a 2-column Excel-document containing the given names and surnames of the accounts 
                you wish to add. You can download the example file to fill in using the DOWNLOAD DOCUMENT link.`}
                id="addToGroup-list2Item1"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`Import your filled in document by clicking on the SELECT DOCUMENT button to choose your 
                  .xls or .xlsx file. You will see the name of the last imported file next to the button.`}
                id="addToGroup-list2Item2"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`Then create the accounts listed in the document by clicking on the CREATE ACCOUNTS button. 
                The accounts will be added to the organisation, with usernames and passwords, and appearing in a table 
                below in the "Manage added accounts" section, where the newly added accounts will be pre-selected.`}
                id="addToGroup-list2Item3"
              />
            </li>
            <li>
              <strong>
                <FormattedMessage
                  defaultMessage="Then note the corresponding EPPN/username and password which appears in the table"
                  id="addToGroup-list2Item4Strong"
                />
              </strong>
              ,&nbsp;
              <FormattedMessage
                defaultMessage={`transfer it to an external system of your choice, e.g. by exporting to another Excel 
                  document or copying, as you will not be able to retrieve the same password afterwards, 
                  and it will only be visible during this logged in session and page load.`}
                id="addToGroup-list2Item4"
              />
            </li>
          </ol>
          <h3>
            <FormattedMessage defaultMessage="Add account manually" id="addToGroup-headingManually" />
          </h3>
          <ol className="listed-steps">
            <li>
              <FormattedMessage
                defaultMessage="Enter the given name and surname for each account, one at a time."
                id="addToGroup-list1Item1"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`Write the name so that you can distinguish the identity of the person even if there are 
                identical names e.g. by adding an initial. It is not allowed to use personal ID numbers for this use.`}
                id="addToGroup-list1Item2"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`When you click the ADD button the account will be added to the organisation with a 
                  created username and password and appearing in a table below in the "Manage added accounts" section, 
                  where the newly added accounts will be pre-selected.`}
                id="addToGroup-list1Item3"
              />
            </li>
            <li>
              <strong>
                <FormattedMessage
                  defaultMessage="Then note the corresponding EPPN/username and password which appears in the table"
                  id="addToGroup-list1Item4Strong"
                />
              </strong>
              ,&nbsp;
              <FormattedMessage
                defaultMessage={`transfer it to an external system of your choice, e.g. by exporting to Excel or copying, 
                  as you will not be able to retrieve the same password afterwards, and it will only be visible during 
                  this logged in session and page load.`}
                id="addToGroup-list1Item4"
              />
            </li>
          </ol>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
