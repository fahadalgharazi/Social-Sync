import { createBrowserRouter } from "react-router-dom";
import App from "./app.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignUpPage from "../pages/SignUpPage.jsx";
import QuestionnairePage from "../pages/QuestionnairePage.jsx";
import EventsPage from "../pages/EventsPage.jsx";
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
    ],
  },
]);
