import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faChevronDown, faChevronUp, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExcelJS from "exceljs";
import { Fragment, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Meta } from "typescript-clients/scim";
import { getGroupDetails } from "../apis/scim/groupsRequest";
import { deleteUser } from "../apis/scim/usersRequest";
import { fakePassword } from "../common/testEPPNData";
import currentDateTimeToString from "../common/time";
import { useAppDispatch, useAppSelector } from "../hooks";
import { getUsersSlice } from "../slices/getUsers";
import NotificationModal from "./NotificationModal";
import Pagination from "./Pagination";

export interface MembersDetailsTypes {
  emails: [];
  externalId: string;
  groups: [{ display: string; value: string }];
  id: string;
  meta: Meta;
  name: { familyName: string; givenName: string };
  phoneNumbers: [];
  schemas: [];
  password?: string;
}

export interface MembersListTypes {
  membersDetails: MembersDetailsTypes[];
  members: Array<MembersDetailsTypes & { selected: boolean }>;
  setMembers: React.Dispatch<React.SetStateAction<any>>;
  accessToken: string;
  handleGroupVersion(): void;
}

export default function MembersList({
  membersDetails,
  members,
  setMembers,
  accessToken,
  handleGroupVersion,
}: MembersListTypes): JSX.Element {
  const [tooltipCopied, setTooltipCopied] = useState(false);
  const [copiedRowToClipboard, setCopiedRowToClipboard] = useState(false);
  const isMemberSelected = members.filter((member) => member.selected);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [sortedData, setSortedData] = useState(members);

  const DEFAULT_POST_PER_PAGE = 20;
  const [postsPerPage, setPostsPerPage] = useState(DEFAULT_POST_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedData.slice(indexOfFirstPost, indexOfLastPost);

  const [showMore, setShowMore] = useState(true);
  function toggleShowMore() {
    setShowMore(!showMore);
  }

  useEffect(() => {
    setSortedData(members);
  }, [members]);

  useEffect(() => {
    setSelectAll(false);
    setMembers(
      membersDetails.map((member: MembersDetailsTypes) => {
        if (member.password) {
          return { ...member, selected: true };
        }
        return { ...member, selected: false };
      })
    );
  }, [membersDetails]);

  function copyToClipboardAllMembers() {
    const memberGivenName = isMemberSelected.map((member: MembersDetailsTypes) => member.name.givenName);
    const memberFamilyName = isMemberSelected.map((member: MembersDetailsTypes) => member.name.familyName);
    const memberEPPN = isMemberSelected.map((member: MembersDetailsTypes) => member.externalId);
    const memberPassword = isMemberSelected.map((member: MembersDetailsTypes) => member.password);

    const membersArray = [];

    for (let i = 0; i < isMemberSelected.length; i++) {
      const password = memberPassword[i] ? memberPassword[i] : " ";
      const memberInfo = `${memberGivenName[i]}, ${memberFamilyName[i]}, ${memberEPPN[i]}, ${password}`;
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

  function copyToClipboard(id: string) {
    const TempText = document.createElement("input");
    TempText.value = id;
    document.body.appendChild(TempText);
    TempText.select();

    document.execCommand("copy");
    document.body.removeChild(TempText);
    setTooltipCopied(true);
    (document.getElementById(`icon-copy ${id}`) as HTMLInputElement).style.display = "none";
    (document.getElementById(`icon-check ${id}`) as HTMLInputElement).style.display = "inline";
    setTimeout(() => {
      (document.getElementById(`icon-copy ${id}`) as HTMLInputElement).style.display = "inline";
      (document.getElementById(`icon-check ${id}`) as HTMLInputElement).style.display = "none";
      setTooltipCopied(false);
    }, 1000);
  }

  function handleSelectAll() {
    setSelectAll((prevState) => !prevState);

    const updatedMembers = sortedData.map((member) => ({
      ...member,
      selected: !selectAll,
    }));

    setMembers(updatedMembers);
  }

  function handleSelect(id: string) {
    setMembers((prevMembers: any) =>
      prevMembers.map((member: any) => (member.id === id ? { ...member, selected: !member.selected } : member))
    );
    setSelectAll(false);
  }
  const selectedUserIds = isMemberSelected?.map((user) => user.id) || [];

  async function removeSelectedUser() {
    await handleGroupVersion();
    const memberToBeRemoved = membersDetails?.filter((user) => selectedUserIds.includes(user.id));
    if (memberToBeRemoved && memberToBeRemoved.length > 0) {
      for (const member of memberToBeRemoved) {
        const userToDelete = {
          id: member.id,
          version: member.meta.version,
        };
        const deleteUserResponse = await dispatch(deleteUser({ user: userToDelete, accessToken: accessToken }));
        if (deleteUser.fulfilled.match(deleteUserResponse)) {
          setShowModal(false);
        }
      }
      dispatch(getGroupDetails({ id: managedAccountsDetails.id, accessToken: accessToken }));
    } else {
      console.warn("No matching users found to be removed.");
    }
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

  function handleRemoveUsers() {
    if (selectedUserIds.length >= 2) {
      setShowModal(true);
    } else {
      removeSelectedUser();
    }
  }

  function generateNewPassword(id: string) {
    const generatedPassword = fakePassword();
    const memberWithGeneratedPassword = membersDetails.map((member) =>
      member.id === id ? { ...member, password: generatedPassword } : member
    );

    dispatch(getUsersSlice.actions.generatedNewPassword(memberWithGeneratedPassword));
  }

  const handleSorting = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
  };

  function exportExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("EPPN Managed Accounts"); // maybe use Scope as sheet name?
    const headerGivenName = document.getElementById("header-givenname")?.textContent ?? "Given name";
    const headerSurname = document.getElementById("header-surname")?.textContent ?? "Surname";
    const headerEPPN = document.getElementById("header-eppn")?.textContent ?? "EPPN/username";
    const headerPassword = document.getElementById("header-password")?.textContent ?? "Password";
    worksheet.columns = [
      { header: headerGivenName, key: "given-name" },
      { header: headerSurname, key: "surname" },
      { header: headerEPPN, key: "eppn" },
      { header: headerPassword, key: "password" },
    ];
    worksheet.getRow(1).font = { bold: true };

    // read the data from state
    isMemberSelected.forEach((member) => {
      worksheet.addRow({
        "given-name": member.name.givenName,
        surname: member.name.familyName,
        eppn: member.externalId,
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
              <label>
                <FormattedMessage defaultMessage="Export selected rows to Excel:" id="manageGroup-exportLabel" />
              </label>
              <div className="buttons">
                <button
                  disabled={!isMemberSelected.length}
                  className={`btn btn-sm btn-primary`}
                  onClick={() => exportExcel()}
                >
                  <FormattedMessage defaultMessage="Download Excel" id="manageGroup-exportButton" />
                </button>
              </div>
            </div>
            <div className="flex-between">
              <label>
                <FormattedMessage defaultMessage="Edit selected rows:" id="manageGroup-editLabel" />
              </label>
              <div className="buttons">
                <button
                  disabled={!isMemberSelected.length}
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
                  disabled={!isMemberSelected.length}
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleRemoveUsers()}
                >
                  <FormattedMessage defaultMessage="Remove row" id="manageGroup-removeRowButton" />
                </button>
              </div>
            </div>
            <div className="flex-between">
              <label htmlFor="sortOrder">
                <FormattedMessage defaultMessage="Show/sort rows:" id="manageGroup-showLabel" />
              </label>
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
                      disabled={!membersDetails.length}
                      className={`btn btn-sm btn-secondary`}
                      onClick={() => showAllMembers()}
                    >
                      <FormattedMessage defaultMessage="show all" id="manageGroup-showAllButton" />(
                      {membersDetails.length})
                    </button>
                  ))}
                <select id="sortOrder" value={selectedValue} onChange={handleSorting}>
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
          <table className="group-management">
            <thead>
              <tr>
                <th>
                  <span className="flex-between">
                    <input type="checkbox" checked={selectAll} onChange={() => handleSelectAll()} id="selectAll" />
                    <label htmlFor="selectAll">
                      <FormattedMessage defaultMessage="All" id="manageGroup-selectAllCheckbox" />
                    </label>
                  </span>
                </th>
                <th id="header-givenname">
                  <FormattedMessage defaultMessage="Given name" id="manageGroup-givenNameColumn" />
                </th>
                <th id="header-surname">
                  <FormattedMessage defaultMessage="Surname" id="manageGroup-surnameColumn" />
                </th>
                <th id="header-eppn">
                  <FormattedMessage defaultMessage="EPPN/username" id="manageGroup-eppnColumn" />
                </th>
                <th id="header-password">
                  <FormattedMessage defaultMessage="Password" id="manageGroup-passwordColumn" />
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPosts?.map((member: any, index: number) => (
                <tr key={member.id}>
                  <td>
                    <span className="flex-between">
                      <input
                        type="checkbox"
                        checked={member.selected}
                        onChange={() => handleSelect(member.id)}
                        id={"selectMember" + (index + 1)}
                      />
                      <label htmlFor={"selectMember" + (index + 1)}>
                        {(currentPage - 1) * postsPerPage + index + 1}
                      </label>
                    </span>
                  </td>
                  <td>{member.name.givenName}</td>
                  <td>{member.name.familyName}</td>
                  <td>
                    {member.externalId.split("@")[0]}
                    <button
                      id="clipboard"
                      className="icon-only copybutton"
                      onClick={() => copyToClipboard(member.externalId)}
                    >
                      <FontAwesomeIcon id={`icon-copy ${member.externalId}`} icon={faCopy as IconProp} />
                      <FontAwesomeIcon id={`icon-check ${member.externalId}`} icon={faCheck as IconProp} />
                      <div className="tool-tip-text" id="tool-tip">
                        {tooltipCopied ? (
                          <span>
                            <FormattedMessage defaultMessage="Copied EPPN" id="manageGroup-copiedEppnDialog" />
                          </span>
                        ) : (
                          <span>
                            <FormattedMessage defaultMessage="Copy EPPN" id="manageGroup-copyEppnDialog" />
                          </span>
                        )}
                      </div>
                    </button>
                  </td>
                  <td>
                    {member.password ? (
                      member.password
                    ) : (
                      <button
                        id="generate-new-password"
                        className="btn btn-link btn-sm"
                        onClick={() => generateNewPassword(member.id)}
                      >
                        <FormattedMessage defaultMessage="New password" id="manageGroup-newPasswordLink" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            defaultMessage="Are you sure you want to delete ${isMemberSelected.length} accounts? If so, please press the OK button below."
            id="manageGroup-removeMembersDialogParagraph"
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
