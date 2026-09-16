import { CookieOptions, Response } from "express";

export const AUTH_COOKIE_NAME = "access_token";
const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24, // 1 day
};

/**
 * Stores the authentication token in an HTTP-only cookie.
 */
export function setAuthTokenCookie(
  response: Response,
  token: string,
): void {
  response.cookie(
    AUTH_COOKIE_NAME,
    token,
    authCookieOptions,
  );
}

/**
 * Removes the authentication token cookie.
 */
export function clearAuthTokenCookie(
  response: Response,
): void {
  response.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: authCookieOptions.httpOnly,
    secure: authCookieOptions.secure,
    sameSite: authCookieOptions.sameSite,
    path: authCookieOptions.path,
  });
}
