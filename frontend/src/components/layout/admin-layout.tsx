import { NavLink, Outlet } from "react-router-dom";
import { cn } from "cn";
import { BarChart3, Package, PlusCircle } from "lucide-react";

const adminNavItems = [
  { to: "/admin", label: "Analytics", icon: BarChart3, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: true },
  { to: "/admin/products/new", label: "Create product", icon: PlusCircle, end: false },
];

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
    isActive
      ? "bg-secondary text-secondary-foreground"
      : "text-foreground/70 hover:bg-secondary/60 hover:text-foreground",
  );

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-8 py-8 lg:flex-row lg:items-start">
      <nav
        aria-label="Admin"
        className="flex shrink-0 flex-row flex-wrap gap-2 border-b border-border pb-4 lg:w-48 lg:flex-col lg:border-b-0 lg:border-r lg:pr-4 lg:pb-0"
      >
        {adminNavItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={navItemClass}>
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
