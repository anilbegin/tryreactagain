import React, { useState, useEffect } from "react"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import Page from "./Page"
import Axios from "axios"

function HomeGuest() {
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
    }
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
        // checkCount to be triggered to send Axios request( the Axios request checks if username already Exists in DB)
        if (!draft.username.hasErrors) {
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
        return
      case "emailAfterDelay":
        return
      case "emailIsUnique":
        return
      case "passwordImmediately":
        return
      case "passwordAfterDelay":
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  // check errors in username after a specific time delay
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 900)

      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  // procedure to check if the username is unique
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

  // when user submit the form
  async function handleSubmit(e) {
    e.preventDefault()
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
              <input onChange={e => dispatch({ type: "usernameImmediately", value: e.target.value })} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={e => setEmail(e.target.value)} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e => setPassword(e.target.value)} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
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
