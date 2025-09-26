import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import SearchAlbumsPage from "./pages/SearchAlbumsPage";

// Import more pages as they are created
// import ArtistsPage from './pages/ArtistsPage';
// import ArtistDetailPage from './pages/ArtistDetailPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/albums/:id",
        element: <AlbumDetailPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/search",
        element: <SearchAlbumsPage />,
      },
      // Add more routes as they are created
      // { path: '/artists', element: <ArtistsPage /> },
      // { path: '/artists/:id', element: <ArtistDetailPage /> },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
