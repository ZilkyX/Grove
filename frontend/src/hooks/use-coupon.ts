import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  expirationDate: string;
  isActive: boolean;
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.get<{ message: string; coupon: Coupon }>(
        "/coupon/validate",
        { data: { code } },
      );
      return data.coupon;
    },
  });
}
