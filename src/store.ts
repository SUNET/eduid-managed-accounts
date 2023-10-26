import { combineReducers } from "redux";
import { intlReducer } from "./slices/Internationalisation";
import { fetchJWSReducer } from "./slices/fetchJWS";

const managedAccountsApp = combineReducers({
  intl: intlReducer,
  fetchJWSToken: fetchJWSReducer,
});

export default managedAccountsApp;
