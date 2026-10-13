import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PaginatedOrders } from "@/types/order";

export function useMyOrders(params: { page?: number }) {
  return useQuery({
    queryKey: ["orders", "my", params] as const,
    queryFn: async () => {
      const { data } = await api.get<PaginatedOrders>("/orders/my", { params });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}
