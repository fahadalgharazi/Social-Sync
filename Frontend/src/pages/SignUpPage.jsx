import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", password: "", confirmPassword: "",
    gender: "", bio: "", interests: "", zip: ""
  });
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }
    try {
      // get city from zip (as you do today)
      const resp = await fetch(`https://api.zippopotam.us/us/${form.zip}`);
      if (!resp.ok) throw new Error("Invalid ZIP code.");
      const zipData = await resp.json();
      const city = zipData.places?.[0]?.["place name"] ?? "";

      // Supabase auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email, password: form.password,
      });
      if (authErr) throw authErr;
      const userId = authData.user.id;

      // insert into your tables (same fields you used before)
      const { error: uErr } = await supabase.from("users").insert([
        { id: userId, email: form.email, password: form.password, created_at: new Date(), username: form.username }
      ]);
      if (uErr) throw uErr;

      const { error: udErr } = await supabase.from("user_data").insert([
        {
          id: userId,
          first_name: form.firstName,
          last_name: form.lastName,
          username: form.username,
          gender: form.gender,
          bio: form.bio,
          city,
          interests: form.interests.split(",").map(s => s.trim()),
          created_at: new Date(),
        }
      ]);
      if (udErr) throw udErr;

      nav("/questionnaire");
    } catch (e2) {
      setError(e2.message || "Sign up failed");
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Sign Up</h1>
      <form onSubmit={submit}>
        {/* keep your same fields */}
        <input placeholder="First Name" value={form.firstName} onChange={e=>setForm(f=>({...f, firstName:e.target.value}))} required/>
        <input placeholder="Last Name" value={form.lastName} onChange={e=>setForm(f=>({...f, lastName:e.target.value}))} required/>
        <input placeholder="Username" value={form.username} onChange={e=>setForm(f=>({...f, username:e.target.value}))} required/>
        <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} required/>
        <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} required/>
        <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={e=>setForm(f=>({...f, confirmPassword:e.target.value}))} required/>
        <input placeholder="ZIP" value={form.zip} onChange={e=>setForm(f=>({...f, zip:e.target.value}))} required/>
        <select value={form.gender} onChange={e=>setForm(f=>({...f, gender:e.target.value}))} required>
          <option value="">Gender</option>
          <option value="male">Male</option><option value="female">Female</option>
          <option value="nonbinary">Non-binary</option><option value="other">Other</option>
        </select>
        <textarea placeholder="Bio" value={form.bio} onChange={e=>setForm(f=>({...f, bio:e.target.value}))}/>
        <textarea placeholder="Interests (comma-separated)" value={form.interests} onChange={e=>setForm(f=>({...f, interests:e.target.value}))}/>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <button type="submit">Create Account</button>
      </form>
    </main>
  );
}
