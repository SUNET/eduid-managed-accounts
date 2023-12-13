import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useEffect, useState } from "react";
import { putGroup } from "../apis/scimGroupsRequest";
import { deleteUser } from "../apis/scimUsersRequest";
import { fakePassword } from "../common/testEPPNData";
import { useAppDispatch, useAppSelector } from "../hooks";
import { getUsersSlice } from "../slices/getUsers";
import NotificationModal from "./NotificationModal";
import Pagination from "./Pagination";

export default function MembersList({ membersDetails, members, setMembers, accessToken }: any) {
  const [tooltipCopied, setTooltipCopied] = useState(false);
  const [copiedRowToClipboard, setCopiedRowToClipboard] = useState(false);
  const isMemberSelected = members.filter((member: any) => member.selected);
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

  const [selectedValue, setSelectedValue] = useState("");
  const [sortedData, setSortedData] = useState(currentPosts);

  useEffect(() => {
    setCurrentPage(1);
    setSortedData(currentPosts);
  }, [members]);

  useEffect(() => {
    setSelectAll(false);
    setMembers(membersDetails.map((member: any) => ({ ...member, selected: false })));
  }, [membersDetails]);

  const copyToClipboardAllMembers = () => {
    const memberGivenName = isMemberSelected.map((member: any) => member.name.givenName);
    const memberFamilyName = isMemberSelected.map((member: any) => member.name.familyName);
    const memberEPPN = isMemberSelected.map((member: any) => member.externalId);
    const memberPassword = isMemberSelected.map((member: any) => member.password);

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
  };

  const copyToClipboard = (id: string) => {
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
  const selectedUserIds = isMemberSelected?.map((user: any) => user.id) || [];

  const removeSelectedUser = async () => {
    const currentUsers = managedAccountsDetails?.members?.filter((user: any) => !selectedUserIds.includes(user.value));
    const putGroupResponse = await dispatch(
      putGroup({
        result: {
          ...managedAccountsDetails,
          members: currentUsers,
        },
        accessToken: accessToken,
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
  };

  const showAllMembers = () => {
    setCurrentPage(1);
    setPostsPerPage(membersDetails.length);
    setShowAll(true);
  };

  const showLessMembers = () => {
    setCurrentPage(1);
    setPostsPerPage(10);
    setShowAll(false);
  };

  const handleRemoveUsers = () => {
    if (selectedUserIds.length >= 2) {
      setShowModal(true);
    } else {
      removeSelectedUser();
    }
  };

  const generateNewPassword = (id: string) => {
    const generatedPassword = fakePassword();
    const memberWithGeneratedPassword = membersDetails.map((member: any) =>
      member.id === id ? { ...member, password: generatedPassword } : member
    );

    dispatch(getUsersSlice.actions.generatedNewPassword(memberWithGeneratedPassword));
  };

  const handleSorting = (e: any) => {
    const value = e.target.value;
    setSelectedValue(value);

    let newData = [...currentPosts];
    if (value === "givenName") {
      newData.sort((a, b) => a.name.givenName.localeCompare(b.name.givenName));
    } else if (value === "surName") {
      newData.sort((a, b) => a.name.familyName.localeCompare(b.name.familyName));
    } else {
      newData.sort((a, b) => a.meta.created.localeCompare(b.meta.created));
    }
    setSortedData(newData);
  };

  return (
    <Fragment>
      {membersDetails.length > 0 && (
        <Fragment>
          <hr className="border-line"></hr>
          <h2>Manage members in group</h2>
          <p>
            The table shows members of this group. It is not possible to edit the already added member, nor retrieve a
            password once the session in which the member was created is ended, but by clicking "REMOVE" you can remove
            the member and if needed create it again -<strong> with a new EPPN and password</strong>.
          </p>
          <div className="form-controls">
            <div className="flex-between">
              <label>Edit selected rows:</label>
              <div className="buttons">
                {membersDetails.length >= 11 &&
                  (showAll ? (
                    <button
                      disabled={!membersDetails.length}
                      className={`btn btn-sm btn-secondary`}
                      onClick={() => showLessMembers()}
                    >
                      show less
                    </button>
                  ) : (
                    <button
                      disabled={!membersDetails.length}
                      className={`btn btn-sm btn-primary`}
                      onClick={() => showAllMembers()}
                    >
                      show all({membersDetails.length})
                    </button>
                  ))}

                <button
                  disabled={!isMemberSelected.length}
                  className={`btn btn-sm ${copiedRowToClipboard ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => copyToClipboardAllMembers()}
                >
                  {copiedRowToClipboard ? "Copied row" : "Copy row"}
                </button>
                <button
                  disabled={!isMemberSelected.length}
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleRemoveUsers()}
                >
                  Remove row
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
                    <label htmlFor="selectAll">All</label>
                  </span>
                </th>
                <th>Given name</th>
                <th>Surname</th>
                <th>EPPN</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              {sortedData?.map((member: any, index: number) => (
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
                        {tooltipCopied ? <span>Copied</span> : <span>Copy eppn</span>}
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
                        New password
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
        title="Remove members in group"
        mainText={`Are you sure you want to delete ${isMemberSelected.length} members? If so, please press the OK button below.`}
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
