import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { me } from "../api/authApi";

export default function AuthGuard({ children }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let cancel = false;
    me().then(u => !cancel && setState({ loading: false, user: u }))
        .catch(() => !cancel && setState({ loading: false, user: null }));
    return () => { cancel = true; };
  }, []);

  if (state.loading) return null; // or a spinner
  if (!state.user) return <Navigate to="/login" replace />;
  return children;
}
