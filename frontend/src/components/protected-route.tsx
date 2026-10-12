import { Navigate, Outlet } from "react-router-dom";
import { useProfile } from "@/hooks/use-auth";
import type { User } from "@/types/user";

interface ProtectedRouteProps {
  role?: User["role"];
}

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { data: user, isLoading, isError } = useProfile();

  if (isLoading) {
    return null;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
