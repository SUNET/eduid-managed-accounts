import { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import { FormattedMessage } from "react-intl";
import { GroupMember } from "typescript-clients/scim/models/GroupMember";
import { createGroup, getGroupDetails, getGroupsSearch, putGroup } from "../apis/scimGroupsRequest";
import { getUserDetails, postUser } from "../apis/scimUsersRequest";
import { validNationalIDNumber } from "../common/nationalIDNumber";
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
              const members = response.payload.members;
              if (members) {
                await Promise.all(
                  members?.map(async (member: any) => {
                    await dispatch(getUserDetails({ id: member.value }));
                  })
                );
                dispatch(getUsersSlice.actions.sortMembers());
              }
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

  function containsNationalIDNumber(params: string) {
    // 0 -filter out all non-digits
    const inputNumbers = params.replace(/\D/g, "");
    // 1 - if less than 10 digits, return false
    const ID_NUMBER_MAX_LENGTH = 10;
    if (inputNumbers.length < ID_NUMBER_MAX_LENGTH) {
      return false;
    } else {
      // 2 - else, test the first 8 characters and validNationalIDNumber()
      for (let i = 0; i < inputNumbers.length - 10 + 1; i++) {
        if (validNationalIDNumber(inputNumbers.substring(i, i + ID_NUMBER_MAX_LENGTH))) {
          return true;
        }
      }
    }
  }

  const validatePersonalData = (values: any) => {
    const errors: any = {};
    if (values !== undefined) {
      ["given_name", "surname"].forEach((inputName) => {
        // check if the input is empty
        if (!values[inputName]) {
          errors[inputName] = <FormattedMessage defaultMessage="Required" id="addToGroup-emptyValidation" />;
          // check if it is national ID number
        } else if (containsNationalIDNumber(values[inputName])) {
          errors[inputName] = (
            <FormattedMessage
              defaultMessage="It is not allowed to save a national ID number"
              id="addToGroup-ninValidation"
            />
          );
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
        <h1>
          <FormattedMessage defaultMessage="Welcome to Managing Accounts using eduID" id="intro-heading" />
        </h1>
        <div className="lead">
          <p>
            <FormattedMessage
              defaultMessage="In the form below you can manage your group by adding students as members, to create the unique identifier -
            EPPN - and the password that they will need to be able to perform the Digital National Exam.
            You can also view the existing group and remove members."
              id="intro-lead"
            />
          </p>
        </div>
      </section>
      <section>
        <h2>
          <FormattedMessage defaultMessage="Add member to group" id="addToGroup-heading" />
        </h2>
        <ol className="listed-steps">
          <li>
            <FormattedMessage
              defaultMessage="Add the given name and surname to manage each member, complete one at a time."
              id="addToGroup-listItem1"
            />
          </li>
          <li>
            <FormattedMessage
              defaultMessage='When you click "ADD" the member will be added to the group as shown in the table below.'
              id="addToGroup-listItem2"
            />
          </li>
          <li>
            <strong>
              <FormattedMessage
                defaultMessage="Note the corresponding EPPN and password which appears in the members table"
                id="addToGroup-listItem3Strong"
              />
            </strong>
            ,&nbsp;
            <FormattedMessage
              defaultMessage="transfer it to whatever external system of your choice, as you will not be able to retrieve it afterwards."
              id="addToGroup-listItem3"
            />
          </li>
        </ol>
        <p>
          <em>
            <FormattedMessage
              defaultMessage="Write the name so that you can distinguish the identity of the person even if there are several students
                with identical names e.g. by adding an initial."
              id="addToGroup-hint"
            />
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
                      <label htmlFor="givenName">
                        <FormattedMessage defaultMessage="Given name*" id="addToGroup-givenName" />
                      </label>
                      <input type="text" {...input} placeholder="given name" id="givenName" />
                      {meta.touched && meta.error && <span className="input-validate-error">{meta.error}</span>}
                    </fieldset>
                  )}
                </Field>

                <Field name="surname">
                  {({ input, meta }) => (
                    <fieldset>
                      <label htmlFor="surName">
                        <FormattedMessage defaultMessage="Surname*" id="addToGroup-surname" />
                      </label>
                      <input type="text" {...input} placeholder="surname" id="surName" />
                      {meta.touched && meta.error && <span className="input-validate-error">{meta.error}</span>}
                    </fieldset>
                  )}
                </Field>

                <button disabled={submitting || invalid} className="btn btn-primary">
                  <FormattedMessage defaultMessage="Add" id="addToGroup-addButton" />
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
