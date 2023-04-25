import React, { useEffect, useState, useContext } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useImmerReducer } from "use-immer"
import Axios from "axios"
import Page from "./Page"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"

function EditPost() {
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const originalState = {
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
    id: useParams().id,
    isFetching: true,
    saveChanges: false,
    sendCount: 0,
    notFound: false
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return
      case "updateTitle":
        draft.title.hasErrors = false
        draft.title.value = action.value
        return
      case "updateBody":
        draft.body.hasErrors = false
        draft.body.value = action.value
        return
      case "saveUpdates":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }

        return
      case "updateBegin":
        draft.saveChanges = true
        return
      case "updateComplete":
        draft.saveChanges = false
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
      case "notFound":
        draft.isFetching = false
        draft.notFound = true
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token })
        if (response.data) {
          if (appState.user.username != response.data.author.username) {
            appDispatch({ type: "flashMessage", value: "You are not allowed to edit that post.", alertType: "alert-warning" })
            navigate("/")
          }
          dispatch({ type: "fetchComplete", value: response.data })
        } else {
          dispatch({ type: "notFound" })
        }
      } catch (e) {
        console.log("There was a problem")
      }
    }
    fetchPost()
    return () => {
      ourRequest.cancel()
    }
  }, [])

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "updateBegin" })
      const ourRequest = Axios.CancelToken.source()
      async function updatePost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token })
          appDispatch({ type: "flashMessage", value: "Post was successfully updated.." })
          dispatch({ type: "updateComplete" })
        } catch (e) {
          console.log("There was a problem")
        }
      }
      updatePost()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.sendCount])

  if (state.isFetching) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )
  }

  if (state.notFound) {
    return <NotFound />
  }

  function handleUpdates(e) {
    e.preventDefault()
    dispatch({ type: "checkTitle", value: state.title.value })
    dispatch({ tupe: "checkBody", value: state.body.value })
    dispatch({ type: "saveUpdates" })
  }

  return (
    <Page title="Edit Post">
      <Link to={`/post/${state.id}`} className="font-weight-bold">
        &laquo; back to post permalink
      </Link>

      <form className="mt-3" onSubmit={handleUpdates}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({ type: "checkTitle", value: e.target.value })} value={state.title.value} onChange={e => dispatch({ type: "updateTitle", value: e.target.value })} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({ type: "checkBody", value: e.target.value })} value={state.body.value} onChange={e => dispatch({ type: "updateBody", value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" />
          {state.body.hasErrors && <div className="alert small alert-danger liveValidateMessage">{state.body.message}</div>}
        </div>

        <button className="btn btn-primary" disabled={state.saveChanges}>
          Update Post
        </button>
      </form>
    </Page>
  )
}

export default EditPost
