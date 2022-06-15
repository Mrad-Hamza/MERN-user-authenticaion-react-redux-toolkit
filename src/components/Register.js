import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import {useNavigate} from "react-router-dom"

import { register } from "../slices/auth";
import { clearMessage } from "../slices/message";

const Register = () => {
  const [successful, setSuccessful] = useState(false);

  const { message } = useSelector((state) => state.message);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  const initialValues = {
    username: "",
    mailAddress: "",
    password: "",
    firstname : "",
    lastname : "",
    passwordConfirm : ""
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .test(
        "len",
        "The username must be between 3 and 20 characters.",
        (val) =>
          val &&
          val.toString().length >= 3 &&
          val.toString().length <= 20
      )
      .required("This field is required!"),
    mailAddress: Yup.string()
      .email("This is not a valid email.")
      .required("This field is required!"),
    password: Yup.string()
      .test(
        "len",
        "The password must be between 6 and 40 characters.",
        (val) =>
          val &&
          val.toString().length >= 6 &&
          val.toString().length <= 40
      )
      .required("This field is required!"),
    passwordConfirm: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        "The confirmation password does not match"
      )
      .required("This field is required!"),
    firstname: Yup.string()
      .test(
        "len",
        "First Name must be between 3 and 20 characters.",
        (val) =>
          val &&
          val.toString().length >= 3 &&
          val.toString().length <= 40
      )
      .required("This field is required!"),

    lastname: Yup.string()
      .test(
        "len",
        "Last name must be between 3 and 20 characters.",
        (val) =>
          val &&
          val.toString().length >= 3 &&
          val.toString().length <= 40
      )
      .required("This field is required!"),
  });

  const handleRegister = (formValue) => {
    const { username, mailAddress, password, firstname, lastname } = formValue;
    setSuccessful(false);

    dispatch(register({ username, mailAddress, password, firstname, lastname }))
      .unwrap()
      .then(() => {
        setSuccessful(true);
        navigate('/login')
      })
      .catch(() => {
        setSuccessful(false);
      });
  };

  return (
    <div className="col-md-12 signup-form">
      <div className="card card-container">
      
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          <Form>
            {!successful && (
              <div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <Field name="username" type="text" className="form-control" />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="firstname">First Name</label>
                  <Field name="firstname" type="text" className="form-control" />
                  <ErrorMessage
                    name="firstname"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastname">Last Name</label>
                  <Field name="lastname" type="text" className="form-control" />
                  <ErrorMessage
                    name="lastname"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mailAddress">Email</label>
                  <Field name="mailAddress" type="email" className="form-control" />
                  <ErrorMessage
                    name="mailAddress"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <Field
                    name="password"
                    type="password"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="passwordConfirm">Confirm Password</label>
                  <Field
                    name="passwordConfirm"
                    type="password"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="passwordConfirm"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-primary btn-block">Sign Up</button>
                </div>
              </div>
            )}
          </Form>
        </Formik>
      </div>

      {message && (
        <div className="form-group">
          <div
            className={successful ? "alert alert-success" : "alert alert-danger"}
            role="alert"
          >
            {message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
