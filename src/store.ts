import { combineReducers } from "redux";
import { intlReducer } from "./slices/Internationalisation";

const managedAccountsApp = combineReducers({
    intl: intlReducer,
});

export default managedAccountsApp;
