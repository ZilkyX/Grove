import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/components/layout/root-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { SignUpPage } from "@/pages/signup";
import { CartPage } from "@/pages/cart";
import { NotFoundPage } from "@/pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "cart", element: <CartPage /> }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
