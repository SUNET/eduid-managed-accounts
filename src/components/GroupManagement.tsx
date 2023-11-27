import React, { useEffect, useRef } from "react";
import { fetchGroups, getGroupDetails, getGroupsSearch, putGroup } from "../apis/scimGroupsRequest";
import { deleteUser, getUserDetails, postUser } from "../apis/scimUsersRequest";
import { useAppDispatch, useAppSelector } from "../hooks";
import Splash from "./Splash";

export const MANAGED_ACCOUNTS_GROUP_ID = "16bda7c5-b7f7-470a-b44a-0a7a32b4876c";
//TODO: change to GROUP_NAME  = "managed-accounts";
export const GROUP_NAME = "Test Group 1";

export default function GroupManagement() {
  const dispatch = useAppDispatch();

  const groupsData = useAppSelector((state) => state.groups.groups);
  const members = useAppSelector((state) => state.groups.members);
  const searchedGroups = useAppSelector((state) => state.groups.searchedGroups);
  const familyNameRef = useRef<HTMLInputElement | null>(null);
  const givenNameRef = useRef<HTMLInputElement | null>(null);
  const filterString = useRef<HTMLInputElement | null>(null);

  /**
   * Without user interaction
   * 1 - Search for a "managed-accounts" Group
   * 2 - If the Group is not found, create a new Group "managed-accounts" and save the Group ID in the state ManagedAccountsGroup
   * 3 - If the Group is found, set the Group ID in the state ManagedAccountsGroup and show the Users in the Group
   */
  useEffect(() => {
    console.log("FIRST ACTION");
    const findManagedAccountsGroup = async () => {
      const result: any = await dispatch(getGroupsSearch({ searchFilter: GROUP_NAME }));
      if (getGroupsSearch.fulfilled.match(result)) {
        if (result.payload.Resources?.length === 0) {
          // create a new Group "managed-accounts" and set the Group ID in the state
          // dispatch(createGroup({ groupName: GROUP_NAME }))
        } else if (result.payload.Resources?.length === 1) {
          // normal case
          //setManagedAccountsGroup(result.payload.Resources[0]);
          console.log("setManagedAccountsGroup: ", result.payload.Resources[0]);
          console.log("searchedGroups: ", searchedGroups);
        } else {
          // if more groups are found, show message to contact eduID support
        }
        console.log("LAST ACTION");
      }
    };
    findManagedAccountsGroup();
  }, []);

  useEffect(() => {
    const fetchScimTest = async () => {
      dispatch(fetchGroups());
    };
    fetchScimTest();
  }, []);

  function getGroupsSearch1(e: any) {
    e.preventDefault();
    const filterStringValue = filterString?.current?.value;
    if (filterStringValue) {
      dispatch(getGroupsSearch({ searchFilter: filterStringValue }));
    }
  }

  const renderHeader = () => {
    let headerElement = ["Group name", ""];

    return headerElement.map((key, index) => {
      return (
        <th className={key} key={index}>
          {key}
        </th>
      );
    });
  };

  const saveUser = async (e: any) => {
    e.preventDefault();
    // TODO
    const givenName = document.querySelector('[name="given_name"]') as HTMLInputElement;
    const familyName = document.querySelector('[name="family_name"]') as HTMLInputElement;
    //POST USER
    if (givenName.value && familyName.value) {
      const response = await dispatch(
        postUser({
          familyName: familyName.value,
          givenName: givenName.value,
        })
      );
      if (postUser.fulfilled.match(response)) {
        // update "version" for ManagedAccountsGroup before PUT
        const result = await dispatch(getGroupDetails({ id: MANAGED_ACCOUNTS_GROUP_ID }));
        if (getGroupDetails.fulfilled.match(result)) {
          console.log("result", result);
          const addedUserResult = await dispatch(
            putGroup({
              result: {
                ...result.payload,
                members: [
                  ...result.payload.members,
                  {
                    $ref: response.payload.meta?.location,
                    value: response.payload.id,
                    display: response.payload.name.familyName + " " + response.payload.name.givenName,
                  },
                ],
              },
            })
          );

          if (putGroup.fulfilled.match(addedUserResult)) {
            dispatch(fetchGroups());
          }
        }
      }
    }
  };

  const removeUser = async (id: any) => {
    // 1. get group details -> payload group version
    const groupID = groupsData[0].id;

    const result = await dispatch(getGroupDetails({ id: groupID }));

    const filteredUser = result.payload.members.filter((user: any) => user.value !== id);
    // 2. tar bort user from group  -> put group
    if (getGroupDetails.fulfilled.match(result)) {
      const putFilteredUserResult = await dispatch(
        putGroup({
          result: {
            ...result.payload,
            members: filteredUser,
          },
        })
      );

      if (putGroup.fulfilled.match(putFilteredUserResult)) {
        const userDetailsResult = await dispatch(getUserDetails({ id: id }));
        //4. DELETE user
        if (getGroupDetails.fulfilled.match(result)) {
          const user = {
            id: id,
            version: userDetailsResult.payload.meta.version,
          };

          dispatch(deleteUser({ user }));
        }
      }
    }
  };

  return (
    <Splash showChildren={groupsData.length > 0}>
      <section className="intro">
        <h1>Welcome</h1>
        <div className="lead">
          <p>You can search through your groups here and provide detailed information.</p>
        </div>
      </section>
      <section>
        <form onSubmit={(e) => saveUser(e)}>
          <fieldset>
            <label>Given name</label>
            <input type="text" name="givenName"></input>
          </fieldset>
          <fieldset>
            <label>Middle name (optional)</label>
            <input type="text" name="middleName"></input>
          </fieldset>
          <fieldset>
            <label>Surname</label>
            <input type="text" name="familyName"></input>
          </fieldset>
          <div className="buttons">
            <button className="btn-primary">Create</button>
          </div>
          <br />
          <table>
            <thead>
              <tr>
                <th>Given name*</th>
                <th>Middle name</th>
                <th>Surname*</th>
                <th>EPPN</th>
                <th>Password</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <button>Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </section>
      {/* hämtar användaren */}
      <article className="intro">
        <form onSubmit={(e) => getGroupsSearch1(e)}>
          <label>Search groups</label>
          <input className="form-control" name="filter_string" ref={filterString} />
          <div className="buttons">
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </div>
        </form>
      </article>
      <article className="intro">
        <h2>Groups</h2>
        <p>Click on a group to see more details about it.</p>
        <table>
          <thead>
            <tr>{renderHeader()}</tr>
          </thead>
          <tbody>
            {groupsData?.map((group: any) => (
              <tr key={group.id}>
                <td>{group.displayName}</td>
                <td>
                  <button className="btn-link btn-sm" onClick={() => dispatch(getGroupDetails({ id: group.id }))}>
                    see more
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members?.map((member: any) => (
          <React.Fragment key={member.value}>
            <li>{member.display}</li>
            <button className="btn btn-primary" onClick={() => removeUser(member.value)}>
              remove
            </button>
          </React.Fragment>
        ))}

        <br />
      </article>
      <div>
        <h2> Users</h2>
        <form onSubmit={saveUser} style={{ display: "flex" }}>
          <div>
            <label>Family name</label>
            <input name="family_name" ref={familyNameRef} />
          </div>

          <div>
            <label>Given name</label>
            <input name="given_name" ref={givenNameRef} />
          </div>

          <button className="btn btn-primary" type="submit">
            create user
          </button>
        </form>
      </div>
    </Splash>
  );
}
