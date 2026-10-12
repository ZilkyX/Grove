import { useEffect, type ReactNode } from "react";
import { useProfile } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isError } = useProfile();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (data) {
      setUser(data);
    } else if (isError) {
      setUser(null);
    }
  }, [data, isError, setUser]);

  return children;
}
