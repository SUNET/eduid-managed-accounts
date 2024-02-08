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

interface MembersListTableTypes {
  readonly postsPerPage: number;
  readonly currentPage: number;
}

export function MembersListTable({ postsPerPage, currentPage }: MembersListTableTypes) {
  const dispatch = useAppDispatch();
  const membersDetails = useAppSelector((state) => state.members.members);
  const isMemberSelected = membersDetails.filter((member) => member.selected);
  const isFetching = useAppSelector((state) => state.app.isFetching);
  const [showGeneratePasswordModal, setShowGeneratePasswordModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUserResponse | null>(null);
  const [tooltipCopied, setTooltipCopied] = useState(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = membersDetails.slice(indexOfFirstPost, indexOfLastPost);

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

  useEffect(() => {
    if (membersDetails.length === isMemberSelected.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [membersDetails]);

  function handleSelectAll() {
    dispatch(getUsersSlice.actions.setAllSelected(!selectAll));
  }

  function handleSelect(member: ExtendedUserResponse) {
    dispatch(getUsersSlice.actions.setSelected({ id: member.id, value: !member.selected }));
  }

  function handleGenerateNewPassword(member: ExtendedUserResponse) {
    setSelectedUser(member);
    setShowGeneratePasswordModal(true);
  }

  async function generateNewPassword() {
    if (selectedUser?.externalId) {
      const maccapiUserResponse = await dispatch(resetPassword({ eppn: selectedUser?.externalId?.split("@")[0] }));
      if (resetPassword.fulfilled.match(maccapiUserResponse)) {
        dispatch(
          getUsersSlice.actions.addPassword({
            password: maccapiUserResponse.payload.user.password,
            externalId: selectedUser?.externalId,
          })
        );
        setShowGeneratePasswordModal(false);
        setSelectedUser(null);
      }
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
                      onChange={() => handleSelect(member)}
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
                      onClick={() => handleGenerateNewPassword(member)}
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
            values={{ name: `"${selectedUser?.name.givenName} ${selectedUser?.name.familyName}"` }}
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
