import { combineReducers } from "redux";
import { intlReducer } from "./slices/Internationalisation";
import { notificationsSlice } from "./slices/Notifications";
import { getGroupsReducer } from "./slices/getGroups";
import { getUsersReducer } from "./slices/getUsers";

const managedAccountsApp = combineReducers({
  intl: intlReducer,
  groups: getGroupsReducer,
  members: getUsersReducer,
  notifications: notificationsSlice.reducer,
  // fetchInteractionResponse: fetchInteractionResponseReducer,
});

export default managedAccountsApp;
