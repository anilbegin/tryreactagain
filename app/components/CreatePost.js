import React, { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import Page from "./Page"
import Axios from "axios"
import DispatchContext from "../DispatchContext"

function CreatePost() {
  const [title, setTitle] = useState()
  const [body, setBody] = useState()
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  async function handleSubmit(e) {
    e.preventDefault()
    try {
      // set URL base in Main.js - http://localhost:8080, hence only written /create-post
      // c - Token - the token is how the server knows that it can trust our request
      const response = await Axios.post("/create-post", { title, body, token: localStorage.getItem("complexappToken") })
      //redirect to new post URL
      appDispatch({ type: "flashMessage", value: "Congratulations, you successfully created the post" })
      navigate(`/post/${response.data}`)
      console.log("New Post was created")
    } catch (e) {
      console.log("There was Problem")
    }
  }
  return (
    <Page title="Create New Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={e => setTitle(e.target.value)} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={e => setBody(e.target.value)} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  )
}

export default CreatePost
