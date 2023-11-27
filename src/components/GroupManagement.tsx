import { useEffect, useRef } from "react";
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
  // const members = useAppSelector((state) => state.groups.members);
  const searchedGroups = useAppSelector((state) => state.groups.searchedGroups);
  const familyNameRef = useRef<HTMLInputElement | null>(null);
  const givenNameRef = useRef<HTMLInputElement | null>(null);
  const filterString = useRef<HTMLInputElement | null>(null);
  // TODO: only for carinas test
  const members = [
    {
      value: "d8b7003c-312a-4edb-ab71-a1481dc914af",
      $ref: "https://api.eduid.docker/scim/Users/d8b7003c-312a-4edb-ab71-a1481dc914af",
      display: "mouse donald",
    },
    {
      value: "423bc5d8-43ff-4fda-b6f0-1215a2e96331",
      $ref: "https://api.eduid.docker/scim/Users/423bc5d8-43ff-4fda-b6f0-1215a2e96331",
      display: "mouse micke",
    },
    {
      value: "3f8c6a39-2568-4741-bada-a6e2a700c673",
      $ref: "https://api.eduid.docker/scim/Users/3f8c6a39-2568-4741-bada-a6e2a700c673",
      display: "eunju  Huss",
    },
    {
      value: "c81fc19a-dd38-4d97-a757-58a544b3ec7c",
      $ref: "https://api.eduid.docker/scim/Users/c81fc19a-dd38-4d97-a757-58a544b3ec7c",
      display: "anka kalle",
    },
  ];

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
            const response = await dispatch(fetchGroups());
            if (fetchGroups.fulfilled.match(response)) {
              dispatch(getGroupDetails({ id: MANAGED_ACCOUNTS_GROUP_ID }));
            }
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
        <h1>Welcome to Managing Accounts using eduID</h1>
        <div className="lead">
          <p>
            In the form below you can manage your group by adding students as members, to create the unique identifier -
            EPPN - and the password that they will need to be able to perform the Digital National Exam. <br />
            You can also view the existing group and remove members.
          </p>
        </div>
      </section>
      <section>
        <h2>Add member to group</h2>
        <ol className="listed-steps">
          <li>Add the given name and surname to manage each member, complete one at a time.</li>
          <li>When you click "ADD" the member will be added to the group as shown in the table below.</li>
          <li>
            <strong>Note the corresponding EPPN and password which appears in the members table</strong>, transfer it to
            whatever external system of your choice, as you will not be able to retrieve it afterwards.
          </li>
        </ol>
        <p>
          <em>
            Write the name so that you can distinguish the identity of the person even if there are several students
            with identical names e.g. by adding an initial.
          </em>
        </p>

        <form onSubmit={(e) => saveUser(e)}>
          <div className="flex-between">
            <fieldset>
              <label>Given name*</label>
              <input type="text" ref={givenNameRef} name="given_name"></input>
            </fieldset>
            <fieldset>
              <label>Surname*</label>
              <input type="text" ref={familyNameRef} name="family_name"></input>
            </fieldset>
            <div className="buttons">
              <button className="btn-primary">Add</button>
            </div>
          </div>

          <h2>Manage members in group</h2>
          <p>
            The table shows members of this group. It is not possible to edit the already added member, nor retrieve a
            password once the session in which the member was created is ended, but by clicking "REMOVE" you can remove
            the member and if needed create it again -<strong> with a new EPPN and password</strong>.
          </p>
          <table className="group-management">
            <caption>
              {/* only for test */}
              <button className="btn-link" onClick={() => dispatch(getGroupDetails({ id: MANAGED_ACCOUNTS_GROUP_ID }))}>
                View Managed accounts Group Members
              </button>
            </caption>
            <thead>
              <tr>
                <th>No.</th>
                <th>Given name</th>
                <th>Surname</th>
                <th>EPPN</th>
                <th>Password</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members?.map((member: any) => (
                <tr key={member.value}>
                  <td> </td>
                  <td>{member.display}</td>
                  <td>{member.display}</td>
                  <td> </td>
                  <td> </td>
                  <td>
                    <button className="btn btn-link btn-sm" onClick={() => removeUser(member.value)}>
                      remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </section>
      {/* hämtar användaren */}
    </Splash>
  );
}
