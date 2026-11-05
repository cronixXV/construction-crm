import { createContext } from "react";

import type { Session } from "@supabase/supabase-js";
import type { IUserProfile } from "@/entities/user";

export interface IAuthContext {
  session: Session | null;
  profile: IUserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  profileError: string | null;
}

export const AuthContext = createContext<IAuthContext | null>(null);
