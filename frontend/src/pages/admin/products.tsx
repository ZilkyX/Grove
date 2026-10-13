import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Star, Trash2 } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/pagination";
import {
  useAdminProducts,
  useDeleteProduct,
  useToggleFeatured,
} from "@/hooks/use-products";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types/product";

function DeleteProductDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const deleteProduct = useDeleteProduct();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${product.name}`} />
        }
      >
        <Trash2 />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{product.name}"? This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {deleteProduct.isError ? (
          <p role="alert" className="text-sm text-destructive">
            Couldn't delete this product. Please try again.
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteProduct.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteProduct.isPending}
            onClick={() =>
              deleteProduct.mutate(product._id, {
                onSuccess: () => setOpen(false),
              })
            }
          >
            {deleteProduct.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const products = useAdminProducts({ page });
  const toggleFeatured = useToggleFeatured();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Products
        </h1>
        <Link to="/admin/products/new">
          <Button size="sm">New product</Button>
        </Link>
      </div>

      {products.isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : products.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-destructive">
            Couldn't load products. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={() => products.refetch()}>
            Retry
          </Button>
        </div>
      ) : !products.data || products.data.products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No products yet. Create your first one.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Product
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Price
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Featured
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.data.products.map((product) => (
                  <tr key={product._id}>
                    <td className="max-w-64 py-2 pr-4">
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
                    <td className="py-2 pr-4 text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-2 pr-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-pressed={product.isFeatured}
                        aria-label={
                          product.isFeatured
                            ? `Unfeature ${product.name}`
                            : `Feature ${product.name}`
                        }
                        disabled={
                          toggleFeatured.isPending &&
                          toggleFeatured.variables === product._id
                        }
                        onClick={() => toggleFeatured.mutate(product._id)}
                      >
                        <Star
                          className={cn(
                            product.isFeatured &&
                              "fill-foreground text-foreground",
                          )}
                        />
                      </Button>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Link to={`/admin/products/${product._id}/edit`}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil />
                          </Button>
                        </Link>
                        <DeleteProductDialog product={product} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={products.data.page}
            totalPages={products.data.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
