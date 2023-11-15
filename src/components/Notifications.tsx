import React from "react";
import { Alert } from "reactstrap";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearNotifications, eduidNotification } from "../slices/Notifications";

export function Notifications(): JSX.Element | null {
  const error = useAppSelector((state) => state.notifications.error);
  console.log("error", error);
  const dispatch = useAppDispatch();

  function handleRMNotification(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    dispatch(clearNotifications());
  }

  // show errors first, information second
  const show: eduidNotification | undefined = error ?? error;

  if (!show) {
    // no messages to show
    return null;
  }

  return (
    <div className="notifications-area" aria-live="polite">
      <Alert color="danger" toggle={handleRMNotification} closeClassName="close">
        <span className="horizontal-content-margin">
          <output aria-label="error">{error?.message}</output>
        </span>
      </Alert>
    </div>
  );
}
