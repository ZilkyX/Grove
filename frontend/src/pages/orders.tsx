import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/pagination";
import { useMyOrders } from "@/hooks/use-orders";
import { formatCurrency } from "@/lib/currency";
import type { OrderPaymentStatus } from "@/types/order";

const statusClass: Record<OrderPaymentStatus, string> = {
  paid: "text-emerald-700 dark:text-emerald-400",
  pending: "text-muted-foreground",
  failed: "text-destructive",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const orders = useMyOrders({ page });

  return (
    <div className="flex flex-col gap-8 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Your orders
      </h1>

      {orders.isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : orders.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-destructive">
            Couldn't load your orders. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={() => orders.refetch()}>
            Retry
          </Button>
        </div>
      ) : !orders.data || orders.data.orders.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground">
            You haven't placed any orders yet.
          </p>
          <Link to="/products">
            <Button variant="outline" size="sm">
              Browse products
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {orders.data.orders.map((order) => (
              <li key={order._id} className="flex flex-col gap-3 py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        statusClass[order.paymentStatus],
                      )}
                    >
                      {order.paymentStatus}
                    </span>
                    <span className="font-heading text-base font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {order.products.map((item, index) => (
                    <div
                      key={item.product?._id ?? index}
                      className="flex items-center gap-2"
                    >
                      <div className="size-10 shrink-0 overflow-hidden bg-muted">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.visibility = "hidden";
                            }}
                          />
                        ) : null}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.product?.name ?? "Product no longer available"} ×{" "}
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <Pagination
            page={orders.data.page}
            totalPages={orders.data.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
