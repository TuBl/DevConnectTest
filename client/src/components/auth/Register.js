import React, { Fragment, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../actions/alert";
import { register } from "../../actions/auth";
import PropTypes from "prop-types";

//again instead of passing in props and having to do props.something we can just destructure the value we are passing in the first place
//instead of props.setAlert we destruture setAlert pass in {setAlert} and now we can use it without props.\
//basically we pulled setAlert out of props which we obtained from using connect, connect gets us setAlert into props.
const Register = ({ setAlert, register, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: ""
  });

  const { name, email, password, password2 } = formData;
  //   Instead of doing name: e.target.value which will always target our (name) if we wanna re use the onChange we can make it so that
  // it triggers on [e.target.name] which checks that value of the name attribiute on the element where the event is triggered
  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      //we called our set alert, passed it arguments to be dispatched in our payload, the action was dispatched from our actions file to our reducer file
      setAlert("danger", "Passwords do not match!");
    } else {
      register({ name, email, password });
    }
  };
  if (isAuthenticated) {
    return <Redirect to='/dashboard' />;
  }

  return (
    <Fragment>
      <section className='container'>
        <h1 className='large text-primary'>Sign Up</h1>
        <p className='lead'>
          <i className='fas fa-user' /> Create Your Account
        </p>
        <form className='form' onSubmit={e => onSubmit(e)}>
          <div className='form-group'>
            <input
              type='text'
              placeholder='Name'
              name='name'
              value={name}
              onChange={e => onChange(e)}
              // required
            />
          </div>
          <div className='form-group'>
            <input
              type='email'
              placeholder='Email Address'
              name='email'
              value={email}
              // required
              onChange={e => onChange(e)}
            />
            <small className='form-text'>
              This site uses Gravatar so if you want a profile image, use a
              Gravatar email
            </small>
          </div>
          <div className='form-group'>
            <input
              type='password'
              placeholder='Password'
              name='password'
              // minLength='6'
              value={password}
              // required
              onChange={e => onChange(e)}
            />
          </div>
          <div className='form-group'>
            <input
              type='password'
              placeholder='Confirm Password'
              name='password2'
              // minLength='6'
              value={password2}
              // required
              onChange={e => onChange(e)}
            />
          </div>
          <input type='submit' className='btn btn-primary' value='Register' />
        </form>
        <p className='my-1'>
          Already have an account? <Link to='/login'>Sign In</Link>
        </p>
      </section>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};
const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});
//connect takes in a state that you want to map (null if you dont wanna map) or mapStatetoProps function & actions taht you wanna use
// we have to pass our action so that it is useable within props (which we destructured above)
export default connect(
  mapStateToProps,
  { setAlert, register }
)(Register);
