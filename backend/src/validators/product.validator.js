import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),

  description: z.string().trim().min(1, "Product description is required"),

  price: z.number().min(0, "Price cannot be negative"),

  image: z
    .string()
    .trim()
    .min(1, "Product image is required")
    .startsWith("data:image/", "Product image must be a base64 data URI"),

  category: z.string().trim().min(1, "Product category is required"),

  isFeatured: z.boolean().default(false),
});

export const productUpdateSchema = productSchema.partial();
