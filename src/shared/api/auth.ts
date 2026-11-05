import { supabase } from "./client";

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
};

export const getCurrentProfile = async () => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!sessionData.session) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", sessionData.session.user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};
