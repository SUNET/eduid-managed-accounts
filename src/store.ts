import { combineReducers } from "redux";
import { intlReducer } from "./slices/Internationalisation";
import { notificationsSlice } from "./slices/Notifications";
import { appReducer } from "./slices/appReducers";
import { configReducer } from "./slices/configReducer";
import { getGroupsReducer } from "./slices/getGroups";
import { getPersonalDataReducer } from "./slices/getLoggedInUserInfo";
import { getUsersReducer } from "./slices/getUsers";

const managedAccountsApp = combineReducers({
  intl: intlReducer,
  groups: getGroupsReducer,
  members: getUsersReducer,
  personalData: getPersonalDataReducer,
  notifications: notificationsSlice.reducer,
  app: appReducer,
  config: configReducer,
});

export default managedAccountsApp;
