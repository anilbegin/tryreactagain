import React, { useEffect, useState, useContext } from "react"
import { useImmerReducer } from "use-immer"
import Axios from "axios"
import DispatchContext from "../DispatchContext"

function HeaderLoggedOut(props) {
  const appDispatch = useContext(DispatchContext)

  const initialState = {
    username: {
      value: "",
      hasErrors: false
    },
    password: {
      value: "",
      hasErrors: false
    },
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "storeUsername":
        draft.username.hasErrors = false
        draft.username.value = action.value
        return
      case "storePassword":
        draft.password.hasErrors = false
        draft.password.value = action.value
        return
      case "checkUsername":
        if (!draft.username.value) {
          draft.username.hasErrors = true
        }
        return
      case "checkPassword":
        if (!draft.password.value) {
          draft.password.hasErrors = true
        }
        return
      case "submitForm":
        if (!draft.username.hasErrors && !draft.password.hasErrors) {
          draft.submitCount++
        }
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  // procedure to submit the login details to server
  useEffect(() => {
    if (state.submitCount) {
      //alert("form has been submitted")
      async function submitForm() {
        try {
          const response = await Axios.post("/login", { username: state.username.value, password: state.password.value })
          //console.log(response.data)
          if (response.data) {
            appDispatch({ type: "login", data: response.data })
            appDispatch({ type: "flashMessage", value: "You have logged in successfully !" })
          } else {
            //console.log("Incorrect Username/Password")
            appDispatch({ type: "flashMessage", value: "Invalid username/password" })
          }
        } catch (e) {
          console.log("There was a problem")
        }
      }
      submitForm()
    }
  }, [state.submitCount])

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "checkUsername", value: state.username.value })
    dispatch({ type: "checkPassword", value: state.password.value })
    dispatch({ type: "submitForm" })
  }
  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => dispatch({ type: "storeUsername", value: e.target.value })} name="username" className={"form-control form-control-sm input-dark" + (state.username.hasErrors ? " is-invalid" : "")} type="text" placeholder="Username" autoComplete="off" />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={e => dispatch({ type: "storePassword", value: e.target.value })} name="password" className={"form-control form-control-sm input-dark" + (state.password.hasErrors ? " is-invalid" : "")} type="password" placeholder="Password" />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  )
}

export default HeaderLoggedOut
