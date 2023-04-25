import React, { useEffect } from "react"
import Page from "./Page"

function About() {
  return (
    <Page title="About Us">
      <h2>About Us</h2>
      <p className="lead text-muted">WriteApp is a free article publishing site. Here you can give wings to your thoughts and spread the word to like minded people.</p>
      <p>We have made it very easy for you to get inspired and create new ideas of your own through the posts created by other members of the website. Just reigster yourself and take help of our 'Search' functionality, search for your favorite topic of interest and the website will present to you posts created on topic that matches your keyword</p>
      <p>This website is created with the sole purpose of demonstrating the website owners ability to create Frontend for the website using React library. The website uses Node.js as the backend, and mongoDB for handling database operations</p>
      <p>The basic design pattern of the website is created using Bootstrap.</p>
    </Page>
  )
}

export default About
