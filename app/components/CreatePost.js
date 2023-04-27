import React, { useEffect, useContext } from "react"
import { useImmerReducer } from "use-immer"
import { useNavigate } from "react-router-dom"
import Page from "./Page"
import Axios from "axios"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"

function CreatePost() {
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  const initialState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    sendCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "saveTitle":
        draft.title.hasErrors = false
        draft.title.value = action.value
        return
      case "saveBody":
        draft.body.hasErrors = false
        draft.body.value = action.value
        return
      case "checkTitle":
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = "You must provide a title"
        }
        return
      case "checkBody":
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = "Body section cannot be left blank"
        }
        return
      case "savePost":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.sendCount) {
      async function savePost() {
        try {
          // baseURL set in in Main.js - http://localhost:8080, hence only written /create-post
          // token - the token is how the server knows that it can trust our request
          const response = await Axios.post("/create-post", { title: state.title.value, body: state.body.value, token: appState.user.token })
          //redirect to new post URL
          appDispatch({ type: "flashMessage", value: "Congratulations, you successfully created the post", alertType: "alert-success" })
          navigate(`/post/${response.data}`)
          //console.log("New Post was created")
        } catch (e) {
          console.log("There was Problem")
        }
      }
      savePost()
    }
  }, [state.sendCount])

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "checkTitle", value: state.title.value })
    dispatch({ type: "checkBody", value: state.body.value })
    dispatch({ type: "savePost" })
  }
  return (
    <Page title="Create New Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={e => dispatch({ type: "saveTitle", value: e.target.value })} autoFocus name="title" id="post-title" className="form-control form-control-sm form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={e => dispatch({ type: "saveBody", value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>

        <button className="btn btn-primary">Save Post</button>
      </form>
    </Page>
  )
}

export default CreatePost
