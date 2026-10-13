import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CartItem } from "@/types/cart";

interface CheckoutSessionResponse {
  id: string;
  url: string;
  totalAmount: number;
}

interface CreateCheckoutSessionInput {
  items: CartItem[];
  couponCode?: string;
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async ({ items, couponCode }: CreateCheckoutSessionInput) => {
      const { data } = await api.post<CheckoutSessionResponse>(
        "/payment/create-checkout-session",
        {
          products: items.map((item) => ({
            _id: item.product._id,
            quantity: item.quantity,
          })),
          couponCode,
        },
      );
      return data;
    },
  });
}

interface ConfirmCheckoutResponse {
  success: boolean;
  message: string;
  orderId: string;
}

export function useConfirmCheckout() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post<ConfirmCheckoutResponse>(
        "/payment/checkout-success",
        { sessionId },
      );
      return data;
    },
  });
}
