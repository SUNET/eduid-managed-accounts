import { FormattedMessage } from "react-intl";

export const apiResponses = {
  "Failed with status 401: Unknown data_owner": (
    <FormattedMessage
      id="Failed with status 401: Unknown data_owner"
      defaultMessage="Unknown data owner please contact support"
    />
  ),
  "Could not load all members details. Try again": (
    <FormattedMessage
      id="Could not load all members details. Try again"
      defaultMessage="Could not load all members details. Try again"
    />
  ),
  "Some data in the Excel file is invalid. No new accounts has been created. For more details check the error message in the 'Add account by file import' area.":
    (
      <FormattedMessage
        id="excel-file-error"
        defaultMessage="Some data in the Excel file is invalid. No new accounts has been created. For more details check the error message in the 'Add account by file import' area."
      />
    ),
};
