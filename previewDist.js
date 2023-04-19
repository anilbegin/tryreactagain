// creating an express server to preview the 'dist' copy of our website on local PC, before pushing it to a server
// this script is triggered by 'npm run previewDist' [refer - package.json]
const express = require("express")
const path = require("path")
const app = new express()
app.use(express.static(path.join(__dirname, "dist")))
app.get("*", (req, res) => res.sendFile(__dirname + "/dist/index.html"))
app.listen("4000")
