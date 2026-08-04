import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { AppError } from "../utils/appError";

type JwtPayload = {
  userId: string;
  role: Role;
};

export const auth = (...allowedRoles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "Authorization token is missing");
  }

  const token = authHeader.slice(7);

  let decoded: JwtPayload;
  try {
    const rawDecoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    if (!rawDecoded.userId || !rawDecoded.role) {
      throw new AppError(401, "Invalid token payload");
    }
    decoded = {
      userId: String(rawDecoded.userId),
      role: rawDecoded.role as Role,
    };
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  req.user = decoded;

  if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
    throw new AppError(403, "You do not have permission to access this resource");
  }

  next();
};
