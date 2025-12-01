import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignUpPage from "../pages/SignUpPage.jsx";
import QuestionnairePage from "../pages/QuestionnairePage.jsx";
import EventsPage from "../pages/EventsPage.jsx";
import FriendsPage from "../features/friends/pages/FriendsPage.jsx";
import FriendProfilePage from "../features/users/pages/FriendProfilePage.jsx";
import ProfilePage from "../features/profile/pages/ProfilePage.jsx";
import GroupsPage from "../features/groups/pages/GroupsPage.jsx";
import AuthGuard from "../features/auth/components/AuthGuard.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      {
        path: "questionnaire",
        element: (
          <AuthGuard>
            <QuestionnairePage />
          </AuthGuard>
        ),
      },
      {
        path: "events",
        element: (
          <AuthGuard>
            <EventsPage />
          </AuthGuard>
        ),
      },
      {
        path: "friends",
        element: (
          <AuthGuard>
            <FriendsPage />
          </AuthGuard>
        ),
      },
      {
        path: "friends/:friendId",
        element: (
          <AuthGuard>
            <FriendProfilePage />
          </AuthGuard>
        ),
      },
      {
        path: "profile",
        element: (
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        ),
      },
      {
        path: "groups",
        element: (
          <AuthGuard>
            <GroupsPage />
          </AuthGuard>
        ),
      },
    ],
  },
]);
