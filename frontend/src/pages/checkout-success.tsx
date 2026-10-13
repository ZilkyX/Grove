import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmCheckout } from "@/hooks/use-checkout";
import { useClearCart } from "@/hooks/use-cart";

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const confirmCheckout = useConfirmCheckout();
  const clearCart = useClearCart();
  const hasConfirmed = useRef(false);

  useEffect(() => {
    if (!sessionId || hasConfirmed.current) return;
    hasConfirmed.current = true;

    confirmCheckout.mutate(sessionId, {
      onSuccess: () => clearCart.mutate(),
    });
  }, [sessionId, confirmCheckout, clearCart]);

  if (!sessionId) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Checkout
        </h1>
        <p role="alert" className="text-sm text-destructive">
          Missing checkout session. If you completed a payment, check your
          email for confirmation.
        </p>
        <Link to="/">
          <Button variant="outline" size="sm">
            Back to home
          </Button>
        </Link>
      </div>
    );
  }

  if (confirmCheckout.isPending || confirmCheckout.isIdle) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 py-12 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Confirming your payment...
        </p>
      </div>
    );
  }

  if (confirmCheckout.isError) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <XCircle className="size-8 text-destructive" />
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p role="alert" className="text-sm text-destructive">
          We couldn't confirm your payment. If you were charged, please
          contact support.
        </p>
        <Link to="/cart">
          <Button variant="outline" size="sm">
            Back to cart
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <CheckCircle2 className="size-8 text-foreground" />
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Order confirmed
      </h1>
      <p className="text-muted-foreground">
        Thank you for shopping with Grove. A confirmation has been sent to
        your email.
      </p>
      <Link to="/">
        <Button size="sm">Continue shopping</Button>
      </Link>
    </div>
  );
}
