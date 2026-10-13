import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user";

export const AUTH_PROFILE_QUERY_KEY = ["auth", "profile"] as const;

export function useProfile() {
  return useQuery({
    queryKey: AUTH_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<User>("/auth/profile");
      return data;
    },
    retry: false,
    throwOnError: false,
  });
}

interface LoginInput {
  email: string;
  password: string;
}

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<User>("/auth/login", input);
      return data;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, user);
    },
  });
}

interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export function useSignUp() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      const { data } = await api.post<{ user: User }>("/auth/signup", input);
      return data.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, user);
    },
  });
}

export function useLogout() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      setUser(null);
      // Clear everything so the next user on this tab (if any) never sees
      // this user's cached cart/orders/admin data before it refetches.
      queryClient.clear();
      queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, null);
    },
  });
}
