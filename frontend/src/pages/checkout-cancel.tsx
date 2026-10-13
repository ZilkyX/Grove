import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CheckoutCancelPage() {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Checkout canceled
      </h1>
      <p className="text-muted-foreground">
        No payment was made. Your cart is still saved.
      </p>
      <Link to="/cart">
        <Button size="sm">Back to cart</Button>
      </Link>
    </div>
  );
}
