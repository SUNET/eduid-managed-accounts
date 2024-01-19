import { showNotification } from "./slices/Notifications";

showNotification;
const notifyAndDispatch = () => (next: any) => (action: any) => {
  console.log("actions", action);
  if (action.type.endsWith("FAIL")) {
    //TODO: display an error message when there are no access token
    setTimeout(() => {
      try {
        window.scroll(0, 0);
      } catch (error) {
        // window.scroll isn't available in the tests jsdom environment
      }
    }, 100);
  } //SCIM api error messages
  else if (action.error?.message) {
    next(showNotification({ message: action.payload }));
    setTimeout(() => {
      try {
        window.scroll(0, 0);
      } catch (error) {
        // window.scroll isn't available in the tests jsdom environment
      }
    }, 100);
  } else if (action.payload?.message) {
    console.log("hihi", action.payload.message);
    next(showNotification({ message: action.payload.message }));
    setTimeout(() => {
      try {
        window.scroll(0, 0);
      } catch (error) {
        // window.scroll isn't available in the tests jsdom environment
      }
    }, 100);
  }
  if (action.payload !== undefined) {
    delete action.payload.message;
    delete action.payload.errorMsg;
  }

  return next(action);
};
export default notifyAndDispatch;
