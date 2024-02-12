import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type notificationLevel = "error" | "info";

export interface EduidNotificationType {
  message: string;
}

// Define a type for the slice state
export interface NotificationState {
  error?: EduidNotificationType;
}

// export for use in tests
export const initialState: NotificationState = {};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<EduidNotificationType>) => {
      if (action.payload.message) {
        state.error = action.payload;
      }
    },
    clearNotifications: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase("@@router/LOCATION_CHANGE", (state) => {
      state.error = undefined;
    });
  },
});

export const showNotification = notificationsSlice.actions.showNotification;
export const clearNotifications = notificationsSlice.actions.clearNotifications;
