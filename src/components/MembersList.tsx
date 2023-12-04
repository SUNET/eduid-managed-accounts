import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useEffect, useState } from "react";
import { putGroup } from "../apis/scimGroupsRequest";
import { deleteUser } from "../apis/scimUsersRequest";
import { useAppDispatch, useAppSelector } from "../hooks";
import NotificationModal from "./NotificationModal";

export default function MembersList({ currentPosts, membersDetails, members, setMembers }: any) {
  const [tooltipCopied, setTooltipCopied] = useState(false);
  const [copiedRowToClipboard, setCopiedRowToClipboard] = useState(false);
  const isMemberSelected = members.filter((member: any) => member.selected);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    setSelectAll(false);
    setMembers(membersDetails.map((member: any) => ({ ...member, selected: false })));
  }, [membersDetails]);

  const copyToClipboardAllMembers = () => {
    const memberGivenName = isMemberSelected.map((member: any) => member.name.givenName);
    const memberFamilyName = isMemberSelected.map((member: any) => member.name.familyName);
    const memberEPPN = isMemberSelected.map((member: any) => member.externalId);

    const membersArray = [];

    for (let i = 0; i < isMemberSelected.length; i++) {
      const memberInfo = `${memberGivenName[i]}, ${memberFamilyName[i]}, ${memberEPPN[i]}`;
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
  };

  const copyToClipboard = (id: string) => {
    const TempText = document.createElement("input");
    TempText.value = id;
    document.body.appendChild(TempText);
    TempText.select();

    document.execCommand("copy");
    document.body.removeChild(TempText);
    setTooltipCopied(true);
    (document.getElementById("icon-copy") as HTMLInputElement).style.display = "none";
    (document.getElementById("icon-check") as HTMLInputElement).style.display = "inline";
    setTimeout(() => {
      (document.getElementById("icon-copy") as HTMLInputElement).style.display = "inline";
      (document.getElementById("icon-check") as HTMLInputElement).style.display = "none";
      setTooltipCopied(false);
    }, 1000);
  };

  const handleSelectAll = () => {
    setSelectAll((prevState) => !prevState);

    const updatedMembers = members.map((member: any) => ({
      ...member,
      selected: !selectAll,
    }));

    setMembers(updatedMembers);
  };

  const handleSelect = (id: string) => {
    setMembers((prevMembers: any) =>
      prevMembers.map((member: any) => (member.id === id ? { ...member, selected: !member.selected } : member))
    );
    setSelectAll(false);
  };

  const removeSelectedUser = async () => {
    const selectedUserIds = isMemberSelected?.map((user: any) => user.id) || [];
    const currentUsers = managedAccountsDetails?.members?.filter((user: any) => !selectedUserIds.includes(user.value));
    const putGroupResponse = await dispatch(
      putGroup({
        result: {
          ...managedAccountsDetails,
          members: currentUsers,
        },
      })
    );

    if (putGroup.fulfilled.match(putGroupResponse)) {
      const memberToBeRemoved = membersDetails?.filter((user: any) => selectedUserIds.includes(user.id));
      if (memberToBeRemoved && memberToBeRemoved.length > 0) {
        await Promise.all(
          memberToBeRemoved.map(async (user: any) => {
            const userToDelete = {
              id: user.id,
              version: user.meta.version,
            };

            const deleteUserResponse = await dispatch(deleteUser({ user: userToDelete }));
            if (deleteUser.fulfilled.match(deleteUserResponse)) {
              setShowModal(false);
            }
          })
        );
      } else {
        console.warn("No matching users found to be removed.");
      }
    }
  };

  return (
    <Fragment>
      {membersDetails.length > 0 && (
        <Fragment>
          <h2>Manage members in group</h2>
          <p>
            The table shows members of this group. It is not possible to edit the already added member, nor retrieve a
            password once the session in which the member was created is ended, but by clicking "REMOVE" you can remove
            the member and if needed create it again -<strong> with a new EPPN and password</strong>.
          </p>
          <div className="flex-between form-controls">
            <label>Edit selected rows:</label>
            <div className="buttons">
              <button
                disabled={!isMemberSelected.length}
                className={`btn btn-sm ${copiedRowToClipboard ? "btn-primary" : "btn-secondary"}`}
                onClick={() => copyToClipboardAllMembers()}
              >
                {copiedRowToClipboard ? "Copied row to clipboard" : "Copy row to clipboard"}
              </button>
              <button
                disabled={!isMemberSelected.length}
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(true)}
              >
                Remove row
              </button>
            </div>
          </div>
          <table className="group-management">
            <thead>
              <tr>
                <th>
                  <span className="flex-between">
                    <input type="checkbox" checked={selectAll} onChange={() => handleSelectAll()} id="selectAll" />
                    <label htmlFor="selectAll">All</label>
                  </span>
                </th>
                <th>#</th>
                <th>
                  <a href="" title="Sort given name alphabetically / first">
                    Given name &#8645;
                  </a>
                </th>
                <th>
                  <a href="" title="Sort surname alphabetically / first">
                    Surname &#8645;
                  </a>
                </th>
                <th>EPPN</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts?.map((member: any) => (
                <tr key={member.id}>
                  <td>
                    <input type="checkbox" checked={member.selected} onChange={() => handleSelect(member.id)} />
                  </td>
                  <td> </td>
                  <td>{member.name.givenName}</td>
                  <td>{member.name.familyName}</td>
                  <td>
                    {member.externalId}
                    <button
                      id="clipboard"
                      className="icon-only copybutton"
                      onClick={() => copyToClipboard(member.externalId)}
                    >
                      <FontAwesomeIcon id={"icon-copy"} icon={faCopy as IconProp} />
                      <FontAwesomeIcon id={"icon-check"} icon={faCheck as IconProp} />
                      <div className="tool-tip-text" id="tool-tip">
                        {tooltipCopied ? <span>Copied</span> : <span>Copy eppn</span>}
                      </div>
                    </button>
                  </td>
                  <td> </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Fragment>
      )}

      <NotificationModal
        id="remove-selected-users-modal"
        title="Remove all members in group"
        mainText="Are you sure you want to delete all members? If so, please press the OK button below."
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
