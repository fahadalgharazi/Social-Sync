import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Adjust this import path to where your helper lives:
import { signup, login } from "../features/auth/api/authApi";

export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    bio: "",
    interests: "", // comma-separated
    zip: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    // Minimal client-side checks; backend is source of truth
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password, // don't trim passwords
      gender: form.gender,
      bio: form.bio,
      interests: form.interests, // backend will split & sanitize
      zip: form.zip.trim(),
    };

    try {
      setSubmitting(true);
      await signup(payload); // POST /auth/signup (BFF)
      await login(payload.email,payload.password);
      nav("/questionnaire");
    } catch (e) {
      // Show a friendly message; backend sends status + message
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Sign up failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Sign Up</h1>
      <form onSubmit={submit}>
        <input
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          required
        />
        <input
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          required
        />
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm((f) => ({ ...f, confirmPassword: e.target.value }))
          }
          required
        />
        <input
          inputMode="numeric"
          placeholder="ZIP"
          value={form.zip}
          onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
          required
        />
        <select
          value={form.gender}
          onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
          required
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="nonbinary">Non-binary</option>
          <option value="other">Other</option>
        </select>
        <textarea
          placeholder="Bio"
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
        />
        <textarea
          placeholder="Interests (comma-separated)"
          value={form.interests}
          onChange={(e) =>
            setForm((f) => ({ ...f, interests: e.target.value }))
          }
        />
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Account"}
        </button>
      </form>
    </main>
  );
}
