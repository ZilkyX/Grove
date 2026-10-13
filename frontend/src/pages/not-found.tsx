import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        404
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/">
        <Button size="sm">Back to home</Button>
      </Link>
    </div>
  );
}
