// import content from other files
import { FormattedMessage } from "react-intl";

export const apiResponses = {
  "Access denied: Authentication source or assurance level invalid": (
    <FormattedMessage
      id="Authentication source or assurance level invalid"
      defaultMessage="Access denied: Authentication source or assurance level invalid"
    />
  ),

  "Access denied: No authentication header found": (
    <FormattedMessage
      id="No authentication header found"
      defaultMessage="Access denied: No authentication header found"
    />
  ),

  "Access denied: Bearer token error": (
    <FormattedMessage id="Bearer token error" defaultMessage="Access denied: Bearer token error" />
  ),

  "Access denied: Data owner requested in access token denied": (
    <FormattedMessage
      id="Data owner requested in access token denied"
      defaultMessage="Access denied: Data owner requested in access token denied"
    />
  ),

  "Access denied: Unknown data_owner": (
    <FormattedMessage id="Unknown data_owner" defaultMessage="Access denied: Unknown data_owner" />
  ),

  "Access denied: Missing correct entitlement in saml data": (
    <FormattedMessage
      id="Missing correct entitlement in saml data"
      defaultMessage="Access denied: Missing correct entitlement in saml data"
    />
  ),
};
