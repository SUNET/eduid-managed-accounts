import { combineReducers } from "redux";
import { intlReducer } from "./slices/Internationalisation";
import { getGroupsReducer } from "./slices/getGroups";

const managedAccountsApp = combineReducers({
  intl: intlReducer,
  groups: getGroupsReducer,
  // fetchInteractionResponse: fetchInteractionResponseReducer,
});

export default managedAccountsApp;
