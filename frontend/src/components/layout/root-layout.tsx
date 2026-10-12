import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
