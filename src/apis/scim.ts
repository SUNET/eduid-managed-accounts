export const scimUrl = "https://api.eduid.docker/scim/Groups";

// SCIM
export const scimHeaders = (token: string) => {
  return {
    Authorization: "Bearer " + token,
  };
};

export const scimRequest: any = {
  headers: scimHeaders,
  method: "GET",
};
