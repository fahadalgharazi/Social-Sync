import { supabase } from "../../../lib/supabase";

export async function signIn({ email, password }) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp({ email, password }) {
  return await supabase.auth.signUp({ email, password });
}

export async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export function onAuth(cb) {
  const { data } = supabase.auth.onAuthStateChange((_e, session) => {
    cb(session?.user ?? null);
  });
  return () => data.subscription?.unsubscribe?.();
}
