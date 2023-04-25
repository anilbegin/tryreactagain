import React, { useEffect } from "react"

function FlashMessages(props) {
  return (
    <div className="floating-alerts">
      {props.messages.map((msg, index) => {
        return (
          <div key={index} className={props.alert + " alert text-center floating-alert shadow-sm"}>
            {msg}
          </div>
        )
      })}
    </div>
  )
}

export default FlashMessages
