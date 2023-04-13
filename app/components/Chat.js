import React, { useContext, useRef, useEffect } from "react"
import { useImmer } from "use-immer"
import { Link } from "react-router-dom"
import io from "socket.io-client"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

// will establish an ongoing connection between the Browser and the backend server
const socket = io("http://localhost:8080")

function Chat() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const chatField = useRef(null)
  const chatLog = useRef(null)

  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: []
  })

  // focus on the input field as soon as you open the chat window
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus()
      // code for clearing unreadChatCount
      appDispatch({ type: "clearUnreadChatCount" })
    }
  }, [appState.isChatOpen])

  // 'chatFromBrowser', 'chatFromServer' event names refered from "backend-api/app.js" file.
  // frontend needs to begin listening for an event named chatFromServer
  // we would want to begin lisgtening for it, the first time this component renders
  // hence the below useEffect
  useEffect(() => {
    socket.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message)
      })
    })
  }, [])

  useEffect(() => {
    // watch the chatMessages for changes and scroll the chatLog div to the bottom most position
    chatLog.current.scrollTop = chatLog.current.scrollHeight
    // below code apploed for adding Unread chat count
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: "increaseUnreadChatCount" })
    }
  }, [state.chatMessages])

  function handleChatField(e) {
    const value = e.target.value
    setState(draft => {
      draft.fieldValue = value
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    // send the chat message to the server
    socket.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token })
    setState(draft => {
      // add message to state collection of messgaes
      draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar })
      draft.fieldValue = ""
    })
  }

  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right" + (appState.isChatOpen ? " chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={() => appDispatch({ type: "closeChat" })} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            )
          }
          return (
            <div className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input value={state.fieldValue} onChange={handleChatField} ref={chatField} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  )
}

export default Chat
