import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailySalesPoint } from "@/types/analytics";

interface TrendChartProps {
  title: string;
  data: DailySalesPoint[] | undefined;
  dataKey: "revenue" | "sales";
  formatValue: (value: number) => string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function formatTick(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TrendChart({
  title,
  data,
  dataKey,
  formatValue,
  isLoading,
  isError,
  onRetry,
}: TrendChartProps) {
  const total = data?.reduce((sum, point) => sum + point[dataKey], 0) ?? 0;
  const summary = `${title}: ${formatValue(total)} total over the selected period.`;

  return (
    <div className="flex flex-col gap-3 border border-border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        {!isLoading && !isError ? (
          <span className="text-sm text-muted-foreground">
            {formatValue(total)} total
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <p role="alert" className="text-sm text-destructive">
            Couldn't load {title.toLowerCase()} data.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            Retry
          </button>
        </div>
      ) : !data || data.length === 0 || total === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">No data yet for this period.</p>
        </div>
      ) : (
        <div
          role="img"
          aria-label={summary}
          className="h-64 [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground [&_.recharts-cartesian-axis-tick-value]:text-xs"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatTick}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(value: number) => formatValue(value)}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value) => formatValue(Number(value))}
                labelFormatter={(label) => formatTick(String(label))}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: 0,
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
