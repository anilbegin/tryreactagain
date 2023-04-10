import React, { useEffect, useState, useContext } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Axios from "axios"
import ReactMarkdown from "react-markdown"
import ReactTooltip from "react-tooltip"
import Page from "./Page"
import LoadingDotsIcon from "./LoadingDotsIcon"
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost() {
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const navigate = useNavigate()

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token })
        setPost(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("There was a problem")
      }
    }
    fetchPost()
    return () => {
      ourRequest.cancel()
    }
  }, [id])

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )
  if (!isLoading && !post) {
    return <NotFound />
  }

  const date = new Date(post.createdDate)
  const formattedDate = `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`

  async function handleDelete() {
    const areYouSure = window.confirm("Are you sure you want to delete thr post")
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } })
        if (response.data == "Success") {
          appDispatch({ type: "flashMessage", value: "Your post was Deleted successfully." })
          navigate(`/profile/${appState.user.username}`)
        }
      } catch (e) {
        console.log("There was problem")
      }
    }
  }

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link data-tip="Edit" data-for="edit" to={`/post/${id}/edit`} className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />
            <a onClick={handleDelete} data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {formattedDate}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} allowedElements={["p", "br", "strong", "em", "h1", "h2", "h3", "h4", "h5", "ul", "ol", "li"]} />
      </div>
    </Page>
  )
}

export default ViewSinglePost
