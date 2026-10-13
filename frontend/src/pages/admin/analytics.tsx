import { useState } from "react";
import { cn } from "cn";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/admin/stat-tile";
import { TrendChart } from "@/components/admin/trend-chart";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatCurrency } from "@/lib/currency";
import {
  ANALYTICS_RANGE_OPTIONS,
  type AnalyticsRangeDays,
} from "@/types/analytics";

const numberFormatter = new Intl.NumberFormat("en-US");
const formatCount = (value: number) => numberFormatter.format(value);

const paymentStatusClass: Record<string, string> = {
  paid: "text-emerald-700 dark:text-emerald-400",
  pending: "text-muted-foreground",
  failed: "text-destructive",
};

export function AdminAnalyticsPage() {
  const [days, setDays] = useState<AnalyticsRangeDays>(7);
  const analytics = useAnalytics(days);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Analytics
        </h1>

        <div
          role="group"
          aria-label="Date range"
          className="flex items-center gap-1 border border-border p-1"
        >
          {ANALYTICS_RANGE_OPTIONS.map((option) => (
            <Button
              key={option.days}
              type="button"
              size="xs"
              variant={days === option.days ? "secondary" : "ghost"}
              aria-pressed={days === option.days}
              onClick={() => setDays(option.days)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {analytics.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-destructive">
            Couldn't load analytics data. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={() => analytics.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="Revenue"
              value={formatCurrency(analytics.data?.summary.totalRevenue ?? 0)}
              icon={DollarSign}
              isLoading={analytics.isLoading}
            />
            <StatTile
              label="Orders"
              value={formatCount(analytics.data?.summary.totalOrders ?? 0)}
              icon={ShoppingBag}
              isLoading={analytics.isLoading}
            />
            <StatTile
              label="Products"
              value={formatCount(analytics.data?.summary.totalProducts ?? 0)}
              icon={Package}
              isLoading={analytics.isLoading}
            />
            <StatTile
              label="Customers"
              value={formatCount(analytics.data?.summary.totalCustomers ?? 0)}
              icon={Users}
              isLoading={analytics.isLoading}
            />
          </div>
          <p className="-mt-4 text-xs text-muted-foreground">
            Totals are all-time. Charts and best sellers below reflect the
            selected date range.
          </p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TrendChart
              title="Revenue"
              data={analytics.data?.dailySales}
              dataKey="revenue"
              formatValue={formatCurrency}
              isLoading={analytics.isLoading}
              isError={analytics.isError}
              onRetry={() => analytics.refetch()}
            />
            <TrendChart
              title="Orders"
              data={analytics.data?.dailySales}
              dataKey="sales"
              formatValue={formatCount}
              isLoading={analytics.isLoading}
              isError={analytics.isError}
              onRetry={() => analytics.refetch()}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-lg font-semibold">
                Best-selling products
              </h2>

              {analytics.isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : !analytics.data?.topProducts.length ? (
                <p className="text-sm text-muted-foreground">
                  No sales yet for this period.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Product
                        </th>
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Sold
                        </th>
                        <th scope="col" className="py-2 font-semibold">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analytics.data.topProducts.map((product) => (
                        <tr key={product.productId}>
                          <td className="max-w-48 py-2 pr-4">
                            <div className="flex min-w-0 items-center gap-2">
                              <img
                                src={product.image}
                                alt=""
                                className="size-8 shrink-0 bg-muted object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.visibility = "hidden";
                                }}
                              />
                              <span className="truncate">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4 tabular-nums">
                            {formatCount(product.quantitySold)}
                          </td>
                          <td className="py-2 tabular-nums">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-lg font-semibold">
                Recent orders
              </h2>

              {analytics.isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : !analytics.data?.recentOrders.length ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Customer
                        </th>
                        <th scope="col" className="py-2 pr-4 font-semibold">
                          Status
                        </th>
                        <th scope="col" className="py-2 font-semibold">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analytics.data.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="max-w-48 py-2 pr-4">
                            <span className="block truncate">
                              {order.user?.name ?? "Deleted user"}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "py-2 pr-4 capitalize",
                              paymentStatusClass[order.paymentStatus],
                            )}
                          >
                            {order.paymentStatus}
                          </td>
                          <td className="py-2 tabular-nums">
                            {formatCurrency(order.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
