import React, { useEffect, useContext } from "react"
import { useImmer } from "use-immer"
import { useParams, NavLink, Routes, Route } from "react-router-dom"
import Axios from "axios"
import StateContext from "../StateContext"

import Page from "./Page"
import ProfilePosts from "./ProfilePosts"
import ProfileFollowers from "./ProfileFollowers"
import ProfileFollowing from "./ProfileFollowing"
import NotFound from "./NotFound"
// import ProfileFollow from "./ProfileFollow"

function Profile() {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: 0, followerCount: 0, followingCount: 0 }
    },
    notFound: false
  })

  // get all information about the Profile
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function profileInfo() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
        if (!response.data) {
          setState(draft => {
            draft.notFound = true
          })
        } else {
          setState(draft => {
            draft.profileData = response.data
          })
        }
      } catch (e) {
        console.log("There was a problem")
      }
    }

    profileInfo()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  // start following a user
  useEffect(() => {
    if (state.startFollowingRequestCount > 0) {
      setState(draft => {
        draft.followActionLoading = true
      })

      const ourRequest = Axios.CancelToken.source()
      async function startFollowProcess() {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("There was a problem")
        }
      }

      startFollowProcess()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.startFollowingRequestCount])

  // stop following a user
  useEffect(() => {
    if (state.stopFollowingRequestCount > 0) {
      setState(draft => {
        draft.followActionLoading = true
      })

      const ourRequest = Axios.CancelToken.source()
      async function stopFollowProcess() {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("There was a problem")
        }
      }

      stopFollowProcess()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.stopFollowingRequestCount])

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  if (state.notFound) {
    return <NotFound />
  }

  return (
    <Page title={appState.user.username != username || !appState.loggedIn ? username + "'s Profile" : "Your profile"}>
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && appState.user.username != state.profileData.profileUsername && !state.profileData.isFollowing && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {appState.loggedIn && appState.user.username != state.profileData.profileUsername && state.profileData.isFollowing && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            Stop Following <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink to="" end className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to="followers" className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to="following" className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Routes>
        <Route path="" element={<ProfilePosts />} />
        <Route path="followers" element={<ProfileFollowers />} />
        <Route path="following" element={<ProfileFollowing />} />
      </Routes>
    </Page>
  )
}

export default Profile
