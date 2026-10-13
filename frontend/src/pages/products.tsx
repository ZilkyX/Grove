import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/pagination";
import { useBrowseProducts } from "@/hooks/use-products";
import type { ProductSort } from "@/types/product";

const SORT_LABELS: Record<ProductSort, string> = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const sort = (searchParams.get("sort") as ProductSort | null) ?? "newest";
  const page = Number(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search ?? "");

  const products = useBrowseProducts({ page, category, search, sort });

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in updates)) next.delete("page");
    setSearchParams(next);
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateParams({ search: searchInput.trim() || undefined });
  };

  return (
    <div className="flex flex-col gap-8 py-12">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {category ?? "All products"}
        </h1>
        {!products.isLoading && products.data ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {products.data.totalProducts} product
            {products.data.totalProducts === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex max-w-sm flex-1 gap-2">
          <Input
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button type="submit" variant="outline" size="sm">
            <Search data-icon="inline-start" />
            Search
          </Button>
        </form>

        <Select
          value={sort}
          onValueChange={(value) => updateParams({ sort: value ?? undefined })}
        >
          <SelectTrigger aria-label="Sort products">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {products.data && products.data.categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParams({ category: undefined })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
              !category
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground/70 hover:border-foreground/40",
            )}
          >
            All
          </button>
          {products.data.categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateParams({ category: c })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                category === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground/70 hover:border-foreground/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {products.isLoading ? (
        <ProductGridSkeleton />
      ) : products.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-destructive">
            Couldn't load products. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={() => products.refetch()}>
            Retry
          </Button>
        </div>
      ) : products.data && products.data.products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.data.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No products found{search ? ` for "${search}"` : ""}.
        </p>
      )}

      {products.data ? (
        <Pagination
          page={products.data.page}
          totalPages={products.data.totalPages}
          onPageChange={(nextPage) =>
            updateParams({ page: String(nextPage) })
          }
        />
      ) : null}
    </div>
  );
}
