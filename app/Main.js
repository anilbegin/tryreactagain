import React, { useState, useEffect, useReducer, Suspense } from "react"
import ReactDOM from "react-dom/client"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
//Axios.defaults.baseURL = "http://localhost:8080"
Axios.defaults.baseURL = process.env.BACKENDURL || "https://reactpracticebackend.onrender.com" // procedure done after declaring defaultURL in .env file

import Statecontext from "./StateContext"
import DispatchContext from "./DispatchContext"

// my components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Home from "./components/Home"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
//import CreatePost from "./components/CreatePost"
const CreatePost = React.lazy(() => import("./components/CreatePost"))
//import ViewSinglePost from "./components/ViewSinglePost"
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))
import EditPost from "./components/EditPost"
import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import NotFound from "./components/NotFound"
//import Search from "./components/Search"
const Search = React.lazy(() => import("./components/Search"))
//import Chat from "./components/Chat"
const Chat = React.lazy(() => import("./components/Chat"))
import LoadingDotsIcon from "./components/LoadingDotsIcon"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessages: [], // stacks alert messages in an array passed as prop to FlashMessages component
    alertColor: "", // stores the color for the flash message
    user: {
      username: localStorage.getItem("complexappUsername"),
      avatar: localStorage.getItem("complexappAvatar"),
      token: localStorage.getItem("complexappToken")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
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
        draft.alertColor = action.alertType // specifies Custom color for alert message, eg: alert-danger, alert-success
        return
      case "openSearch":
        draft.isSearchOpen = true
        return
      case "closeSearch":
        draft.isSearchOpen = false
        return
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        return
      case "closeChat":
        draft.isChatOpen = false
        return
      case "increaseUnreadChatCount":
        draft.unreadChatCount++
        return
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
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

  // check if the Token has expired on First render
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token })
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "your session has expired, please login again..", alertType: "alert-info" })
          }
        } catch (e) {
          console.log("There was a problem")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [])

  return (
    <Statecontext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages alert={state.alertColor} messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
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
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
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
