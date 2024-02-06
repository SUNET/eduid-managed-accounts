import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";

export default function MembersListIntro(): JSX.Element {
  const [showMore, setShowMore] = useState(true);

  function toggleShowMore() {
    setShowMore(!showMore);
  }

  return (
    <Fragment>
      <hr className="border-line" />
      <h2>
        <FormattedMessage defaultMessage="Manage added accounts" id="manageGroup-heading" />
      </h2>
      <p>
        <FormattedMessage
          defaultMessage={`Export, copy or note down the corresponding EPPN/username and password for every account 
                during the session and page load in which it was added.`}
          id="manageGroup-paragraph"
        />
      </p>

      {showMore ? (
        <button
          type="button"
          aria-label={showMore ? "hide instructions" : "show instructions"}
          className="btn btn-link"
          onClick={toggleShowMore}
        >
          <FormattedMessage defaultMessage="READ MORE ON HOW TO MANAGE ADDED ACCOUNTS" id="manageGroup-showList" />
          <FontAwesomeIcon icon={faChevronDown as IconProp} />
        </button>
      ) : (
        <>
          <button
            type="button"
            aria-label={showMore ? "hide instructions" : "show instructions"}
            className="btn btn-link"
            onClick={toggleShowMore}
          >
            <FormattedMessage defaultMessage="READ LESS ON HOW TO MANAGE ADDED ACCOUNTS" id="manageGroup-hideList" />
            <FontAwesomeIcon icon={faChevronUp as IconProp} />
          </button>
          <ol className="listed-steps">
            <li>
              <FormattedMessage
                defaultMessage={`You can select accounts by using the corresponding checkbox for each row, one by 
                      one or all. Note: the accounts added in the current session - with a retrievable password, 
                      are pre-selected.`}
                id="manageGroup-listItem1"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`You can export all selected accounts to a new Excel file by clicking DOWNLOAD EXCEL, 
                      to save or edit locally.`}
                id="manageGroup-listItem2"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`You can copy several/all entire selected rows at once using the COPY ROW button, 
                      you can also copy the entire row or copy just the individual EPPN/username with the copy icon next 
                      to it. When copying and exporting, the full scope will be included as the username, not just 
                      the EPPN.`}
                id="manageGroup-listItem3"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`If you get a new password by clicking the NEW PASSWORD link, it must be used by 
                      the account holder (i.e. by the student for the exam), as the previous password will be invalid.`}
                id="manageGroup-listItem4"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`If you need to make changes to added accounts, select the appropriate row/s and 
                      click the REMOVE ROW button, you can now add the account again if needed, in the same way - but 
                      with a new EPPN/username and password.`}
                id="manageGroup-listItem5"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`To find an account you can sort the table by entry-order or names, use the
                      pagination arrows underneath or show the entire table by clicking the SHOW ALL button, 
                      if your table is spanning several pages.`}
                id="manageGroup-listItem6"
              />
            </li>
          </ol>
        </>
      )}
    </Fragment>
  );
}
