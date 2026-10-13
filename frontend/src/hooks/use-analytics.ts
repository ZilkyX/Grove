import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalyticsRangeDays, AnalyticsResponse } from "@/types/analytics";

export function useAnalytics(days: AnalyticsRangeDays) {
  return useQuery({
    queryKey: ["admin", "analytics", days] as const,
    queryFn: async () => {
      const { data } = await api.get<AnalyticsResponse>("/analytics", {
        params: { days },
      });
      return data;
    },
  });
}
