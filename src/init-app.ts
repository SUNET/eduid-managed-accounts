import { Middleware, configureStore } from "@reduxjs/toolkit";
import notifyAndDispatch from "./notify-middleware";
import managedAccountsApp from "./store";

/* setup to run the combined sagas */
let middlewares: Array<Middleware> = [notifyAndDispatch];

if (process.env.NODE_ENV !== "production") {
  const reduxLogger = await import("redux-logger");
  middlewares.push(reduxLogger.logger);
}

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
