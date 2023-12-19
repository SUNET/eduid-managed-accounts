import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Personnummer from "personnummer";
import React, { useEffect, useRef, useState } from "react";
import { Field, Form } from "react-final-form";
import { FormattedMessage } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { GroupMember } from "typescript-clients/scim/models/GroupMember";
import { createGroup, getGroupDetails, getGroupsSearch, putGroup } from "../apis/scimGroupsRequest";
import { getUserDetails, postUser } from "../apis/scimUsersRequest";
import { useAppDispatch, useAppSelector } from "../hooks";
import getGroupsSlice from "../slices/getGroups";
import getLoggedInUserInfoSlice from "../slices/getLoggedInUserInfo";
import getUsersSlice from "../slices/getUsers";
import MembersList, { MembersDetailsTypes } from "./MembersList";

export const GROUP_NAME = "Managed Accounts";

interface ValidatePersonalData {
  [key: string]: string;
}

interface ErrorsType {
  [key: string]: React.ReactNode;
}

export default function GroupManagement(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state;

  const accessToken = locationState?.access_token?.value;
  const value = locationState?.subject.assertions[0].value;
  const parsedUserInfo = value ? JSON.parse(value) : null;

  const dispatch = useAppDispatch();
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const membersDetails = useAppSelector((state) => state.members.members);

  useEffect(() => {
    if (parsedUserInfo) {
      dispatch(getLoggedInUserInfoSlice.actions.updateUserInfo({ user: parsedUserInfo }));
    }
  }, [parsedUserInfo]);

  useEffect(() => {
    if (locationState === null) {
      return navigate("/");
    }
  }, [navigate, locationState]);

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
        const result = await dispatch(getGroupsSearch({ searchFilter: GROUP_NAME, accessToken: accessToken }));
        if (getGroupsSearch.fulfilled.match(result)) {
          if (!result.payload?.Resources?.length) {
            dispatch(createGroup({ displayName: GROUP_NAME, accessToken: accessToken }));
          } else if (result.payload.Resources?.length === 1) {
            const response = await dispatch(
              getGroupDetails({ id: result.payload.Resources[0].id, accessToken: accessToken })
            );
            if (getGroupDetails.fulfilled.match(response)) {
              const members = response.payload.members;
              if (members) {
                await Promise.all(
                  members?.map(async (member: GroupMember) => {
                    await dispatch(getUserDetails({ id: member.value, accessToken: accessToken }));
                  })
                );
                dispatch(getUsersSlice.actions.sortByLatest());
              }
            }
          }
        }
      } catch (error) {
        console.log("Error", error);
      }
    };
    initializeManagedAccountsGroup();
  }, [dispatch, accessToken]);

  const addUser = async (values: { given_name: string; surname: string }) => {
    if (values.given_name && values.surname) {
      try {
        const eduPersonPrincipalName: string = parsedUserInfo.attributes?.eduPersonPrincipalName;
        const scope = eduPersonPrincipalName.split("@")[1];
        const createdUserResponse = await dispatch(
          postUser({
            familyName: values.surname,
            givenName: values.given_name,
            accessToken: accessToken,
            scope: scope,
          })
        );
        if (postUser.fulfilled.match(createdUserResponse)) {
          const newGroupMember: GroupMember = {
            $ref: createdUserResponse.payload.meta?.location,
            value: createdUserResponse.payload.id,
            display: createdUserResponse.payload.name?.familyName + " " + createdUserResponse.payload.name?.givenName,
          };

          // from here run again in case of "version mismatch"
          const newMembersList = managedAccountsDetails.members?.slice(); // copy array
          newMembersList?.push(newGroupMember);

          const response = await dispatch(
            putGroup({
              group: {
                ...managedAccountsDetails,
                members: newMembersList,
              },
              accessToken: accessToken,
            })
          );
          if (putGroup.rejected.match(response) && response.payload === "Failed with status 400: Version mismatch") {
            const response2 = await dispatch(
              getGroupDetails({ id: managedAccountsDetails.id, accessToken: accessToken })
            );
            if (getGroupDetails.fulfilled.match(response2)) {
              const newMembersList = response2.payload.members?.slice(); // copy array
              newMembersList?.push(newGroupMember);

              const response = await dispatch(
                putGroup({
                  group: {
                    ...response2.payload,
                    members: newMembersList,
                  },
                  accessToken: accessToken,
                })
              );
            }
          }
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
    const ID_NUMBER_MIN_LENGTH = 10;
    if (inputNumbers.length < ID_NUMBER_MIN_LENGTH) {
      return false;
    } else {
      // 2 - else, test the first 10 characters and personnummer library
      for (let i = 0; i < inputNumbers.length - 10 + 1; i++) {
        if (Personnummer.valid(inputNumbers.substring(i, i + ID_NUMBER_MIN_LENGTH))) {
          return true;
        }
      }
    }
  }

  const validatePersonalData = (values: ValidatePersonalData) => {
    const errors: ErrorsType = {};
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

  const [members, setMembers] = useState<Array<MembersDetailsTypes & { selected: boolean }>>([]);
  const [showMore, setShowMore] = useState(true);
  function toggleShowMore() {
    setShowMore(!showMore);
  }

  const inputRef = useRef<HTMLInputElement>(null);

  if (locationState === null) {
    return <></>;
  }

  return (
    <React.Fragment>
      <section className="intro">
        <h1>
          <FormattedMessage
            defaultMessage="Welcome {user}"
            id="intro-heading"
            values={{
              user: parsedUserInfo.attributes.displayName,
            }}
          />
        </h1>
        <div className="lead">
          <p>
            <FormattedMessage
              defaultMessage="In the forms below you can manage your organisations accounts by adding students as members, to create the unique username -
            EPPN - and the password that they will need to be able to perform the Digital National Exam."
              id="intro-lead"
            />
          </p>
        </div>
      </section>
      <section>
        <h2>
          <FormattedMessage defaultMessage="Add student to organisation" id="addToGroup-heading" />
        </h2>
        <p>
          <FormattedMessage
            defaultMessage="Add every student by using this form, to create their username and password."
            id="addToGroup-paragraph"
          />
        </p>
        {showMore ? (
          <button
            type="button"
            aria-label={showMore ? "hide instructions" : "show instructions"}
            className="btn btn-link"
            onClick={toggleShowMore}
          >
            <FormattedMessage defaultMessage="READ MORE ON HOW TO ADD STUDENTS" id="addToGroup-showList" />
            <FontAwesomeIcon icon={faChevronDown as IconProp} />
          </button>
        ) : (
          <>
            <button
              type="button"
              aria-label={showMore ? "hide instructions" : "show instructions"}
              className="btn btn-link"
              onClick={toggleShowMore}
            >
              <FormattedMessage defaultMessage="READ LESS ON HOW TO ADD STUDENTS" id="addToGroup-hideList" />
              <FontAwesomeIcon icon={faChevronUp as IconProp} />
            </button>
            <ol className="listed-steps">
              <li>
                <FormattedMessage
                  defaultMessage="Enter the given name and surname for each student, one at a time."
                  id="addToGroup-listItem1"
                />
              </li>
              <li>
                <FormattedMessage
                  defaultMessage="Write the name so that you can distinguish the identity of the person even if there are students
                 with identical names e.g. by adding an initial. It is not allowed to use personal ID numbers for this use."
                  id="addToGroup-listItem2"
                />
              </li>
              <li>
                <FormattedMessage
                  defaultMessage='When you click the ADD button the student will be added to the organisation and appearing in a table below in the "Manage added students" section.'
                  id="addToGroup-listItem3"
                />
              </li>
              <li>
                <strong>
                  <FormattedMessage
                    defaultMessage="Then note the corresponding EPPN/username and password which appears in the table"
                    id="addToGroup-listItem4Strong"
                  />
                </strong>
                ,&nbsp;
                <FormattedMessage
                  defaultMessage="transfer it to an external system of your choice, as you will not be able to retrieve the same password afterwards, and it will only be visible during this logged in session."
                  id="addToGroup-listItem4"
                />
              </li>
            </ol>
          </>
        )}

        <Form
          validate={validatePersonalData}
          onSubmit={addUser}
          render={({ handleSubmit, form, submitting, invalid }) => (
            <form
              onSubmit={async (event) => {
                await handleSubmit(event);
                form.reset();
                inputRef.current?.focus();
              }}
            >
              <div className="flex-between">
                <Field name="given_name">
                  {({ input, meta }) => (
                    <fieldset>
                      <label htmlFor="givenName">
                        <FormattedMessage defaultMessage="Given name*" id="addToGroup-givenName" />
                      </label>
                      <input type="text" {...input} placeholder="given name" id="givenName" ref={inputRef} autoFocus />
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
        <MembersList
          accessToken={accessToken}
          members={members}
          setMembers={setMembers}
          membersDetails={membersDetails}
        />
      </section>

      {/* <Splash showChildren={managedAccountsDetails.id}> */}
    </React.Fragment>
    // </Splash>
  );
}
