import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import notifyAndDispatch from "./notify-middleware";
import managedAccountsApp from "./store";

/* setup to run the combined sagas */
const middlewares = [notifyAndDispatch, logger];

export const managedAccountsStore = configureStore({
  reducer: managedAccountsApp,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middlewares),
  devTools: process.env.NODE_ENV !== "production",
});

// The same thing again, for use in tests
export function getTestManagedAccountsStore(preloadedState: Partial<AppRootState>) {
  const testStore = configureStore({
    reducer: managedAccountsApp,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middlewares),
    devTools: process.env.NODE_ENV !== "production",
    preloadedState,
  });
  return testStore;
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppRootState = ReturnType<typeof managedAccountsStore.getState>;
export type AppDispatch = typeof managedAccountsStore.dispatch;
