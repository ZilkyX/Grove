import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateProduct } from "@/hooks/use-products";
import type { ApiErrorResponse } from "@/lib/api";

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

interface ValidationErrorResponse extends ApiErrorResponse {
  error?: Record<string, string[]>;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AdminCreateProductPage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError(null);

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be smaller than 1.5MB.");
      event.target.value = "";
      return;
    }

    setIsPreparingImage(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImagePreview(dataUrl);
    } catch {
      setImageError("Couldn't read that image. Please try another file.");
    } finally {
      setIsPreparingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSuccess(false);

    if (!imagePreview) {
      setImageError("Product image is required.");
      return;
    }

    createProduct.mutate(
      {
        name,
        description,
        price: Number(price),
        image: imagePreview,
        category,
        isFeatured,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setName("");
          setDescription("");
          setPrice("");
          setCategory("");
          setIsFeatured(false);
          handleRemoveImage();
          setTimeout(() => navigate("/"), 1500);
        },
      },
    );
  };

  const serverError =
    createProduct.error instanceof AxiosError
      ? (createProduct.error.response?.data as ValidationErrorResponse | undefined)
      : undefined;
  const fieldErrors = serverError?.error ?? {};
  const topLevelError =
    !Object.keys(fieldErrors).length && serverError?.message
      ? serverError.message
      : undefined;

  const isSubmitting = createProduct.isPending || isPreparingImage;

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Create product
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new product to the Grove catalog.
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">
            Name <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="name"
            required
            value={name}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            onChange={(event) => setName(event.target.value)}
          />
          {fieldErrors.name ? (
            <p id="name-error" role="alert" className="text-sm text-destructive">
              {fieldErrors.name[0]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">
            Description <span aria-hidden="true">*</span>
          </Label>
          <Textarea
            id="description"
            required
            rows={4}
            value={description}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={
              fieldErrors.description ? "description-error" : undefined
            }
            onChange={(event) => setDescription(event.target.value)}
          />
          {fieldErrors.description ? (
            <p
              id="description-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {fieldErrors.description[0]}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">
              Price (USD) <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              required
              value={price}
              aria-invalid={Boolean(fieldErrors.price)}
              aria-describedby={fieldErrors.price ? "price-error" : undefined}
              onChange={(event) => setPrice(event.target.value)}
            />
            {fieldErrors.price ? (
              <p id="price-error" role="alert" className="text-sm text-destructive">
                {fieldErrors.price[0]}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">
              Category <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="category"
              required
              value={category}
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={fieldErrors.category ? "category-error" : undefined}
              onChange={(event) => setCategory(event.target.value)}
            />
            {fieldErrors.category ? (
              <p
                id="category-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {fieldErrors.category[0]}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="image">
            Image <span aria-hidden="true">*</span>
          </Label>

          {imagePreview ? (
            <div className="relative w-32">
              <img
                src={imagePreview}
                alt="Product preview"
                className="aspect-square w-32 bg-muted object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="Remove image"
                className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="image"
              className="flex w-32 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-input py-6 text-center text-xs text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
            >
              {isPreparingImage ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ImagePlus className="size-5" aria-hidden="true" />
              )}
              Upload
            </label>
          )}

          <input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
          />

          <p className="text-xs text-muted-foreground">JPG or PNG, up to 1.5MB.</p>

          {imageError || fieldErrors.image ? (
            <p role="alert" className="text-sm text-destructive">
              {imageError ?? fieldErrors.image?.[0]}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="isFeatured"
            checked={isFeatured}
            onCheckedChange={(checked) => setIsFeatured(checked)}
          />
          <Label htmlFor="isFeatured" className="normal-case">
            Feature this product on the homepage
          </Label>
        </div>

        {topLevelError ? (
          <p role="alert" className="text-sm text-destructive">
            {topLevelError}
          </p>
        ) : null}

        {success ? (
          <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
            Product created. Redirecting home...
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-fit">
          {isSubmitting ? "Creating..." : "Create product"}
        </Button>
      </form>
    </div>
  );
}
