export const validator = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed.",
      error: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};
