import type { Product } from "@/types/product";

export interface CartItem {
  _id: string;
  quantity: number;
  product: Product;
}
