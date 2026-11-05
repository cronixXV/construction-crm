import { supabase } from "@/shared/api/client";

import type { IUserProfile } from "../model/types/types";

export const getExecutors = async (): Promise<IUserProfile[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("role", "executor")
    .order("full_name", { ascending: true });

  if (error) throw error;

  return data;
};
