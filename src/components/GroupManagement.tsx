import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExcelJS from "exceljs";
import { ValidationErrors } from "final-form";
import Personnummer from "personnummer";
import React, { useEffect, useRef, useState } from "react";
import { Field, Form } from "react-final-form";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { GroupMember } from "typescript-clients/scim/models/GroupMember";
import { createGroup, getGroupDetails, getGroupsSearch, putGroup } from "../apis/scim/groupsRequest";
import { getUserDetails, postUser } from "../apis/scim/usersRequest";
import { useAppDispatch, useAppSelector } from "../hooks";
import appSlice from "../slices/appReducers";
import getGroupsSlice from "../slices/getGroups";
import getLoggedInUserInfoSlice from "../slices/getLoggedInUserInfo";
import getUsersSlice from "../slices/getUsers";
import MembersList, { MembersDetailsTypes } from "./MembersList";

export const GROUP_NAME = "Managed Accounts";

interface ValidatePersonalData {
  [key: string]: string;
}

// interface ErrorsType {
//   [key: string]: React.ReactNode;
// }

export default function GroupManagement(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const membersDetails = useAppSelector((state) => state.members.members);
  const isLoaded = useAppSelector((state) => state.app.isLoaded);
  const locationState = location.state;
  const accessToken = locationState?.access_token?.value;
  const value = locationState?.subject.assertions[0].value;
  const parsedUserInfo = value ? JSON.parse(value) : null;
  const [selectedFile, setSelectedFile] = useState(null);

  const placeholderGivenName = intl.formatMessage({
    id: "addToGroup-givenNamePlaceholder",
    defaultMessage: "given name",
    description: "Placeholder for given name text input",
  });

  const placeholderSurName = intl.formatMessage({
    id: "addToGroup-surnamePlaceholder",
    defaultMessage: "surname",
    description: "Placeholder for surname text input",
  });

  function handleFileChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  useEffect(() => {
    if (parsedUserInfo && !isLoaded) {
      dispatch(getLoggedInUserInfoSlice.actions.updateUserInfo({ user: parsedUserInfo }));
    }
  }, [parsedUserInfo]);

  useEffect(() => {
    if (!membersDetails.length && accessToken) {
      dispatch(getGroupDetails({ id: managedAccountsDetails.id, accessToken: accessToken }));
    }
  }, [membersDetails]);

  useEffect(() => {
    if (locationState === null) {
      navigate("/");
    }
  }, [navigate, locationState]);

  async function reloadMembersDetails(members: GroupMember[]) {
    dispatch(getUsersSlice.actions.initialize());
    if (members) {
      await Promise.all(
        members?.map(async (member: GroupMember) => {
          await dispatch(getUserDetails({ id: member.value, accessToken: accessToken }));
        })
      );
      dispatch(getUsersSlice.actions.sortByLatest());
    }
  }

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
              if (members) await reloadMembersDetails(members);
            }
          }
        } else if (getGroupsSearch.rejected.match(result)) {
          // when user get 401 error, it will redirect to login page or landing page
        }
      } catch (error) {
        console.log("Error", error);
      }
    };
    if (!isLoaded) {
      initializeManagedAccountsGroup();
      dispatch(appSlice.actions.appIsLoaded(true));
      handleStyling();
    }
  }, [dispatch, accessToken]);

  /**
   * Prepare addUsers() to create multiple accounts at the same time.
   *
   * If >1 users are added:
   *  - 1. create each user (POST Users)
   *    - 1a. postUser() extraReducer adds user to state
   *    - 1b. prepare an array newGroupMembers: GroupMember[] to be used for PUT Groups
   *  - 2. with one single request, update the Group with all the new users
   *    - 2a.  update Group state with newGroupMembers
   *
   * OBS! Validation has to be done before addUser()
   *
   * @param names
   */
  async function addUsers(names: { given_name: string; surname: string }[]) {
    // 1 - Create Users
    let newMembersList: GroupMember[] = []; // for PUT Groups
    for (const name of names) {
      try {
        const eduPersonPrincipalName: string = parsedUserInfo.attributes?.eduPersonPrincipalName;
        const scope = eduPersonPrincipalName.split("@")[1];
        const createdUserResponse = await dispatch(
          postUser({
            familyName: name.surname,
            givenName: name.given_name,
            accessToken: accessToken,
            scope: scope,
          })
        );
        // TODO: create EPPN and password request
        if (postUser.fulfilled.match(createdUserResponse)) {
          const newGroupMember: GroupMember = {
            $ref: createdUserResponse.payload.meta?.location,
            value: createdUserResponse.payload.id,
            display: createdUserResponse.payload.name?.familyName + " " + createdUserResponse.payload.name?.givenName,
          };
          newMembersList.push(newGroupMember);
        }
      } catch (error) {
        console.log("error", error);
      }
    }

    // 2 - update group with new members
    let newMembersListCopy = managedAccountsDetails.members?.slice(); // copy array
    const updatedMembersList = newMembersListCopy?.concat(newMembersList);
    await handleGroupVersion(); // check/update Group version
    const response = await dispatch(
      putGroup({
        group: {
          ...managedAccountsDetails,
          members: updatedMembersList,
        },
        accessToken: accessToken,
      })
    );
  }

  function handleAddUser(values: any) {
    addUsers([values]);
  }

  async function handleGroupVersion() {
    const response = await dispatch(getGroupDetails({ id: managedAccountsDetails.id, accessToken: accessToken }));
    if (getGroupDetails.fulfilled.match(response)) {
      if (response.payload.meta.version !== managedAccountsDetails.meta.version) {
        const members = response.payload.members;
        if (members) await reloadMembersDetails(members);
      }
    }
  }

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

  const validatePersonalData = (values: ValidatePersonalData): ValidationErrors => {
    console.log("validatePersonalData", values);
    const errors: ValidationErrors = {};
    if (values !== undefined) {
      ["given_name", "surname"].forEach((inputName) => {
        // check if the input is empty or it contains only spaces
        if (!values[inputName] || !values[inputName].trim()) {
          //console.error("validatePersonalData", "Empty");
          errors[inputName] = <FormattedMessage defaultMessage="Required" id="addToGroup-emptyValidation" />;
          // check if it is national ID number
        } else if (containsNationalIDNumber(values[inputName])) {
          //console.error("validatePersonalData", "It is not allowed to save a national ID number");
          errors[inputName] = (
            <FormattedMessage
              defaultMessage="It is not allowed to save a national ID number"
              id="addToGroup-ninValidation"
            />
          );
        }
      });
    }
    console.log("validatePersonalData ERRORS: ", errors);
    return errors;
  };

  function handleValidatePersonalData(values: ValidatePersonalData) {
    try {
      validatePersonalData(values);
      return {};
    } catch (error) {
      console.error("validatePersonalData", error);
      return error;
    }
  }

  const [members, setMembers] = useState<Array<MembersDetailsTypes & { selected: boolean }>>([]);
  const [showMore, setShowMore] = useState(true);
  function toggleShowMore() {
    setShowMore(!showMore);
  }
  const inputRef = useRef<HTMLInputElement>(null);

  if (locationState === null) {
    return <></>;
  }

  const eduPersonPrincipalName = parsedUserInfo.attributes.eduPersonPrincipalName.indexOf("@");
  const scope = parsedUserInfo.attributes.eduPersonPrincipalName.slice(eduPersonPrincipalName + 1);

  async function excelImport(e: any) {
    e.preventDefault();

    const wb = new ExcelJS.Workbook();
    const reader = new FileReader();
    const file = document.getElementById("file") as HTMLInputElement;
    console.log("files", file);
    if (!file?.files) {
      return;
    }
    reader.readAsArrayBuffer(file.files[0]);
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      wb.xlsx.load(buffer).then((workbook) => {
        // check/find right sheet name
        workbook.eachSheet(async (sheet, id) => {
          // 1 - skip the first row that contains headers
          // 2 - for each row :
          //      - read "Given name" and "Surname" columns
          //      - VALIDATE DATA
          //      - create/POST a new user with these values
          let newNames: any[] = [];
          sheet.eachRow((row, rowIndex) => {
            if (rowIndex > 1) {
              const name = {
                given_name: row.getCell(1).text,
                surname: row.getCell(2).text,
              };
              // Validate happens when reading the values, before creating the users
              const errors = validatePersonalData(name);
              if (errors && Object.keys(errors).length > 0) {
                console.error("ERRORS EXCEL IMPORT: validatePersonalData", errors);
                //throw errors;
              }
              newNames.push(name);
            }
          });
          await addUsers(newNames);
        });
      });
    };
  }

  const handleStyling = () => {
    const file = document.querySelector("#file");
    file?.addEventListener("change", (e) => {
      // Get the selected file
      const [file] = e.target.files;
      // Get the file name and size
      const { name: fileName, size } = file;
      // Convert size in bytes to kilo bytes
      const fileSize = (size / 1000).toFixed(2);
      // Set the text content
      const fileNameAndSize = `${fileName} - ${fileSize}KB`;
      document.querySelector(".file-name").textContent = fileNameAndSize;
    });
  };

  const file = document.querySelector("#file");

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
              defaultMessage="In the forms below you can manage your organisations accounts by adding students, to create their individual account with a unique username -
            EPPN - and the password that they will need to be able to perform the Digital National Exam."
              id="intro-lead"
            />
          </p>
          <div className="text-small">
            <em>
              <FormattedMessage
                defaultMessage="The contents can be presented in Swedish or English, choose language in the footer of this web page. 
              You are advised to use the service in a larger browser window, i.e. not mobile device, for legibility of the forms."
                id="intro-leadEmphasis"
              />
            </em>
          </div>
        </div>
      </section>
      <section>
        <h2>
          <FormattedMessage defaultMessage="Add account to organisation" id="addToGroup-heading" />
        </h2>
        <p>
          <span className="heading-5">
            <FormattedMessage defaultMessage="CURRENT SCOPE: " id="intro-scope" />
          </span>
          <strong>&nbsp;{scope}</strong>
        </p>
        <p>
          <FormattedMessage
            defaultMessage="Add every account, either by importing your prepared Ecxel-document or one by one using the form."
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
            <FormattedMessage defaultMessage="READ MORE ON HOW TO ADD ACCOUNTS" id="addToGroup-showList" />
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
              <FormattedMessage defaultMessage="READ LESS ON HOW TO ADD ACCOUNTS" id="addToGroup-hideList" />
              <FontAwesomeIcon icon={faChevronUp as IconProp} />
            </button>

            <h3>
              <FormattedMessage defaultMessage="Add account by file import" id="addToGroup-headingImport" />
            </h3>
            <ol className="listed-steps">
              <li>
                <FormattedMessage
                  defaultMessage="Create a 2-column Excel-document containing the given names and surnames of the accounts you wish to add. You can download the example file to fill in using the DOWNLOAD DOCUMENT link."
                  id="addToGroup-list2Item1"
                />
              </li>
              <li>
                <FormattedMessage
                  defaultMessage="Import your prepared document by clicking on the SELECT DOCUMENT button to choose your .xls or .xlsx file. You will see the name of the last imported file next to the button."
                  id="addToGroup-list2Item2"
                />
              </li>
              <li>
                <FormattedMessage
                  defaultMessage='Create the accounts listed in the document by clicking on the CREATE ACCOUNTS button. The accounts will be added to the organisation, with usernames and passwords, and appearing in a table below in the "Manage added accounts" section, where the newly added accounts will be pre-selected.'
                  id="addToGroup-list2Item3"
                />
              </li>
              <li>
                <strong>
                  <FormattedMessage
                    defaultMessage="Then note the corresponding EPPN/username and password which appears in the table"
                    id="addToGroup-list2Item4Strong"
                  />
                </strong>
                ,&nbsp;
                <FormattedMessage
                  defaultMessage="transfer it to an external system of your choice, e.g. by exporting to another Excel document or copying, as you will not be able to retrieve the same password afterwards, and it will only be visible during this logged in session and page load."
                  id="addToGroup-list2Item4"
                />
              </li>
            </ol>
            <h3>
              <FormattedMessage defaultMessage="Add account manually" id="addToGroup-headingManually" />
            </h3>
            <ol className="listed-steps">
              <li>
                <FormattedMessage
                  defaultMessage="Enter the given name and surname for each account, one at a time."
                  id="addToGroup-list1Item1"
                />
              </li>
              <li>
                <FormattedMessage
                  defaultMessage="Write the name so that you can distinguish the identity of the person even if there are 
                identical names e.g. by adding an initial. It is not allowed to use personal ID numbers for this use."
                  id="addToGroup-list1Item2"
                />
              </li>
              <li>
                <FormattedMessage
                  defaultMessage='When you click the ADD button the account will be added to the organisation with a created username and password and appearing in a table below in the "Manage added accounts" section, where the newly added accounts will be pre-selected.'
                  id="addToGroup-list1Item3"
                />
              </li>
              <li>
                <strong>
                  <FormattedMessage
                    defaultMessage="Then note the corresponding EPPN/username and password which appears in the table"
                    id="addToGroup-list1Item4Strong"
                  />
                </strong>
                ,&nbsp;
                <FormattedMessage
                  defaultMessage="transfer it to an external system of your choice, e.g. by exporting to Excel or copying, as you will not be able to retrieve the same password afterwards, and it will only be visible during this logged in session and page load."
                  id="addToGroup-list1Item4"
                />
              </li>
            </ol>
          </>
        )}

        <article className="figure add-account">
          <h3>
            <FormattedMessage defaultMessage="Add account by file import" id="addToGroup-headingImport" />
          </h3>

          <div>
            <form onSubmit={excelImport} id="import-excel-form">
              <fieldset className="flex-between">
                <label>
                  <FormattedMessage
                    defaultMessage="Download empty Excel document to fill in or use as a guide:"
                    id="addToGroup-downloadLabel"
                  />
                </label>
                <a href="src/assets/hanterade_konton.xlsx" target="_blank">
                  <FormattedMessage defaultMessage="Download document" id="addToGroup-downloadLink" />
                </a>
              </fieldset>
              <fieldset className="flex-between">
                <label>
                  <FormattedMessage defaultMessage="Select filled in Excel document:" id="addToGroup-selectLabel" />
                </label>
                <div className="flex-between file-input">
                  <span className="file-name"></span>
                  <input className="file" type="file" name="excelFile" id="file" onChange={handleFileChange} />
                  <label className="btn-cover btn-sm" htmlFor="file">
                    <FormattedMessage defaultMessage="Select document" id="addToGroup-selectButton" />
                  </label>
                </div>
              </fieldset>

              <fieldset className="flex-between">
                <label>
                  <FormattedMessage
                    defaultMessage="Create accounts from selected Excel document:"
                    id="addToGroup-importLabel"
                  />
                </label>
                <button type="submit" className="btn btn-primary btn-sm" disabled={!selectedFile}>
                  <FormattedMessage defaultMessage="Create accounts" id="excel-import" />
                </button>
              </fieldset>
            </form>
          </div>

          <hr className="border-line"></hr>
          <h3>
            <FormattedMessage defaultMessage="Add account manually" id="addToGroup-headingManually" />
          </h3>
          <Form
            validate={validatePersonalData}
            onSubmit={handleAddUser}
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
                        <input
                          type="text"
                          {...input}
                          placeholder={placeholderGivenName}
                          id="givenName"
                          ref={inputRef}
                          autoFocus
                        />
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
                        <input type="text" {...input} placeholder={placeholderSurName} id="surName" />
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
        </article>
      </section>
      <section>
        <MembersList
          handleGroupVersion={handleGroupVersion}
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
