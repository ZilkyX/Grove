import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/currency";
import type { ProductSummary } from "@/types/product";

export function ProductCard({ product }: { product: ProductSummary }) {
  const user = useAuthStore((state) => state.user);
  const addToCart = useAddToCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    addToCart.mutate(product._id, {
      onSuccess: () => {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      },
    });
  };

  return (
    <div className="group flex flex-col gap-3">
      <Link
        to={`/product/${product._id}`}
        className="flex flex-col gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <h3 className="truncate text-sm font-medium text-foreground">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-base font-semibold">
          {formatCurrency(product.price)}
        </span>

        {user ? (
          <div className="flex flex-col items-end gap-1">
            <Button
              type="button"
              size="sm"
              variant={justAdded ? "secondary" : "default"}
              onClick={handleAdd}
              disabled={addToCart.isPending}
            >
              {justAdded ? (
                <>
                  <Check data-icon="inline-start" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart data-icon="inline-start" />
                  {addToCart.isPending ? "Adding..." : "Add"}
                </>
              )}
            </Button>
            {addToCart.isError ? (
              <p role="alert" className="text-xs text-destructive">
                Couldn't add item.
              </p>
            ) : null}
          </div>
        ) : (
          <Link to="/login">
            <Button type="button" size="sm" variant="outline">
              Log in to buy
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
