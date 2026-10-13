import { Link } from "react-router-dom";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/stores/auth-store";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

const navLinkClass = cn(
  "rounded-sm px-2 py-1 text-sm font-medium text-foreground/70 transition-colors",
  "hover:text-foreground focus-visible:text-foreground",
  focusRing,
);

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const cart = useCart();

  const cartCount =
    cart.data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className={cn(
            "rounded-sm font-heading text-xl font-semibold tracking-wide text-foreground",
            focusRing,
          )}
        >
          Grove
        </Link>

        <nav aria-label="Main" className="flex flex-wrap items-center gap-2">
          <Link to="/products" className={navLinkClass}>
            Shop
          </Link>

          {user ? (
            <Link to="/orders" className={navLinkClass}>
              Orders
            </Link>
          ) : null}

          <Link
            to="/cart"
            className={cn(navLinkClass, "inline-flex items-center gap-1.5")}
            aria-label={
              cartCount > 0
                ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
                : "Cart"
            }
          >
            Cart
            {cartCount > 0 ? (
              <span
                aria-hidden="true"
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[0.65rem] font-semibold whitespace-nowrap text-background tabular-nums"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>

          {user ? (
            <div className="flex flex-wrap items-center gap-3 pl-2">
              {user.role === "admin" ? (
                <Link to="/admin" className={navLinkClass}>
                  Admin
                </Link>
              ) : null}
              <span className="max-w-40 truncate text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
