import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  email: z.email(),

  password: z.string().trim().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});
