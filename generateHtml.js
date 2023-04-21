import React from "react"
import ReactDOMServer from "react-dom/server"
import { StaticRouter as Router } from "react-router-dom/server"
import fs from "fs-extra"
import Header from "./app/components/Header"
import LoadingDotsIcon from "./app/components/LoadingDotsIcon"
import Footer from "./app/components/Footer"
import StateContext from "./app/StateContext"

function Shell() {
  // staticEmpty = true, because in skeleton we dont want to display HeaderLoggedIn & HeaderLoggedOut components to be displayed
  // apply modifications to Header.js component to satisfy this prop
  return (
    <StateContext.Provider value={{ loggedIn: false }}>
      <Router>
        <Header staticEmpty={true} />
        <div className="py-5 my-5 text-center">
          <LoadingDotsIcon />
        </div>
        <Footer />
      </Router>
    </StateContext.Provider>
  )
}

const startOfHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>OurApp</title>
    <link href="https://fonts.googleapis.com/css?family=Public+Sans:300,400,400i,700,700i&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous" />
    <script defer src="https://use.fontawesome.com/releases/v5.5.0/js/all.js" integrity="sha384-GqVMZRt5Gn7tB9D9q7ONtcp4gtHIUEW/yG7h98J7IpE3kpi+srfFyyB/04OV6pG0" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="/main.css" />
  </head>
  <body>
    <div id="app">`

const endOfHTML = `</div>
  </body>
 </html> 
 `

const filename = "./app/index-template.html"
const writeStream = fs.createWriteStream(filename)

writeStream.write(startOfHTML)

const myStream = ReactDOMServer.renderToPipeableStream(<Shell />, {
  onAllReady() {
    myStream.pipe(writeStream)
    writeStream.end(endOfHTML)
  }
})
