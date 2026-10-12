import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link to="/" className="text-lg font-semibold">
        Grove
      </Link>

      <nav className="flex items-center gap-4">
        <Link to="/cart">Cart</Link>

        {user ? (
          <>
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
