import { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import { GroupMember } from "typescript-clients/scim/models/GroupMember";
import { createGroup, getGroupDetails, getGroupsSearch, putGroup } from "../apis/scimGroupsRequest";
import { getUserDetails, postUser } from "../apis/scimUsersRequest";
import { onlyLetters } from "../common/regexPattern";
import { useAppDispatch, useAppSelector } from "../hooks";
import getGroupsSlice from "../slices/getGroups";
import getUsersSlice from "../slices/getUsers";
import MembersList from "./MembersList";

//TODO: change to GROUP_NAME  = "managed-accounts";
export const GROUP_NAME = "Test Group 1";

export default function GroupManagement() {
  const dispatch = useAppDispatch();

  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const membersDetails = useAppSelector((state) => state.members.members);

  /**
   * Without user interaction
   * 1 - Search for a "managed-accounts" Group
   * 2 - If the Group is not found, create a new Group "managed-accounts" and save the Group ID in the state ManagedAccountsGroup
   * 3 - If the Group is found, set the Group ID in the state ManagedAccountsGroup and show the Users in the Group
   */
  useEffect(() => {
    const initializeManagedAccountsGroup = async () => {
      try {
        dispatch(getUsersSlice.actions.initialize());
        dispatch(getGroupsSlice.actions.initialize());
        const result: any = await dispatch(getGroupsSearch({ searchFilter: GROUP_NAME }));
        if (getGroupsSearch.fulfilled.match(result)) {
          if (!result.payload.Resources?.length) {
            dispatch(createGroup({ displayName: GROUP_NAME }));
          } else if (result.payload.Resources?.length === 1) {
            const response = await dispatch(getGroupDetails({ id: result.payload.Resources[0].id }));
            if (getGroupDetails.fulfilled.match(response)) {
              response.payload.members?.map((member: any) => {
                dispatch(getUserDetails({ id: member.value }));
              });
            }
          }
        }
      } catch (error) {
        console.log("Error", error);
      }
    };
    initializeManagedAccountsGroup();
  }, []);

  const addUser = async (values: any) => {
    if (values.given_name && values.surname) {
      try {
        const createdUserResponse = await dispatch(
          postUser({
            familyName: values.surname,
            givenName: values.given_name,
          })
        );
        if (postUser.fulfilled.match(createdUserResponse)) {
          const newGroupMember: GroupMember = {
            $ref: createdUserResponse.payload.meta?.location,
            value: createdUserResponse.payload.id,
            display: createdUserResponse.payload.name?.familyName + " " + createdUserResponse.payload.name?.givenName,
          };

          const newMembersList = managedAccountsDetails.members?.slice(); // copy array
          newMembersList?.push(newGroupMember);

          await dispatch(
            putGroup({
              result: {
                ...managedAccountsDetails,
                members: newMembersList,
              },
            })
          );
        }
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const validatePersonalData = (values: any) => {
    const errors: any = {};
    if (values !== undefined) {
      ["given_name", "surname"].forEach((inputName) => {
        if (!values[inputName] || !onlyLetters.test(values[inputName])) {
          errors[inputName] = "Only letters permitted";
        }
      });
    }
    return errors;
  };

  const [members, setMembers] = useState<any[]>([]);

  return (
    <>
      {/* <Splash showChildren={managedAccountsDetails.id}> */}
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

        <Form
          validate={validatePersonalData}
          onSubmit={(e) => addUser(e)}
          render={({ handleSubmit, form, submitting, pristine, values, invalid }) => (
            <form
              onSubmit={async (event) => {
                await handleSubmit(event);
                form.reset();
              }}
            >
              <div className="flex-between">
                <Field name="given_name">
                  {({ input, meta }) => (
                    <fieldset>
                      <label>Given name*</label>
                      <input type="text" {...input} placeholder="given name" />
                      {meta.touched && meta.error && <span className="input-validate-error">{meta.error}</span>}
                    </fieldset>
                  )}
                </Field>

                <Field name="surname">
                  {({ input, meta }) => (
                    <fieldset>
                      <label>Surname*</label>
                      <input type="text" {...input} placeholder="surname" />
                      {meta.touched && meta.error && <span className="input-validate-error">{meta.error}</span>}
                    </fieldset>
                  )}
                </Field>

                <button disabled={submitting || invalid} className="btn btn-primary">
                  Add
                </button>
              </div>
            </form>
          )}
        />
      </section>
      <section>
        <MembersList members={members} setMembers={setMembers} membersDetails={membersDetails} />
      </section>
    </>
    // </Splash>
  );
}
