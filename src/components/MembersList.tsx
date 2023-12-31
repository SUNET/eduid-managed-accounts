import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faChevronDown, faChevronUp, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Meta } from "typescript-clients/scim";
import { getGroupDetails } from "../apis/scim/groupsRequest";
import { deleteUser } from "../apis/scim/usersRequest";
import { fakePassword } from "../common/testEPPNData";
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

  const [postsPerPage, setPostsPerPage] = useState(10);
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
    setMembers(membersDetails.map((member: MembersDetailsTypes) => ({ ...member, selected: false })));
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
    setPostsPerPage(10);
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
              defaultMessage="Copy or note down the corresponding EPPN/username and password for each account during the session in which it was added."
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
                    defaultMessage="You can select accounts by using the corresponding checkboxes and copy several/all entire rows at once using the COPY ROW button, or copy just the individual EPPN/username with the copy icon next to it."
                    id="manageGroup-listItem1"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="If you get a new password by clicking the NEW PASSWORD link, it must be used by the account holder (i.e. by the student for the exam), as the previous password will be invalid."
                    id="manageGroup-listItem2"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="If you need to make changes to added accounts, select the appropriate row/s and click the REMOVE ROW button, you can now add the account again if needed, in the same way - but with a new EPPN/username and password."
                    id="manageGroup-listItem3"
                  />
                </li>
                <li>
                  <FormattedMessage
                    defaultMessage="To find an account you can sort the table by entry-order or names, use the pagination arrows underneath or show the entire table by clicking the SHOW ALL button, if your table is spanning several pages."
                    id="manageGroup-listItem4"
                  />
                </li>
              </ol>
            </>
          )}
          <div className="form-controls">
            <div className="flex-between">
              <label>
                <FormattedMessage defaultMessage="Edit selected rows:" id="manageGroup-rowButtonsLabel" />
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
                      className={`btn btn-sm btn-primary`}
                      onClick={() => showAllMembers()}
                    >
                      <FormattedMessage defaultMessage="show all" id="manageGroup-showAllButton" />(
                      {membersDetails.length})
                    </button>
                  ))}

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
              <label htmlFor="sortOrder">Sort rows</label>
              <select id="sortOrder" value={selectedValue} onChange={handleSorting}>
                <option value="">Latest (default)</option>
                <option value="givenName">Given name (ABC)</option>
                <option value="surName">Surname (ABC)</option>
              </select>
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
                <th>
                  <FormattedMessage defaultMessage="Given name" id="manageGroup-givenNameColumn" />
                </th>
                <th>
                  <FormattedMessage defaultMessage="Surname" id="manageGroup-surnameColumn" />
                </th>
                <th>
                  <FormattedMessage defaultMessage="EPPN/username" id="manageGroup-eppnColumn" />
                </th>
                <th>
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
            defaultMessage={`Are you sure you want to delete ${isMemberSelected.length} accounts? If so, please press the OK button below.`}
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
