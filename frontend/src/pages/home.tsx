import { Link } from "react-router-dom";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFeaturedProducts,
  useRecommendedProducts,
} from "@/hooks/use-products";

function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const featured = useFeaturedProducts();
  const recommended = useRecommendedProducts();

  return (
    <div className="flex flex-col gap-16 py-12">
      <div className="flex flex-col items-start gap-3">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Grove
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome to Grove
        </h1>
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          A modern shopping experience, built with care.
        </p>
        <Link to="/products">
          <Button variant="outline" size="sm" className="mt-2">
            Shop all products
          </Button>
        </Link>
      </div>

      <section className="flex flex-col gap-6" aria-labelledby="featured-heading">
        <h2
          id="featured-heading"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          Featured
        </h2>

        {featured.isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : featured.isError ? (
          <p role="alert" className="text-sm text-destructive">
            Couldn't load featured products. Please try again later.
          </p>
        ) : featured.data && featured.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {featured.data.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No featured products yet — check back soon.
          </p>
        )}
      </section>

      <section
        className="flex flex-col gap-6"
        aria-labelledby="recommended-heading"
      >
        <h2
          id="recommended-heading"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          You might also like
        </h2>

        {recommended.isLoading ? (
          <ProductGridSkeleton count={3} />
        ) : recommended.isError ? (
          <p role="alert" className="text-sm text-destructive">
            Couldn't load recommendations.
          </p>
        ) : recommended.data && recommended.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {recommended.data.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
