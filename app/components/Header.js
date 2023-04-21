import React, { useState, useContext } from "react"
import { Link } from "react-router-dom"
import StateContext from "../StateContext"
import HeaderLoggedOut from "./HeaderLoggedOut"
import HeaderLoggedIn from "./HeaderLoggedIn"

function Header(props) {
  const appState = useContext(StateContext)
  const headerContent = appState.loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut />
  // staticEmpty prop comes from generateHtml.js
  return (
    <header className="header-bar bg-primary mb-3">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            WriteApp
            <i className="fas fa-pen-alt fa-xs"></i>
          </Link>
        </h4>
        {!props.staticEmpty ? headerContent : ""}
      </div>
    </header>
  )
}

export default Header
