import { ErrorDetail } from "typescript-clients/scim";

export const handleErrorResponse = async (jsonResponse: ErrorDetail) => {
  const errorMessage = `Access denied: ${jsonResponse.detail}`;
  // if token has expired, renew it. Temporary solution: reload to homepage
  if (jsonResponse.status === 401 && jsonResponse.detail == "Bearer token error") {
    window.location.href = "/";
  }
  // TODO: getGroupsSearch() in initializeManagedAccountsGroup() could receive also a 401 but because the user
  // could be not authorized
  // check backend: src/eduid/scimapi/middleware.py - maybe it is missing a specific "detail" message for unauthorized user
  throw errorMessage;
};
