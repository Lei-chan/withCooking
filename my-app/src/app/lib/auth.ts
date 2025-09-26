import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

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

export async function authenticateToken() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    console.log(accessToken);

    if (!accessToken) {
      const err: any = new Error("Access token required.");
      err.statusCode = 401;
      throw err;
    }

    const decoded = verifyAccessToken(accessToken);

    return decoded?.userId;
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
