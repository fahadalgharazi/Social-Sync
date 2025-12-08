import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "./App.jsx";
import AuthGuard from "../features/auth/components/AuthGuard.jsx";

const LandingPage = lazy(() => import("../pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("../pages/LoginPage.jsx"));
const SignUpPage = lazy(() => import("../pages/SignUpPage.jsx"));
const QuestionnairePage = lazy(() => import("../pages/QuestionnairePage.jsx"));
const EventsPage = lazy(() => import("../pages/EventsPage.jsx"));
const FriendsPage = lazy(() => import("../features/friends/pages/FriendsPage.jsx"));
const FriendProfilePage = lazy(() => import("../features/users/pages/FriendProfilePage.jsx"));
const ProfilePage = lazy(() => import("../features/profile/pages/ProfilePage.jsx"));
const GroupsPage = lazy(() => import("../features/groups/pages/GroupsPage.jsx"));

const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <SuspenseWrapper><LandingPage /></SuspenseWrapper>
      },
      {
        path: "login",
        element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>
      },
      {
        path: "signup",
        element: <SuspenseWrapper><SignUpPage /></SuspenseWrapper>
      },
      {
        path: "questionnaire",
        element: (
          <AuthGuard>
            <SuspenseWrapper><QuestionnairePage /></SuspenseWrapper>
          </AuthGuard>
        ),
      },
      {
        path: "events",
        element: (
          <AuthGuard>
            <SuspenseWrapper><EventsPage /></SuspenseWrapper>
          </AuthGuard>
        ),
      },
      {
        path: "friends",
        element: (
          <AuthGuard>
            <SuspenseWrapper><FriendsPage /></SuspenseWrapper>
          </AuthGuard>
        ),
      },
      {
        path: "friends/:friendId",
        element: (
          <AuthGuard>
            <SuspenseWrapper><FriendProfilePage /></SuspenseWrapper>
          </AuthGuard>
        ),
      },
      {
        path: "profile",
        element: (
          <AuthGuard>
            <SuspenseWrapper><ProfilePage /></SuspenseWrapper>
          </AuthGuard>
        ),
      },
      {
        path: "groups",
        element: (
          <AuthGuard>
            <SuspenseWrapper><GroupsPage /></SuspenseWrapper>
          </AuthGuard>
        ),
      },
    ],
  },
]);
