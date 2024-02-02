import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExcelJS from "exceljs";
import React, { Fragment, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { removeUser } from "../apis/maccapi/request";
import { getGroupDetails } from "../apis/scim/groupsRequest";
import { deleteUser } from "../apis/scim/usersRequest";
import currentDateTimeToString from "../common/time";
import { useAppDispatch, useAppSelector } from "../hooks";
import appSlice from "../slices/appReducers";
import { ExtendedUserResponse } from "../slices/getUsers";
import { MembersListTable } from "./MembersListTable";
import NotificationModal from "./NotificationModal";
import Pagination from "./Pagination";

export interface MembersListTypes {
  readonly members: Array<ExtendedUserResponse & { selected: boolean }>;
  readonly setMembers: React.Dispatch<React.SetStateAction<any>>;
  readonly handleGroupVersion: () => void;
}
export const DEFAULT_POST_PER_PAGE = 20;

export default function MembersList({ members, setMembers, handleGroupVersion }: MembersListTypes): JSX.Element {
  const [copiedRowToClipboard, setCopiedRowToClipboard] = useState(false);
  const isMemberSelected = members.filter((member) => member.selected);
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const membersDetails = useAppSelector((state) => state.members.members);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [sortedData, setSortedData] = useState(members);
  const [postsPerPage, setPostsPerPage] = useState(DEFAULT_POST_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const dispatch = useAppDispatch();
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedData.slice(indexOfFirstPost, indexOfLastPost);
  const [showMore, setShowMore] = useState(true);
  const isFetching = useAppSelector((state) => state.app.isFetching);

  function toggleShowMore() {
    setShowMore(!showMore);
  }

  useEffect(() => {
    setSortedData(members);
  }, [members]);

  useEffect(() => {
    setMembers(
      membersDetails.map((member: ExtendedUserResponse) => {
        if (member.password) {
          return { ...member, selected: true };
        }
        return { ...member, selected: false };
      })
    );
  }, [membersDetails]);

  function exportHeaders() {
    const headerGivenName = document.getElementById("header-givenname")?.textContent ?? "Given name";
    const headerSurname = document.getElementById("header-surname")?.textContent ?? "Surname";
    const headerEPPN = "EPPN";
    const headerUsername = document.getElementById("header-username")?.textContent ?? "Username";
    const headerPassword = document.getElementById("header-password")?.textContent ?? "Password";
    return [headerGivenName, headerSurname, headerEPPN, headerUsername, headerPassword];
  }

  function copyToClipboardAllMembers() {
    const memberGivenName = isMemberSelected.map((member: ExtendedUserResponse) => member.name.givenName);
    const memberFamilyName = isMemberSelected.map((member: ExtendedUserResponse) => member.name.familyName);
    const memberEPPN = isMemberSelected.map(
      (member: ExtendedUserResponse) =>
        member["https://scim.eduid.se/schema/nutid/user/v1"]?.profiles.connectIdp.attributes.eduPersonPrincipalName
    );
    const memberUsername = isMemberSelected.map(
      (member: ExtendedUserResponse) =>
        member[
          "https://scim.eduid.se/schema/nutid/user/v1"
        ]?.profiles.connectIdp.attributes.eduPersonPrincipalName.split("@")[0]
    );
    const memberPassword = isMemberSelected.map((member: ExtendedUserResponse) => member.password);
    const membersArray: any = [];
    // Headers
    const [headerGivenName, headerSurname, headerEPPN, headerUsername, headerPassword] = exportHeaders();
    const headers = `${headerGivenName}, ${headerSurname}, ${headerEPPN}, ${headerUsername}, ${headerPassword}`;
    membersArray.push(headers);
    for (let i = 0; i < isMemberSelected.length; i++) {
      const password = memberPassword[i] ? memberPassword[i] : " ";
      const memberInfo = `${memberGivenName[i]}, ${memberFamilyName[i]}, ${memberEPPN[i]}, ${memberUsername[i]}, ${password}`;
      membersArray.push(memberInfo);
    }
    const lineBreak = membersArray.join("\n");
    const createdTextArea = document.createElement("textarea");
    createdTextArea.value = lineBreak;
    document.body.appendChild(createdTextArea);
    createdTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(createdTextArea);
    setCopiedRowToClipboard(true);
    setTimeout(() => {
      setCopiedRowToClipboard(false);
    }, 1000);
  }
  const selectedUserIds = isMemberSelected?.map((user) => user.id) || [];

  async function removeSelectedUser() {
    dispatch(appSlice.actions.isFetching(true));
    await handleGroupVersion();
    const memberToBeRemoved = membersDetails?.filter((user) => selectedUserIds.includes(user.id));
    if (memberToBeRemoved && memberToBeRemoved.length > 0) {
      for (const member of memberToBeRemoved) {
        await dispatch(removeUser({ eppn: member.externalId.split("@")[0] }));
        const deleteUserResponse = await dispatch(deleteUser({ id: member.id, version: member.meta.version }));
        if (deleteUser.fulfilled.match(deleteUserResponse)) {
          setShowModal(false);
        }
      }
      dispatch(getGroupDetails({ id: managedAccountsDetails.id }));
    } else {
      console.warn("No matching users found to be removed.");
    }
    dispatch(appSlice.actions.isFetching(false));
  }

  function showAllMembers() {
    setCurrentPage(1);
    setPostsPerPage(membersDetails.length);
    setShowAll(true);
  }

  function showLessMembers() {
    setCurrentPage(1);
    setPostsPerPage(DEFAULT_POST_PER_PAGE);
    setShowAll(false);
  }

  function handleSorting(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target?.value;
    setSelectedValue(value);
    let newData = [...members];
    if (value === "givenName") {
      newData.sort((a, b) => a.name.givenName.toUpperCase().localeCompare(b.name.givenName, "sv"));
    } else if (value === "surName") {
      newData.sort((a, b) => a.name.familyName.toUpperCase().localeCompare(b.name.familyName, "sv"));
    } else {
      newData.sort((a, b) => b.meta.created.localeCompare(a.meta.created));
    }
    setSortedData(newData);
  }

  function exportExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("EPPN Managed Accounts"); // maybe use Scope as sheet name?
    const [headerGivenName, headerSurname, headerEPPN, headerUsername, headerPassword] = exportHeaders();
    worksheet.columns = [
      { header: headerGivenName, key: "given-name" },
      { header: headerSurname, key: "surname" },
      { header: headerEPPN, key: "eppn" },
      { header: headerUsername, key: "username" },
      { header: headerPassword, key: "password" },
    ];
    worksheet.getRow(1).font = { bold: true };
    // read the data from state
    isMemberSelected.forEach((member) => {
      worksheet.addRow({
        "given-name": member.name.givenName,
        surname: member.name.familyName,
        eppn: member["https://scim.eduid.se/schema/nutid/user/v1"]?.profiles.connectIdp.attributes
          .eduPersonPrincipalName,
        username:
          member[
            "https://scim.eduid.se/schema/nutid/user/v1"
          ]?.profiles.connectIdp.attributes.eduPersonPrincipalName.split("@")[0],
        password: member.password,
      });
    });
    // download the file
    workbook.xlsx.writeBuffer().then(function (buffer) {
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `EPPN-${currentDateTimeToString()}.xlsx`; // maybe use Scope as file name?
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  }

  return (
    <Fragment>
      {membersDetails.length > 0 && (
        <Fragment>
          <hr className="border-line"></hr>
          <h2>
            <FormattedMessage defaultMessage="Manage added accounts" id="manageGroup-heading" />
          </h2>
          <p>
            <FormattedMessage
              defaultMessage="Export, copy or note down the corresponding EPPN/username and password for every account during the session and page load in which it was added."
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
                <FormattedMessage
                  defaultMessage="READ LESS ON HOW TO MANAGE ADDED ACCOUNTS"
                  id="manageGroup-hideList"
                />
                <FontAwesomeIcon icon={faChevronUp as IconProp} />
              </button>
              <ol className="listed-steps">
                <li>
                  <FormattedMessage
                    defaultMessage="You can select accounts by using the corresponding checkbox for each row, one by one or all. Note: the accounts added in the current session - with a retrievable password, are pre-selected."
                    id="manageGroup-listItem1"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="You can export all selected accounts to a new Excel file by clicking DOWNLOAD EXCEL, to save or edit locally."
                    id="manageGroup-listItem2"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="You can copy several/all entire selected rows at once using the COPY ROW button, or copy just the individual EPPN/username with the copy icon next to it. When copying and exporting, the full scope will be included as the username, not just the EPPN."
                    id="manageGroup-listItem3"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="If you get a new password by clicking the NEW PASSWORD link, it must be used by the account holder (i.e. by the student for the exam), as the previous password will be invalid."
                    id="manageGroup-listItem4"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="If you need to make changes to added accounts, select the appropriate row/s and click the REMOVE ROW button, you can now add the account again if needed, in the same way - but with a new EPPN/username and password."
                    id="manageGroup-listItem5"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="To find an account you can sort the table by entry-order or names, use the pagination arrows underneath or show the entire table by clicking the SHOW ALL button, if your table is spanning several pages."
                    id="manageGroup-listItem6"
                  />
                </li>
              </ol>
            </>
          )}
          <div className="form-controls">
            <div className="flex-between">
              <span>
                <FormattedMessage defaultMessage="Export selected rows to Excel:" id="manageGroup-exportLabel" />
              </span>
              <div className="buttons">
                <button
                  disabled={!isMemberSelected.length || isFetching}
                  className={`btn btn-sm btn-primary`}
                  onClick={() => exportExcel()}
                >
                  <FormattedMessage defaultMessage="Download Excel" id="manageGroup-exportButton" />
                </button>
              </div>
            </div>
            <div className="flex-between">
              <span>
                <FormattedMessage defaultMessage="Handle selected rows:" id="manageGroup-editLabel" />
              </span>
              <div className="buttons">
                <button
                  disabled={!isMemberSelected.length || isFetching}
                  className={`btn btn-sm ${copiedRowToClipboard ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => copyToClipboardAllMembers()}
                >
                  {copiedRowToClipboard ? (
                    <FormattedMessage defaultMessage="Copied row" id="manageGroup-copiedRowButton" />
                  ) : (
                    <FormattedMessage defaultMessage="Copy row" id="manageGroup-copyRowButton" />
                  )}
                </button>
                <button
                  disabled={!isMemberSelected.length || isFetching}
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(true)}
                >
                  <FormattedMessage defaultMessage="Remove row" id="manageGroup-removeRowButton" />
                </button>
              </div>
            </div>
            <div className="flex-between">
              <span>
                <FormattedMessage defaultMessage="Show/sort rows:" id="manageGroup-showLabel" />
              </span>
              <div className="buttons">
                {membersDetails.length >= 11 &&
                  (showAll ? (
                    <button
                      disabled={!membersDetails.length}
                      className={`btn btn-sm btn-secondary`}
                      onClick={() => showLessMembers()}
                    >
                      <FormattedMessage defaultMessage="show less" id="manageGroup-showLessButton" />
                    </button>
                  ) : (
                    <button
                      disabled={!membersDetails.length || isFetching}
                      className={`btn btn-sm btn-secondary`}
                      onClick={() => showAllMembers()}
                    >
                      <FormattedMessage defaultMessage="show all" id="manageGroup-showAllButton" />(
                      {membersDetails.length})
                    </button>
                  ))}
                <select id="sortOrder" value={selectedValue} onChange={handleSorting} disabled={isFetching}>
                  <option value="">
                    <FormattedMessage defaultMessage="Latest (default)" id="manageGroup-selectOptionLatest" />
                  </option>
                  <option value="givenName">
                    <FormattedMessage defaultMessage="Given name (ABC)" id="manageGroup-selectOptionGivenName" />
                  </option>
                  <option value="surName">
                    <FormattedMessage defaultMessage="Surname (ABC)" id="manageGroup-selectOptionSurname" />
                  </option>
                </select>
              </div>
            </div>
          </div>
          <MembersListTable
            currentPosts={currentPosts}
            sortedData={sortedData}
            setMembers={setMembers}
            currentPage={currentPage}
            postsPerPage={postsPerPage}
          />
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={membersDetails.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </Fragment>
      )}
      <NotificationModal
        id="remove-selected-users-modal"
        title={
          <FormattedMessage
            defaultMessage="Remove accounts from organisation"
            id="manageGroup-removeMembersDialogHeading"
          />
        }
        mainText={
          <FormattedMessage
            defaultMessage="Are you sure you want to delete {selectedMemberLength} accounts? If so, please press the OK button below."
            id="manageGroup-removeMembersDialogParagraph"
            values={{ selectedMemberLength: isMemberSelected.length }}
          />
        }
        showModal={showModal}
        closeModal={() => {
          setShowModal(false);
        }}
        acceptModal={() => removeSelectedUser()}
        acceptButtonText="ok"
      />
    </Fragment>
  );
}
