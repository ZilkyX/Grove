export interface ProductSummary {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface Product extends ProductSummary {
  category: string;
  isFeatured: boolean;
}

export interface PaginatedProducts {
  products: Product[];
  page: number;
  totalPages: number;
  totalProducts: number;
}

export interface BrowseProductsResponse extends PaginatedProducts {
  categories: string[];
}

export type ProductSort = "newest" | "price-asc" | "price-desc";

export interface BrowseProductsParams {
  page?: number;
  category?: string;
  search?: string;
  sort?: ProductSort;
}
