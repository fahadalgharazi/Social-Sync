import { http } from "../../../lib/http";

export const login = (email, password) =>
  http.post("/auth/login", { email, password }).then((r) => r.data);

export const signup = (payload) => http.post("/auth/signup", payload).then((r) => r.data);

export const logout = () => http.post("/auth/logout").then((r) => r.data);

export const me = () => http.get("/auth/me").then((r) => r.data.user);
