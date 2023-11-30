import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useEffect, useState } from "react";
import { putGroup } from "../apis/scimGroupsRequest";
import { deleteUser } from "../apis/scimUsersRequest";
import { useAppDispatch, useAppSelector } from "../hooks";

export default function MembersList({ currentPosts, membersDetails, members, setMembers }: any) {
  const [tooltipCopied, setTooltipCopied] = useState(false);
  const isMemberSelected = members.filter((member: any) => member.selected);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setSelectAll(false);
    setMembers(membersDetails.map((member: any) => ({ ...member, selected: false })));
  }, [membersDetails]);

  const copyToClipboardAllMembers = () => {
    const membersString = isMemberSelected.map((member: any) => member.externalId).join(", ");
    const TempText = document.createElement("input");
    TempText.value = membersString;
    document.body.appendChild(TempText);
    TempText.select();

    document.execCommand("copy");
    document.body.removeChild(TempText);
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

  const removeUser = async (id: any) => {
    // 1. Remove User from Group
    const filteredUser = managedAccountsDetails?.members?.filter((user: any) => user.value !== id);
    const putFilteredUserResult = await dispatch(
      putGroup({
        result: {
          ...managedAccountsDetails,
          members: filteredUser,
        },
      })
    );

    // 2. Delete User
    if (putGroup.fulfilled.match(putFilteredUserResult)) {
      const memberToBeRemoved = membersDetails?.filter((user: any) => user.id === id)[0];
      const user = {
        id: id,
        version: memberToBeRemoved.meta.version,
      };
      dispatch(deleteUser({ user }));
    }
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

            await dispatch(deleteUser({ user: userToDelete }));
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
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboardAllMembers()}
              >
                Copy to clipboard
              </button>
              <button
                disabled={!isMemberSelected.length}
                className="btn btn-secondary btn-sm"
                onClick={() => removeSelectedUser()}
              >
                remove
              </button>
            </div>
          </div>
          <table className="group-management">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={selectAll} onChange={() => handleSelectAll()} />
                </th>
                <th>No.</th>
                <th>Given name</th>
                <th>Surname</th>
                <th>EPPN</th>
                <th>Password</th>
                <th></th>
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
                        {tooltipCopied ? <p>Copied!</p> : <p>Copy to clipboard!</p>}
                      </div>
                    </button>
                  </td>
                  <td> </td>
                  <td>
                    <button className="btn btn-link btn-sm" onClick={() => removeUser(member.id)}>
                      remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Fragment>
      )}
    </Fragment>
  );
}