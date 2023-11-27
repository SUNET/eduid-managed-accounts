import { useEffect, useRef } from "react";
import { GroupMember } from "typescript-clients/scim/models/GroupMember";
import {
  createGroup,
  getGroupDetails,
  getGroupsSearch,
  putGroup,
} from "../apis/scimGroupsRequest";
import { deleteUser, getUserDetails, postUser } from "../apis/scimUsersRequest";
import { useAppDispatch, useAppSelector } from "../hooks";

export const MANAGED_ACCOUNTS_GROUP_ID = "9ccc1331-fd60-4715-8728-962c35034f33";
//TODO: change to GROUP_NAME  = "managed-accounts";
export const GROUP_NAME = "Test Group 1";

export default function GroupManagement() {
  const dispatch = useAppDispatch();

  const managedAccountsDetails = useAppSelector(
    (state) => state.groups.managedAccounts
  );
  const membersDetails = useAppSelector((state) => state.members.members);
  const familyNameRef = useRef<HTMLInputElement | null>(null);
  const givenNameRef = useRef<HTMLInputElement | null>(null);
  const filterString = useRef<HTMLInputElement | null>(null);
  // TODO: only for carinas test
  // const members = [
  //   {
  //     value: "d8b7003c-312a-4edb-ab71-a1481dc914af",
  //     $ref: "https://api.eduid.docker/scim/Users/d8b7003c-312a-4edb-ab71-a1481dc914af",
  //     display: "mouse donald",
  //   },
  //   {
  //     value: "423bc5d8-43ff-4fda-b6f0-1215a2e96331",
  //     $ref: "https://api.eduid.docker/scim/Users/423bc5d8-43ff-4fda-b6f0-1215a2e96331",
  //     display: "mouse micke",
  //   },
  //   {
  //     value: "3f8c6a39-2568-4741-bada-a6e2a700c673",
  //     $ref: "https://api.eduid.docker/scim/Users/3f8c6a39-2568-4741-bada-a6e2a700c673",
  //     display: "eunju  Huss",
  //   },
  //   {
  //     value: "c81fc19a-dd38-4d97-a757-58a544b3ec7c",
  //     $ref: "https://api.eduid.docker/scim/Users/c81fc19a-dd38-4d97-a757-58a544b3ec7c",
  //     display: "anka kalle",
  //   },
  // ];

  /**
   * Without user interaction
   * 1 - Search for a "managed-accounts" Group
   * 2 - If the Group is not found, create a new Group "managed-accounts" and save the Group ID in the state ManagedAccountsGroup
   * 3 - If the Group is found, set the Group ID in the state ManagedAccountsGroup and show the Users in the Group
   */
  useEffect(() => {
    console.log("FIRST ACTION");
    const initializeManagedAccountsGroup = async () => {
      const result: any = await dispatch(
        getGroupsSearch({ searchFilter: GROUP_NAME })
      );
      if (getGroupsSearch.fulfilled.match(result)) {
        if (!result.payload.Resources?.length) {
          // create a new Group "managed-accounts" and set the Group ID in the state
          dispatch(createGroup({ displayName: GROUP_NAME }));
        } else if (result.payload.Resources?.length === 1) {
          // normal case
          //setManagedAccountsGroup(result.payload.Resources[0]);
          const response = await dispatch(
            getGroupDetails({ id: result.payload.Resources[0].id })
          );
          if (getGroupDetails.fulfilled.match(response)) {
            response.payload.members.map((member: any) => {
              dispatch(getUserDetails({ id: member.value }));
            });
          }
        } else {
          // if more groups are found, show message to contact eduID support
        }
        console.log("LAST ACTION");
      }
    };
    initializeManagedAccountsGroup();
  }, []);

  // useEffect(() => {
  //   const fetchScimTest = async () => {
  //     dispatch(fetchGroups());
  //   };
  //   fetchScimTest();
  // }, []);

  // function getGroupsSearch1(e: any) {
  //   e.preventDefault();
  //   const filterStringValue = filterString?.current?.value;
  //   if (filterStringValue) {
  //     dispatch(getGroupsSearch({ searchFilter: filterStringValue }));
  //   }
  // }

  // const renderHeader = () => {
  //   let headerElement = ["Group name", ""];

  //   return headerElement.map((key, index) => {
  //     return (
  //       <th className={key} key={index}>
  //         {key}
  //       </th>
  //     );
  //   });
  // };

  const saveUser = async (e: any) => {
    e.preventDefault();
    const givenName = document.querySelector(
      '[name="given_name"]'
    ) as HTMLInputElement;
    const familyName = document.querySelector(
      '[name="family_name"]'
    ) as HTMLInputElement;
    //POST USER
    if (givenName.value && familyName.value) {
      const createdUserResponse = await dispatch(
        postUser({
          familyName: familyName.value,
          givenName: givenName.value,
        })
      );
      if (postUser.fulfilled.match(createdUserResponse)) {
        e.target.reset();
        // update "version" for ManagedAccountsGroup before PUT
        // const result = await dispatch(
        //   getGroupDetails({ id: managedAccountsDetails.id })
        // );
        // if (getGroupDetails.fulfilled.match(result)) {

        const newGroupMember: GroupMember = {
          $ref: createdUserResponse.payload.meta?.location,
          value: createdUserResponse.payload.id,
          display:
            createdUserResponse.payload.name.familyName +
            " " +
            createdUserResponse.payload.name.givenName,
        };

        const newMembersList = managedAccountsDetails.members?.slice(); // copy array
        newMembersList?.push(newGroupMember);

        const updatedGroupResponse = await dispatch(
          putGroup({
            result: {
              ...managedAccountsDetails,
              members: newMembersList,
            },
          })
        );

        // if (putGroup.fulfilled.match(updatedGroupResponse)) {
        //   // const response = await dispatch(fetchGroups());
        //   // if (fetchGroups.fulfilled.match(response)) {
        //   dispatch(getGroupDetails({ id: MANAGED_ACCOUNTS_GROUP_ID }));
        //   // }
      }
    }
  };

  const removeUser = async (id: any) => {
    // 1. Remove User from Group
    const filteredUser = managedAccountsDetails?.members?.filter(
      (user: any) => user.value !== id
    );
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
      const memberToBeRemoved = membersDetails?.filter(
        (user: any) => user.id === id
      )[0];
      const user = {
        id: id,
        version: memberToBeRemoved.meta.version,
      };
      dispatch(deleteUser({ user }));
      // const response = await dispatch(deleteUser({ user }));
      // if (deleteUser.fulfilled.match(response)) {
      //   dispatch(getGroupDetails({ id: groupID }));
      // }
    }
    // }
    // }
  };

  return (
    <>
      {/* <Splash showChildren={managedAccountsDetails.id}> */}
      <section className="intro">
        <h1>Welcome to Managing Accounts using eduID</h1>
        <div className="lead">
          <p>
            In the form below you can manage your group by adding students as
            members, to create the unique identifier - EPPN - and the password
            that they will need to be able to perform the Digital National Exam.{" "}
            <br />
            You can also view the existing group and remove members.
          </p>
        </div>
      </section>
      <section>
        <h2>Add member to group</h2>
        <ol className="listed-steps">
          <li>
            Add the given name and surname to manage each member, complete one
            at a time.
          </li>
          <li>
            When you click "ADD" the member will be added to the group as shown
            in the table below.
          </li>
          <li>
            <strong>
              Note the corresponding EPPN and password which appears in the
              members table
            </strong>
            , transfer it to whatever external system of your choice, as you
            will not be able to retrieve it afterwards.
          </li>
        </ol>
        <p>
          <em>
            Write the name so that you can distinguish the identity of the
            person even if there are several students with identical names e.g.
            by adding an initial.
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
            The table shows members of this group. It is not possible to edit
            the already added member, nor retrieve a password once the session
            in which the member was created is ended, but by clicking "REMOVE"
            you can remove the member and if needed create it again -
            <strong> with a new EPPN and password</strong>.
          </p>
          <table className="group-management">
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
              {membersDetails?.map((member: any) => (
                <tr key={member.id}>
                  <td> </td>
                  <td>{member.name.familyName}</td>
                  <td>{member.name.givenName}</td>
                  <td> {member.externalId}</td>
                  <td> </td>
                  <td>
                    <button
                      className="btn btn-link btn-sm"
                      onClick={() => removeUser(member.id)}
                    >
                      remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </section>
    </>
    // </Splash>
  );
}
