// src/utils/auth/jwt.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { JwtConfig } from "../../config/server.config";

export function generateToken(payload: object) {
  return jwt.sign(
    payload,
    JwtConfig.secret as string
  );
}

export function verifyToken<T = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JwtConfig.secret as string) as T;
  } catch {
    return null;
  }
}

export function decodeToken<T = JwtPayload>(token: string): T | null {
  try {
    return jwt.decode(token) as T;
  } catch {
    return null;
  }
}
