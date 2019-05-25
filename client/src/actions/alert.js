import { SET_ALERT, REMOVE_ALERT } from "./types";
import uuid from "uuid";
//we can do => dispatch => because of thunk middleware
// so we can dispatch more than 1 action type from the same function
export const setAlert = (alertType, msg, timeout = 2000) => dispatch => {
  const id = uuid.v4();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id }
  });
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
