import { combineReducers } from "redux";
import { intlReducer } from "./slices/Internationalisation";
import { getGroupsReducer } from "./slices/getGroups";

const managedAccountsApp = combineReducers({
  intl: intlReducer,
  groups: getGroupsReducer,
});

export default managedAccountsApp;
