import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSessionUser, onAuth } from "../api/authApi";

export default function AuthGuard({ children }) {
  const [user, setUser] = useState(undefined); // undefined while loading

  useEffect(() => {
    let cancel = false;
    (async () => {
      const u = await getSessionUser();
      if (!cancel) setUser(u ?? null);
    })();
    const off = onAuth(u => setUser(u ?? null));
    return () => { cancel = true; off?.(); };
  }, []);

  if (user === undefined) return null; // or spinner
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
