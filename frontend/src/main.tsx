import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'

import RootLayout from './routes/root'
import Home from './routes/home'
import Signup from './routes/signup'
import Login from './routes/login'
import Post from './routes/post'
import Terms from './routes/terms'
import NotFound from './routes/not-found'
import Profile from './components/Profile/Profile'
import Settings from './components/Settings/Settings'

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
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
        path: "profile/:username",
        element: <Profile />,
      },
      {
        path: "settings",
        element: <Settings />,
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

import { StoreProvider } from './store/StoreContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  </StrictMode>,
)
