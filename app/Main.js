import React from "react"
import ReactDOM from "react-dom/client"

function ExampleComponent() {
  return (
    <>
      <h2>A Sample React Application.</h2>
      <p>this is a sample Application to demonstrate React js component being displayed on browser</p>
    </>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<ExampleComponent />)

if (module.hot) {
  module.hot.accept()
}
