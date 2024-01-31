import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExcelJS from "exceljs";
import { ValidationErrors } from "final-form";
import Personnummer from "personnummer";
import React, { useEffect, useRef, useState } from "react";
import { Field, Form } from "react-final-form";
import { FormattedMessage, useIntl } from "react-intl";
import { putGroup } from "../apis/scim/groupsRequest";
import { postUser } from "../apis/scim/usersRequest";
import { useAppDispatch, useAppSelector } from "../hooks";
import { showNotification } from "../slices/Notifications";
import appSlice from "../slices/appReducers";
import { GroupMember } from "../typescript-clients/scim/models/GroupMember";

export const GROUP_NAME = "Managed Accounts";

interface CreateAccountsTypes {
  readonly handleGroupVersion: () => void;
  readonly scope: string;
}
interface ValidatePersonalData {
  [key: string]: string;
}

interface ExcelImportErrorType {
  fullName?: {
    givenName?: string;
    surName?: string;
  };
  errors?: {
    rowIndex?: number;
    givenName?: string;
    surName?: string;
  };
}

export default function CreateAccounts({ handleGroupVersion, scope }: CreateAccountsTypes): JSX.Element {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const managedAccountsDetails = useAppSelector((state) => state.groups.managedAccounts);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [excelImportError, setExcelImportError] = useState<ExcelImportErrorType | null>(null);
  const isFetching = useAppSelector((state) => state.app.isFetching);

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

  const inputRef = useRef<HTMLInputElement>(null);
  const [showMore, setShowMore] = useState(true);

  function toggleShowMore() {
    setShowMore(!showMore);
  }

  useEffect(() => {
    const handleStyling = () => {
      const file = document.querySelector("#file");
      file?.addEventListener("change", (e) => {
        // Get the selected file
        const inputElement = e.target as HTMLInputElement;
        const [file] = inputElement.files as any;
        // Get the file name and size
        const { name: fileName, size } = file;
        // Convert size in bytes to kilo bytes
        const fileSize = (size / 1000).toFixed(2);
        // Set the text content
        const fileNameAndSize = `${fileName} - ${fileSize}KB`;
        const fileNameElement = document.querySelector(".file-name");
        if (fileNameElement) {
          fileNameElement.textContent = fileNameAndSize;
        }
      });
    };
    handleStyling();
  }, []);

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
    dispatch(appSlice.actions.isFetching(true));
    // 0 - Disable "create accounts" button, to avoid users can click multiple times while we create accounts
    setSelectedFile(null);
    // 1 - Create Users
    let newMembersList: GroupMember[] = []; // for PUT Groups
    for (const name of names) {
      try {
        const createdUserResponse = await dispatch(
          postUser({
            familyName: name.surname,
            givenName: name.given_name,
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
    let newMembersListCopy = managedAccountsDetails?.members?.slice(); // copy array
    const updatedMembersList = newMembersListCopy?.concat(newMembersList);
    await handleGroupVersion(); // check/update Group version
    await dispatch(
      putGroup({
        group: {
          ...managedAccountsDetails,
          members: updatedMembersList,
        },
      })
    );
    dispatch(appSlice.actions.isFetching(false));
  }

  function handleAddUser(values: any) {
    addUsers([values]);
  }

  const validatePersonalData = (values: ValidatePersonalData): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (values !== undefined) {
      ["given_name", "surname"].forEach((inputName) => {
        // check if the input is empty or it contains only spaces
        if (!values[inputName]?.trim()) {
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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setExcelImportError(null);
      setSelectedFile(file);
    }
  }

  function cleanFileInput() {
    setSelectedFile(null);
    const fileInput = document.getElementById("file") as HTMLInputElement;
    const fileName = document.querySelector(".file-name");
    if (fileInput) {
      fileInput.files = null;
    }
    if (fileName) {
      fileName.textContent = null;
    }
  }

  async function excelImport(e: any) {
    e.preventDefault();

    const wb = new ExcelJS.Workbook();
    const reader = new FileReader();
    const file = document.getElementById("file") as HTMLInputElement;
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
          try {
            sheet.eachRow((row, rowIndex) => {
              if (rowIndex > 1) {
                const name = {
                  given_name: row.getCell(1).text,
                  surname: row.getCell(2).text,
                };
                // Validate happens when reading the values, before creating the users
                const errors = validatePersonalData(name);
                if (errors && Object.keys(errors).length > 0) {
                  setExcelImportError((prevError) => ({
                    ...prevError,
                    errors: {
                      rowIndex: rowIndex,
                    },
                  }));

                  if (errors.hasOwnProperty("given_name")) {
                    setExcelImportError((prevError) => ({
                      fullName: {
                        ...prevError?.fullName,
                        givenName: name.given_name,
                      },
                      errors: {
                        ...prevError?.errors,
                        givenName: errors.given_name.props.defaultMessage,
                      },
                    }));
                  }
                  if (errors.hasOwnProperty("surname")) {
                    setExcelImportError((prevError) => ({
                      fullName: {
                        ...prevError?.fullName,
                        surName: name.surname,
                      },
                      errors: {
                        ...prevError?.errors,
                        surName: errors.surname.props.defaultMessage,
                      },
                    }));
                  }
                  throw new Error();
                }
                newNames.push(name);
              }
            });
            await addUsers(newNames);
          } catch (error) {
            dispatch(
              showNotification({
                message: `Some data in the Excel file do not validate. No new accounts has been created. For more details 
                  check the error message in the 'Add account by file import' area.`,
              })
            );
          }
          // reset input
          cleanFileInput();
        });
      });
    };
  }
  return (
    <React.Fragment>
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
          defaultMessage={`Add every account, either by first importing your prepared Excel-document or one by one using 
            the form.`}
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
                defaultMessage={`Create a 2-column Excel-document containing the given names and surnames of the accounts 
                you wish to add. You can download the example file to fill in using the DOWNLOAD DOCUMENT link.`}
                id="addToGroup-list2Item1"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`Import your filled in document by clicking on the SELECT DOCUMENT button to choose your 
                  .xls or .xlsx file. You will see the name of the last imported file next to the button.`}
                id="addToGroup-list2Item2"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`Then create the accounts listed in the document by clicking on the CREATE ACCOUNTS button. 
                The accounts will be added to the organisation, with usernames and passwords, and appearing in a table 
                below in the "Manage added accounts" section, where the newly added accounts will be pre-selected.`}
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
                defaultMessage={`transfer it to an external system of your choice, e.g. by exporting to another Excel 
                  document or copying, as you will not be able to retrieve the same password afterwards, 
                  and it will only be visible during this logged in session and page load.`}
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
                defaultMessage={`Write the name so that you can distinguish the identity of the person even if there are 
                identical names e.g. by adding an initial. It is not allowed to use personal ID numbers for this use.`}
                id="addToGroup-list1Item2"
              />
            </li>
            <li>
              <FormattedMessage
                defaultMessage={`When you click the ADD button the account will be added to the organisation with a 
                  created username and password and appearing in a table below in the "Manage added accounts" section, 
                  where the newly added accounts will be pre-selected.`}
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
                defaultMessage={`transfer it to an external system of your choice, e.g. by exporting to Excel or copying, 
                  as you will not be able to retrieve the same password afterwards, and it will only be visible during 
                  this logged in session and page load.`}
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
            <ol className="listed-steps">
              <li>
                <div className="flex-between">
                  <span>
                    <FormattedMessage
                      defaultMessage="Create Excel document with account names, e.g. using this empty template:"
                      id="addToGroup-downloadLabel"
                    />
                  </span>
                  <a
                    id="link"
                    href="src/assets/hanterade_konton.xlsx"
                    target="_blank"
                    className={!managedAccountsDetails?.id ? "disabled" : ""}
                  >
                    <FormattedMessage defaultMessage="Download template" id="addToGroup-downloadLink" />
                  </a>
                </div>
              </li>
              <li>
                <div className="flex-between">
                  <span>
                    <FormattedMessage defaultMessage="Select filled in Excel document:" id="addToGroup-selectLabel" />
                  </span>
                  <div className="flex-between file-input">
                    <span className="file-name"></span>
                    <input
                      className="file"
                      type="file"
                      name="excelFile"
                      id="file"
                      onChange={handleFileChange}
                      disabled={isFetching}
                    />
                    <label
                      className={`btn-cover btn-sm ${!managedAccountsDetails?.id || isFetching ? "disabled" : ""}`}
                      htmlFor="file"
                    >
                      <FormattedMessage defaultMessage="Select document" id="addToGroup-selectButton" />
                    </label>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex-between">
                  <span>
                    <FormattedMessage
                      defaultMessage="Create accounts from selected Excel document:"
                      id="addToGroup-importLabel"
                    />
                  </span>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={!selectedFile || isFetching}>
                    <FormattedMessage defaultMessage="Create accounts" id="excel-import" />
                  </button>
                </div>
              </li>
            </ol>
          </form>
          {excelImportError?.errors?.rowIndex && (
            <span className="input-validate-error">
              <FormattedMessage
                defaultMessage="Excel file contains errors in row {row}. "
                id="excel-file-rowIndex-error"
                values={{ row: excelImportError?.errors?.rowIndex }}
              />
              {excelImportError?.errors?.givenName && (
                <FormattedMessage
                  defaultMessage='Given name "{givenName}" does not validate: {error}. '
                  id="excel-file-givenName-error"
                  values={{
                    givenName: excelImportError?.fullName?.givenName,
                    error: excelImportError.errors.givenName,
                  }}
                />
              )}
              {excelImportError?.errors.surName && (
                <FormattedMessage
                  defaultMessage='Surname "{surName}" does not validate: {error}.'
                  id="excel-file-surName-error"
                  values={{ surName: excelImportError?.fullName?.surName, error: excelImportError.errors.surName }}
                />
              )}
            </span>
          )}
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
                    <div className="fieldset">
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
                        disabled={!managedAccountsDetails?.id}
                      />
                      {meta.touched && meta.error && <span className="input-validate-error">{meta.error}</span>}
                    </div>
                  )}
                </Field>
                <Field name="surname">
                  {({ input, meta }) => (
                    <div className="fieldset">
                      <label htmlFor="surName">
                        <FormattedMessage defaultMessage="Surname*" id="addToGroup-surname" />
                      </label>
                      <input
                        type="text"
                        {...input}
                        placeholder={placeholderSurName}
                        id="surName"
                        disabled={!managedAccountsDetails?.id}
                      />
                      {meta.touched && meta.error && <span className="input-validate-error">{meta.error}</span>}
                    </div>
                  )}
                </Field>
                <button disabled={submitting || invalid || isFetching} className="btn btn-primary">
                  <FormattedMessage defaultMessage="Add" id="addToGroup-addButton" />
                </button>
              </div>
            </form>
          )}
        />
      </article>
    </React.Fragment>
  );
}
