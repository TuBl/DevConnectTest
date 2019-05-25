import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map(alert => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired
};
//getting our state from store & saving it into alerts prop, which we destructured in our Componenet function {alerts}
const mapStateToProps = state => ({
  //set our alerts = the state of alerts from our alert reducer that is passed to main reducer then saved in global store (phew)
  alerts: state.alert
});
export default connect(mapStateToProps)(Alert);
