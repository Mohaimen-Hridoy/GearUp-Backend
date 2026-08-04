import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validateRequest = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const parsed = schema.parse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Write the parsed result back onto the request so that zod defaults
  // (e.g. stock/isAvailable) and coercions (e.g. z.coerce.number()) are
  // actually visible to the controller — schema.parse() on its own only
  // validates and returns a new object, it never mutates req.
  if (parsed && typeof parsed === "object") {
    if ("body" in parsed) req.body = (parsed as Record<string, unknown>).body;
    if ("query" in parsed) Object.assign(req.query, (parsed as Record<string, unknown>).query);
    if ("params" in parsed) Object.assign(req.params, (parsed as Record<string, unknown>).params);
  }

  next();
};
