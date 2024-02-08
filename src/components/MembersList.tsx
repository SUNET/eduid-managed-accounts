import ExcelJS from "exceljs";
import { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { removeUser } from "../apis/maccapi/request";
import { getGroupDetails } from "../apis/scim/groupsRequest";
import { deleteUser } from "../apis/scim/usersRequest";
import currentDateTimeToString from "../common/time";
import { useAppDispatch, useAppSelector } from "../hooks";
import appSlice from "../slices/appReducers";
import getUsersSlice, { ExtendedUserResponse } from "../slices/getUsers";
import { MembersListTable } from "./MembersListTable";
import NotificationModal from "./NotificationModal";
import Pagination from "./Pagination";

export interface MembersListTypes {
  readonly handleGroupVersion: () => Promise<void>;
}
export const DEFAULT_POST_PER_PAGE = 20;

export default function MembersList({ handleGroupVersion }: MembersListTypes): JSX.Element {
  const dispatch = useAppDispatch();
  const [copiedRowToClipboard, setCopiedRowToClipboard] = useState(false);
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const membersDetails = useAppSelector((state) => state.members.members);
  const isMemberSelected = membersDetails.filter((member) => member.selected);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [postsPerPage, setPostsPerPage] = useState(DEFAULT_POST_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const isFetching = useAppSelector((state) => state.app.isFetching);
  const [isClicked, setIsClicked] = useState<boolean>(false);

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
    const membersArray = [];
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

  async function removeSelectedUser() {
    dispatch(appSlice.actions.isFetching(true));
    await handleGroupVersion();
    if (isMemberSelected && isMemberSelected.length > 0) {
      for (const member of isMemberSelected) {
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
    if (value === "givenName") {
      dispatch(getUsersSlice.actions.sortByGivenName());
    } else if (value === "surName") {
      dispatch(getUsersSlice.actions.sortBySurname());
    } else {
      dispatch(getUsersSlice.actions.sortByLatest());
    }
  }

  async function exportExcel() {
    setIsClicked(() => !isClicked);
    await handleGroupVersion();
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
      setTimeout(() => {
        setIsClicked((prevIsClicked) => !prevIsClicked);
      }, 1000);
    });
  }

  return (
    <Fragment>
      <div className="form-controls">
        <div className="flex-between">
          <span>
            <FormattedMessage defaultMessage="Export selected rows to Excel:" id="manageGroup-exportLabel" />
          </span>
          <div className="buttons">
            <button
              disabled={!isMemberSelected.length || isFetching || isClicked}
              className={`btn btn-sm btn-primary`}
              onClick={() => exportExcel()}
            >
              {isClicked ? (
                <FormattedMessage defaultMessage="Downloading..." id="manageGroup-downloading" />
              ) : (
                <FormattedMessage defaultMessage="Download Excel" id="manageGroup-exportButton" />
              )}
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
                  <FormattedMessage defaultMessage="show all" id="manageGroup-showAllButton" />({membersDetails.length})
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
      <MembersListTable currentPage={currentPage} postsPerPage={postsPerPage} />
      <Pagination
        postsPerPage={postsPerPage}
        totalPosts={membersDetails.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

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
            defaultMessage={`Are you sure you want to delete {selectedMemberLength} accounts? If so, please press 
              the OK button below.`}
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
