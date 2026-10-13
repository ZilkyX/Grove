import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCart,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from "@/hooks/use-cart";
import { useValidateCoupon } from "@/hooks/use-coupon";
import { useCreateCheckoutSession } from "@/hooks/use-checkout";
import { formatCurrency } from "@/lib/currency";
import type { ApiErrorResponse } from "@/lib/api";
import type { CartItem } from "@/types/cart";

function getErrorMessage(error: unknown) {
  return error instanceof AxiosError
    ? (error.response?.data as ApiErrorResponse | undefined)?.message
    : undefined;
}

function CartLineItem({ item }: { item: CartItem }) {
  const updateQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();

  const isUpdating =
    updateQuantity.isPending &&
    updateQuantity.variables?.productId === item.product._id;
  const isRemoving =
    removeFromCart.isPending && removeFromCart.variables === item.product._id;
  const isBusy = isUpdating || isRemoving;

  return (
    <li className="flex gap-4 py-6">
      <div className="h-24 w-24 shrink-0 overflow-hidden bg-muted">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{item.product.name}</span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(item.product.price)}
            </span>
          </div>
          <span className="whitespace-nowrap text-sm font-medium">
            {formatCurrency(item.product.price * item.quantity)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center border border-border">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Decrease quantity of ${item.product.name}`}
              disabled={isBusy || item.quantity <= 1}
              onClick={() =>
                updateQuantity.mutate({
                  productId: item.product._id,
                  quantity: item.quantity - 1,
                })
              }
            >
              <Minus />
            </Button>
            <span
              className="flex min-w-10 items-center justify-center text-sm tabular-nums"
              aria-live="polite"
            >
              {isUpdating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                item.quantity
              )}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Increase quantity of ${item.product.name}`}
              disabled={isBusy}
              onClick={() =>
                updateQuantity.mutate({
                  productId: item.product._id,
                  quantity: item.quantity + 1,
                })
              }
            >
              <Plus />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => removeFromCart.mutate(item.product._id)}
          >
            {isRemoving ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <Trash2 data-icon="inline-start" />
            )}
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
}

function CartSkeleton() {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: 2 }).map((_, index) => (
        <li key={index} className="flex gap-4 py-6">
          <Skeleton className="h-24 w-24 shrink-0" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartPage() {
  const cart = useCart();
  const validateCoupon = useValidateCoupon();
  const createCheckoutSession = useCreateCheckoutSession();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercentage: number;
  } | null>(null);

  const items = cart.data ?? [];

  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.product.price * 100) * item.quantity,
    0,
  );
  const discountCents = appliedCoupon
    ? Math.round((subtotalCents * appliedCoupon.discountPercentage) / 100)
    : 0;
  const subtotal = subtotalCents / 100;
  const discount = discountCents / 100;
  const total = (subtotalCents - discountCents) / 100;

  const handleApplyCoupon = (event: FormEvent) => {
    event.preventDefault();
    const code = couponCode.trim();
    if (!code) return;

    validateCoupon.mutate(code, {
      onSuccess: (coupon) => {
        setAppliedCoupon({
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
        });
      },
      onError: () => setAppliedCoupon(null),
    });
  };

  const handleCheckout = () => {
    createCheckoutSession.mutate(
      { items, couponCode: appliedCoupon?.code },
      {
        onSuccess: (data) => {
          window.location.href = data.url;
        },
      },
    );
  };

  if (cart.isLoading) {
    return (
      <div className="flex flex-col gap-8 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Your cart
        </h1>
        <CartSkeleton />
      </div>
    );
  }

  if (cart.isError) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Your cart
        </h1>
        <p role="alert" className="text-sm text-destructive">
          Couldn't load your cart. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => cart.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Your cart
        </h1>
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link to="/">
          <Button variant="outline" size="sm">
            Continue shopping
          </Button>
        </Link>
      </div>
    );
  }

  const checkoutError = getErrorMessage(createCheckoutSession.error);
  const couponError = validateCoupon.isError
    ? getErrorMessage(validateCoupon.error) ?? "Invalid or expired coupon."
    : undefined;

  return (
    <div className="flex flex-col gap-10 py-12 lg:flex-row lg:items-start lg:gap-16">
      <div className="flex-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Your cart
        </h1>
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <CartLineItem key={item._id} item={item} />
          ))}
        </ul>
      </div>

      <div className="flex w-full flex-col gap-6 border border-border p-6 lg:w-80">
        <h2 className="font-heading text-lg font-semibold tracking-wider uppercase">
          Summary
        </h2>

        <form onSubmit={handleApplyCoupon} className="flex flex-col gap-2">
          <Label htmlFor="coupon">Coupon code</Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              placeholder="GIFT1234"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={validateCoupon.isPending || !couponCode.trim()}
            >
              {validateCoupon.isPending ? "..." : "Apply"}
            </Button>
          </div>
          {appliedCoupon ? (
            <p className="text-sm text-muted-foreground">
              Applied{" "}
              <span className="font-medium text-foreground">
                {appliedCoupon.code}
              </span>{" "}
              ({appliedCoupon.discountPercentage}% off)
            </p>
          ) : null}
          {couponError ? (
            <p role="alert" className="text-sm text-destructive">
              {couponError}
            </p>
          ) : null}
        </form>

        <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {appliedCoupon ? (
            <div className="flex justify-between text-muted-foreground">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {checkoutError ? (
          <p role="alert" className="text-sm text-destructive">
            {checkoutError}
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleCheckout}
          disabled={createCheckoutSession.isPending}
        >
          {createCheckoutSession.isPending ? "Redirecting..." : "Checkout"}
        </Button>

        <Link
          to="/"
          className="text-center text-sm text-muted-foreground underline underline-offset-4"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
