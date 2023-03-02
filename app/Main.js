import React, { useState, useEffect, useReducer } from "react"
import ReactDOM from "react-dom/client"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Axios from "axios"
Axios.defaults.baseURL = "http://localhost:8080"

import Statecontext from "./StateContext"
import DispatchContext from "./DispatchContext"

// my components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Home from "./components/Home"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
import CreatePost from "./components/CreatePost"
import ViewSinglePost from "./components/ViewSinglePost"
import EditPost from "./components/EditPost"
import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import NotFound from "./components/NotFound"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessages: [],
    user: {
      username: localStorage.getItem("complexappUsername"),
      avatar: localStorage.getItem("complexappAvatar"),
      token: localStorage.getItem("complexappToken")
    }
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexappUsername", state.user.username)
      localStorage.setItem("complexappAvatar", state.user.avatar)
      localStorage.setItem("complexappToken", state.user.token)
    } else {
      localStorage.removeItem("complexappUsername")
      localStorage.removeItem("complexappAvatar")
      localStorage.removeItem("complexappToken")
    }
  }, [state.loggedIn])

  return (
    <Statecontext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Routes>
            <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/post/:id" element={<ViewSinglePost />} />
            <Route path="/post/:id/edit" element={<EditPost />} />
            <Route path="/profile/:username/*" element={<Profile />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </Statecontext.Provider>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

if (module.hot) {
  module.hot.accept()
}
