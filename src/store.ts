import { combineReducers } from "redux";
import { intlReducer } from "./slices/Internationalisation";

const managedAccountsApp = combineReducers({
  intl: intlReducer,
  // fetchJWSToken: fetchJWSReducer,
});

export default managedAccountsApp;
