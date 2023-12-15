import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Meta } from "typescript-clients/scim";
import { putGroup } from "../apis/scimGroupsRequest";
import { deleteUser } from "../apis/scimUsersRequest";
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
}

export default function MembersList({
  membersDetails,
  members,
  setMembers,
  accessToken,
}: MembersListTypes): JSX.Element {
  const [tooltipCopied, setTooltipCopied] = useState(false);
  const [copiedRowToClipboard, setCopiedRowToClipboard] = useState(false);
  const isMemberSelected = members.filter((member) => member.selected);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState<boolean>(false);

  const [postsPerPage, setPostsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = members.slice(indexOfFirstPost, indexOfLastPost);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

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

    const updatedMembers = members.map((member) => ({
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
    const currentUsers = managedAccountsDetails?.members?.filter((user) => !selectedUserIds.includes(user.value));
    const putGroupResponse = await dispatch(
      putGroup({
        group: {
          ...managedAccountsDetails,
          members: currentUsers,
        },
        accessToken: accessToken,
      })
    );

    if (putGroup.fulfilled.match(putGroupResponse)) {
      const memberToBeRemoved = membersDetails?.filter((user) => selectedUserIds.includes(user.id));
      if (memberToBeRemoved && memberToBeRemoved.length > 0) {
        await Promise.all(
          memberToBeRemoved.map(async (user) => {
            const userToDelete = {
              id: user.id,
              version: user.meta.version,
            };

            const deleteUserResponse = await dispatch(deleteUser({ user: userToDelete, accessToken: accessToken }));
            if (deleteUser.fulfilled.match(deleteUserResponse)) {
              setShowModal(false);
            }
          })
        );
      } else {
        console.warn("No matching users found to be removed.");
      }
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

  return (
    <Fragment>
      {membersDetails.length > 0 && (
        <Fragment>
          <hr className="border-line"></hr>
          <h2>
            <FormattedMessage defaultMessage="Manage added students" id="manageGroup-heading" />
          </h2>

          <ol className="listed-steps">
            <li>
              <FormattedMessage
                defaultMessage="You can select by using the corresponding checkboxes and copy several/all entire rows at once, or just the individual EPPN/username with the copy icon next to it."
                id="manageGroup-listItem1"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage="If you get a new password by clicking NEW PASSWORD, it must be used by the student for the exam, as the previous password will be invalid."
                id="manageGroup-listItem2"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage="If you need to make changes to added students, sort the table by entry-order or names, select row/s and click the REMOVE-button, you can now add the student again if needed, in the same way - but with a new EPPN/username and password."
                id="manageGroup-listItem3"
              />
            </li>
          </ol>
          <div className="flex-between form-controls">
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
                    {member.externalId}
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
            defaultMessage="Remove students in organisation"
            id="manageGroup-removeMembersDialogHeading"
          />
        }
        mainText={
          <FormattedMessage
            defaultMessage={`Are you sure you want to delete ${isMemberSelected.length} students? If so, please press the OK button below.`}
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
