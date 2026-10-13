import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/currency";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = useProduct(id);
  const user = useAuthStore((state) => state.user);
  const addToCart = useAddToCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    if (!product.data) return;
    addToCart.mutate(product.data._id, {
      onSuccess: () => {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      },
    });
  };

  if (product.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (product.isError || !product.data) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Product not found
        </h1>
        <p className="text-muted-foreground">
          This product may have been removed or the link is incorrect.
        </p>
        <Link to="/products">
          <Button variant="outline" size="sm">
            Browse products
          </Button>
        </Link>
      </div>
    );
  }

  const data = product.data;

  return (
    <div className="flex flex-col gap-10 py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          to={`/products?category=${encodeURIComponent(data.category)}`}
          className="hover:text-foreground"
        >
          {data.category}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={data.image}
            alt={data.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {data.category}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {data.name}
            </h1>
          </div>

          <span className="font-heading text-2xl font-semibold">
            {formatCurrency(data.price)}
          </span>

          <p className="leading-relaxed text-muted-foreground">
            {data.description}
          </p>

          {user ? (
            <div className="flex flex-col items-start gap-2">
              <Button
                type="button"
                variant={justAdded ? "secondary" : "default"}
                onClick={handleAdd}
                disabled={addToCart.isPending}
                className="w-fit"
              >
                {justAdded ? (
                  <>
                    <Check data-icon="inline-start" />
                    Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart data-icon="inline-start" />
                    {addToCart.isPending ? "Adding..." : "Add to cart"}
                  </>
                )}
              </Button>
              {addToCart.isError ? (
                <p role="alert" className="text-sm text-destructive">
                  Couldn't add item to cart. Please try again.
                </p>
              ) : null}
            </div>
          ) : (
            <Link to="/login">
              <Button type="button" variant="outline" className="w-fit">
                Log in to buy
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
