import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import Page from "./Page"

function NotFound() {
  return (
    <Page title="Page Not Found">
      <div className="text-center">
        <h2>Whoops!!, we can't find that page.</h2>
        <p className="lead text-muted">
          You can always go back to the <Link to="/">homepage</Link> and make a fresh start.
        </p>
      </div>
    </Page>
  )
}

export default NotFound
