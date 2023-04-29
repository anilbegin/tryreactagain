import React, { useState, useEffect, useContext } from "react"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import Page from "./Page"
import Axios from "axios"
import DispatchContext from "../DispatchContext"

function HomeGuest() {
  const appDispatch = useContext(DispatchContext)
  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      sendCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      sendCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false
        draft.username.value = action.value
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.message = "Username should not exceed 30 characters"
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.message = "Only alphabets and numbers are allowed"
        }
        return
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.message = "Username has to be atleast 3 characters long"
        }
        // if there are no Errors found yet, then start procedure of chcking if username us Unique
        // checkCount to be triggered to send Axios request( the Axios request checks if username already Exists in DB)
        if (!draft.username.hasErrors && !action.submitCheck) {
          draft.username.sendCount++
        }
        return
      case "usernameIsUnique":
        // dispatched after Axios request responds to if Username is unique
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.message = "This username is already in use"
        } else {
          draft.username.isUnique = true
        }
        return
      case "emailImmediately":
        draft.email.hasErrors = false
        draft.email.value = action.value
        return
      case "emailAfterDelay":
        if (!/^[a-zA-Z0-9]+\.?[a-zA-Z0-9]+@(yahoo|ymail|rocketmail|gmail|rediffmail|outlook|live)\.com$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.message = "you need to enter a valid email address"
        }
        // if there are no errors yet, then start procedure to check if email already exists/in use
        if (!draft.email.hasErrors && !action.submitCheck) {
          draft.email.sendCount++
        }
        return
      case "emailIsUnique":
        if (action.value) {
          draft.email.isUnique = false
          draft.email.hasErrors = true
          draft.email.message = "this email is already in use"
        } else {
          draft.email.isUnique = true
        }
        return
      case "passwordImmediately":
        draft.password.hasErrors = false
        draft.password.value = action.value
        return
      case "passwordAfterDelay":
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.message = "Password should not exceed 50 characters"
        }
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true
          draft.password.message = "Password should have atleast 12 characters"
        }
        return
      case "submitForm":
        if (!draft.username.hasErrors && !draft.email.hasErrors && !draft.password.hasErrors && draft.username.isUnique && draft.email.isUnique) {
          draft.submitCount++
        }
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  // check errors in USERNAME after a specific time delay
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 900)

      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  // procedure to check if the USERNAME is unique
  useEffect(() => {
    if (state.username.sendCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesUsernameExist", { username: state.username.value }, { cancelToken: ourRequest.token })
          dispatch({ type: "usernameIsUnique", value: response.data })
        } catch (e) {
          console.log("There was a problem")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.username.sendCount])

  // procedure to trigger dispatch of EMAILafterdelay check
  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800)

      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  //procedure to check if EMAIL Address already exists in database
  useEffect(() => {
    if (state.email.sendCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesEmailExist", { email: state.email.value }, { cancelToken: ourRequest.token })
          dispatch({ type: "emailIsUnique", value: response.data })
        } catch (e) {
          console.log("there was a problem")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.email.sendCount])

  // check PASSWORD for errors after a time delay
  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800)

      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  // when user submits the form Step -2
  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/register", { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: ourRequest.token })
          //console.log(response.data) // returns Token, Username, Avatar
          appDispatch({ type: "login", data: response.data }) // if registration success, then proceed to login
          appDispatch({ type: "flashMessage", value: "Congrats, you have successfully registered !", alertType: "alert-success" })
        } catch (e) {
          console.log("There was a problem")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.submitCount])

  // when user submits the form Step -1
  async function handleSubmit(e) {
    e.preventDefault()
    // mainly checking for validation again if user leaves any Field Blank
    // submitCheck action, helps to avoid sending unneeded Axios request for isUnique check again
    dispatch({ type: "usernameAfterDelay", value: state.username.value, submitCheck: true })
    dispatch({ type: "emailAfterDelay", value: state.email.value, submitCheck: true })
    dispatch({ type: "passwordAfterDelay", value: state.password.value })
    dispatch({ type: "submitForm" })
  }
  return (
    <Page title="Homepage" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={e => dispatch({ type: "usernameImmediately", value: e.target.value })} id="username-register" name="username" className={"form-control" + (state.username.isUnique && state.username.value ? " is-valid" : "")} type="text" placeholder="Pick a username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={e => dispatch({ type: "emailImmediately", value: e.target.value })} id="email-register" name="email" className={"form-control" + (state.email.isUnique && state.email.value ? " is-valid" : "")} type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e => dispatch({ type: "passwordImmediately", value: e.target.value })} id="password-register" name="password" className={"form-control" + (state.password.value.length >=12 && state.password.value.length <=50 ? " is-valid" : "")} type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default HomeGuest
