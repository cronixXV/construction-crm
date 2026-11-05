import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { AuthContext } from "./auth-context";
import type { IUserProfile } from "@/entities/user";
import { getProfileById } from "@/shared/api/auth";
import { supabase } from "@/shared/api/client";

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: IAuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const requestId = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async (userId: string) => {
      const currentRequestId = ++requestId.current;

      try {
        const nextProfile = await getProfileById(userId);

        if (isMounted && currentRequestId === requestId.current) {
          setProfile(nextProfile);
          setProfileError(null);
        }
      } catch {
        if (isMounted && currentRequestId === requestId.current) {
          setProfile(null);
          setProfileError("Не удалось загрузить профиль пользователя.");
        }
      } finally {
        if (isMounted && currentRequestId === requestId.current) {
          setIsLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession) {
        requestId.current += 1;
        setProfile(null);
        setProfileError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setProfileError(null);

      Promise.resolve().then(() => {
        if (isMounted) {
          void loadProfile(nextSession.user.id);
        }
      });
    });

    return () => {
      isMounted = false;
      requestId.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        signIn,
        signOut,
        profileError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
