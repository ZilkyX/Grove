import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSignUp } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiErrorResponse } from "@/lib/api";

export function SignUpPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const signUp = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    signUp.mutate(
      { name, email, password },
      { onSuccess: () => navigate("/") },
    );
  };

  const errorMessage =
    signUp.error instanceof AxiosError
      ? (signUp.error.response?.data as ApiErrorResponse | undefined)?.message
      : undefined;

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create your Grove account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                minLength={2}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}

            <Button type="submit" disabled={signUp.isPending} className="mt-2">
              {signUp.isPending ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
