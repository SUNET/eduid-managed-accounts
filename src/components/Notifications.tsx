import React from "react";
import { useIntl } from "react-intl";
import { Alert } from "reactstrap";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearNotifications, eduidNotification } from "../slices/Notifications";

export function Notifications(): JSX.Element | null {
  const error = useAppSelector((state) => state.notifications.error);
  const dispatch = useAppDispatch();
  const intl = useIntl();

  function handleRMNotification(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    dispatch(clearNotifications());
  }

  // show errors first, information second
  const show: eduidNotification | undefined = error ?? error;
  console.log("SHOW", show);

  if (!show) {
    // no messages to show
    return null;
  }

  let msg: string = intl.formatMessage({ id: show.message, defaultMessage: show.message });

  return (
    <div className="notifications-area" aria-live="polite">
      <Alert color="danger" toggle={handleRMNotification} closeClassName="close">
        <span className="horizontal-content-margin">
          <output aria-label="error">{msg}</output>
        </span>
      </Alert>
    </div>
  );
}
