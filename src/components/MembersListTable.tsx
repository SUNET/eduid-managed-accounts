import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { resetPassword } from "../apis/maccapi/request";
import { useAppDispatch, useAppSelector } from "../hooks";
import getUsersSlice, { ExtendedUserResponse } from "../slices/getUsers";
import NotificationModal from "./NotificationModal";
import Splash from "./Splash";

interface MembersDetailsAndSelectedType extends ExtendedUserResponse {
  selected: boolean;
}

interface MembersListTableTypes {
  readonly currentPosts: MembersDetailsAndSelectedType[];
  readonly sortedData: MembersDetailsAndSelectedType[];
  readonly postsPerPage: number;
  readonly currentPage: number;
  readonly setMembers: React.Dispatch<React.SetStateAction<any>>;
}

export function MembersListTable({
  currentPosts,
  sortedData,
  postsPerPage,
  currentPage,
  setMembers,
}: MembersListTableTypes) {
  const membersDetails = useAppSelector((state) => state.members.members);
  const isFetching = useAppSelector((state) => state.app.isFetching);
  const [showGeneratePasswordModal, setShowGeneratePasswordModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string | null;
    familyName: string | null;
    givenName: string | null;
    externalId: string | null;
  }>({ id: null, familyName: null, givenName: null, externalId: null });
  const [tooltipCopied, setTooltipCopied] = useState(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setSelectAll(false);
  }, [membersDetails]);

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
    setSelectAll((prevState: any) => !prevState);
    const updatedMembers = sortedData.map((member: any) => ({
      ...member,
      selected: !selectAll,
    }));

    setMembers(updatedMembers);
  }

  function handleSelect(id: string) {
    setMembers((prevMembers: []) =>
      prevMembers.map((member: { id: string; selected: boolean }) =>
        member.id === id ? { ...member, selected: !member.selected } : member
      )
    );
    setSelectAll(false);
  }

  function handleGenerateNewPassword(id: string) {
    setShowGeneratePasswordModal(true);
    const selectedMember = membersDetails.find((member: any) => member.id === id);
    if (selectedMember) {
      setSelectedUser({
        id: selectedMember.id,
        familyName: selectedMember.name.familyName,
        givenName: selectedMember.name.givenName,
        externalId: selectedMember.externalId,
      });
    }
  }

  async function generateNewPassword() {
    if (selectedUser?.externalId) {
      console.log("selectedUser", selectedUser);
      const response = await dispatch(resetPassword({ eppn: selectedUser?.externalId?.split("@")[0] }));
      const memberWithGeneratedPassword = membersDetails.map((member: any) =>
        member.id === selectedUser.id ? { ...member, password: response.payload.password } : member
      );
      dispatch(
        getUsersSlice.actions.addPassword({
          password: response.payload.user.password,
          externalId: selectedUser?.externalId,
        })
      );
      setShowGeneratePasswordModal(false);
      setSelectedUser({ id: null, familyName: null, givenName: null, externalId: null });
    }
  }

  return (
    <Fragment>
      <Splash showChildren={!isFetching}>
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
              <th id="header-username">
                <FormattedMessage defaultMessage="Username" id="manageGroup-usernameColumn" />
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
                    <label htmlFor={"selectMember" + (index + 1)}>{(currentPage - 1) * postsPerPage + index + 1}</label>
                  </span>
                </td>
                <td>{member.name.givenName}</td>
                <td>{member.name.familyName}</td>
                <td>
                  {
                    member[
                      "https://scim.eduid.se/schema/nutid/user/v1"
                    ].profiles.connectIdp.attributes.eduPersonPrincipalName.split("@")[0]
                  }
                  <button
                    id="clipboard"
                    className="icon-only copybutton"
                    onClick={() =>
                      copyToClipboard(
                        member["https://scim.eduid.se/schema/nutid/user/v1"].profiles.connectIdp.attributes
                          .eduPersonPrincipalName
                      )
                    }
                    disabled={isFetching}
                  >
                    <FontAwesomeIcon
                      id={`icon-copy ${member["https://scim.eduid.se/schema/nutid/user/v1"].profiles.connectIdp.attributes.eduPersonPrincipalName}`}
                      icon={faCopy as IconProp}
                    />
                    <FontAwesomeIcon
                      id={`icon-check ${member["https://scim.eduid.se/schema/nutid/user/v1"].profiles.connectIdp.attributes.eduPersonPrincipalName}`}
                      icon={faCheck as IconProp}
                    />
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
                      onClick={() => handleGenerateNewPassword(member.id)}
                    >
                      <FormattedMessage defaultMessage="New password" id="manageGroup-newPasswordLink" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Splash>

      <NotificationModal
        id="generate-new-password-modal"
        title={
          <FormattedMessage
            defaultMessage="Generate a new password"
            id="manageGroup-generateNewPasswordDialogHeading"
          />
        }
        mainText={
          <FormattedMessage
            defaultMessage="Are you sure you want to generate a new password for {name}? If so, please press the OK button below."
            id="manageGroup-generateNewPasswordDialogParagraph"
            values={{ name: `"${selectedUser.givenName} ${selectedUser.familyName}"` }}
          />
        }
        showModal={showGeneratePasswordModal}
        closeModal={() => {
          setShowGeneratePasswordModal(false);
        }}
        acceptModal={() => generateNewPassword()}
        acceptButtonText="ok"
      />
    </Fragment>
  );
}
