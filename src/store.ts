import { combineReducers } from "redux";
import { intlReducer } from "./slices/Internationalisation";
import { notificationsSlice } from "./slices/Notifications";
import { getGroupsReducer } from "./slices/getGroups";

const managedAccountsApp = combineReducers({
  intl: intlReducer,
  groups: getGroupsReducer,
  notifications: notificationsSlice.reducer,
  // fetchInteractionResponse: fetchInteractionResponseReducer,
});

export default managedAccountsApp;
