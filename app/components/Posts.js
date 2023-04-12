import React from "react"
import { Link } from "react-router-dom"

function Posts(props) {
  const post = props.post
  const date = new Date(post.createdDate)
  const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  return (
    <Link key={post._id} to={`/post/${post._id}`} onClick={props.onClick} className="list-group-item list-group-item-action">
      <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong>{" "}
      <span className="text-muted small">
        {!props.noAuthor && <>by {post.author.username}</>} on {formattedDate}{" "}
      </span>
    </Link>
  )
}

export default Posts
