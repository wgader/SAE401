import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import './index.css'

import RootLayout from './routes/root'
import Home from './routes/home'
import Signup from './routes/signup'
import Login from './routes/login'
import Post from './routes/post'
import PostDetail from './routes/post-detail'
import Terms from './routes/terms'
import NotFound from './routes/not-found'
import Profile from './components/Profile/Profile'
import FollowList from './components/Profile/FollowList'
import Settings from './components/Settings/Settings'
import Hashtag from './routes/hashtag'
import ExploreRoute from './routes/explore'

import { GlobalToast } from './components/ui/Feedback/GlobalToast';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <RootLayout />
        <GlobalToast />
      </>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "post",
        element: <Post />,
      },
      {
        path: "post/:id",
        element: <PostDetail />,
      },
      {
        path: "profile/:username",
        element: <Profile />,
      },
      {
        path: "profile/:username/followers",
        element: <FollowList type="followers" />,
      },
      {
        path: "profile/:username/following",
        element: <FollowList type="following" />,
      },
      {
        path: "profile/:username/blocked",
        element: <FollowList type="blocked" />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "hashtag/:hashtag",
        element: <Hashtag />,
      },
      {
        path: "explore",
        element: <ExploreRoute />,
      },
    ],
  },
  {
    path: "terms",
    element: <Terms />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    path: "login",
    element: <Login />,
  },
], {
  basename: import.meta.env.BASE_URL
})


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  </StrictMode>,
)
