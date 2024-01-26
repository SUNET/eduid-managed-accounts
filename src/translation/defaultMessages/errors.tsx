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
  "excel-file-contains-errors-in-row": (
    <FormattedMessage id="excel-file-contains-errors-in-row" defaultMessage="Excel file contains errors in row" />
  ),
  "for-values": <FormattedMessage id="for-values" defaultMessage="for values" />,
  errors: <FormattedMessage id="errors" defaultMessage="errors" />,
};
