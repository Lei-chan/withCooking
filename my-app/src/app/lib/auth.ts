import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { access } from "fs";

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}

export async function authenticateToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];

    //for when user reloaded and accessToken info disappeared
    if (!accessToken) return await refreshAccessToken();

    // if (!accessToken) {
    //   const err: any = new Error("Access token required.");
    //   err.statusCode = 401;
    //   throw err;
    // }

    const decoded = verifyAccessToken(accessToken);

    return { id: decoded?.userId, newAccessToken: null };
  } catch (err) {
    throw err;
  }
}

export async function refreshAccessToken() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    const decodedRefresh = refreshToken && verifyRefreshToken(refreshToken);
    if (!decodedRefresh) {
      const err: any = new Error("Invalid token");
      err.statusCode = 401;
      throw err;
    }

    const id = decodedRefresh.userId;

    const newAccessToken = generateAccessToken(id);

    return { id, newAccessToken };
  } catch (err) {
    throw err;
  }
}

export async function hashPassword(password: string) {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (err) {
    throw err;
  }
}
