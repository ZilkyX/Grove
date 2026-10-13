import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only rounded-sm bg-background px-4 py-2 text-sm font-medium shadow-sm ring-2 ring-ring/30 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
      >
        Skip to content
      </a>
      <Navbar />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <Outlet />
      </main>
    </div>
  );
}
