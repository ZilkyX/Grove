import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/components/layout/root-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { SignUpPage } from "@/pages/signup";
import { ProductsPage } from "@/pages/products";
import { ProductDetailPage } from "@/pages/product-detail";
import { CartPage } from "@/pages/cart";
import { OrdersPage } from "@/pages/orders";
import { CheckoutSuccessPage } from "@/pages/checkout-success";
import { CheckoutCancelPage } from "@/pages/checkout-cancel";
import { NotFoundPage } from "@/pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "product/:id", element: <ProductDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "cart", element: <CartPage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "success", element: <CheckoutSuccessPage /> },
          { path: "cancel", element: <CheckoutCancelPage /> },
        ],
      },
      {
        path: "admin",
        element: <ProtectedRoute role="admin" />,
        children: [
          {
            lazy: () =>
              import("@/components/layout/admin-layout").then((m) => ({
                Component: m.AdminLayout,
              })),
            children: [
              {
                index: true,
                lazy: () =>
                  import("@/pages/admin/analytics").then((m) => ({
                    Component: m.AdminAnalyticsPage,
                  })),
              },
              {
                path: "products",
                lazy: () =>
                  import("@/pages/admin/products").then((m) => ({
                    Component: m.AdminProductsPage,
                  })),
              },
              {
                path: "products/new",
                lazy: () =>
                  import("@/pages/admin/create-product").then((m) => ({
                    Component: m.AdminCreateProductPage,
                  })),
              },
              {
                path: "products/:id/edit",
                lazy: () =>
                  import("@/pages/admin/edit-product").then((m) => ({
                    Component: m.AdminEditProductPage,
                  })),
              },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
