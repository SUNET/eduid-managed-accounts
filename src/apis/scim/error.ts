import { ErrorDetail } from "typescript-clients/scim";

export const handleErrorResponse = async (jsonResponse: ErrorDetail) => {
  const errorMessage = jsonResponse.status === 401 ? `Access denied: ${jsonResponse.detail}` : `${jsonResponse.detail}`;
  throw errorMessage;
};
