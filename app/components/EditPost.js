import React, { useEffect, useState, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import { useImmerReducer } from "use-immer"
import Axios from "axios"
import Page from "./Page"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function EditPost() {
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
    sendCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return
      case "updateTitle":
        draft.title.value = action.value
        return
      case "updateBody":
        draft.body.value = action.value
        return
      case "saveUpdates":
        draft.sendCount++
        return
      case "updateBegin":
        draft.saveChanges = true
        return
      case "updateComplete":
        draft.saveChanges = false
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token })
        dispatch({ type: "fetchComplete", value: response.data })
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

  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )

  function handleUpdates(e) {
    e.preventDefault()
    dispatch({ type: "saveUpdates" })
  }

  return (
    <Page title="Edit Post">
      <form onSubmit={handleUpdates}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input value={state.title.value} onChange={e => dispatch({ type: "updateTitle", value: e.target.value })} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea value={state.body.value} onChange={e => dispatch({ type: "updateBody", value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" />
        </div>

        <button className="btn btn-primary" disabled={state.saveChanges}>
          Update Post
        </button>
      </form>
    </Page>
  )
}

export default EditPost
