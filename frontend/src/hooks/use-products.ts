import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  BrowseProductsParams,
  BrowseProductsResponse,
  PaginatedProducts,
  Product,
  ProductSummary,
} from "@/types/product";

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"] as const,
    queryFn: async () => {
      const { data } = await api.post<Product[]>("/product/featured");
      return data;
    },
  });
}

export function useRecommendedProducts() {
  return useQuery({
    queryKey: ["products", "recommended"] as const,
    queryFn: async () => {
      const { data } = await api.get<ProductSummary[]>("/product/recommended");
      return data;
    },
  });
}

export function useBrowseProducts(params: BrowseProductsParams) {
  return useQuery({
    queryKey: ["products", "browse", params] as const,
    queryFn: async () => {
      const { data } = await api.get<BrowseProductsResponse>("/product/browse", {
        params,
      });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", "detail", id] as const,
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; product: Product }>(
        `/product/${id}`,
      );
      return data.product;
    },
    enabled: Boolean(id),
  });
}

export function useAdminProducts(params: { page?: number }) {
  return useQuery({
    queryKey: ["admin", "products", params] as const,
    queryFn: async () => {
      const { data } = await api.get<PaginatedProducts>("/product", { params });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isFeatured: boolean;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const { data } = await api.post<{ success: boolean; product: Product }>(
        "/product",
        input,
      );
      return data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateProductInput) => {
      const { data } = await api.put<{ success: boolean; product: Product }>(
        `/product/${id}`,
        input,
      );
      return data.product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.setQueryData(["products", "detail", product._id], product);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/product/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useToggleFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<{ success: boolean; product: Product }>(
        `/product/${id}`,
      );
      return data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
