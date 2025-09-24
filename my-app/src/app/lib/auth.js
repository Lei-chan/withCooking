import jwt from "jsonwebtoken";
import User from "../models/User";

export function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}

export async function authenticateToken(req) {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader?.split(" ")[1];

    if (!token) {
      const err = new Error("Access token required.");
      err.statusCode = 401;
      throw err;
    }

    const decoded = verifyAccessToken(token);

    return decoded?.userId;
  } catch (err) {
    throw err;
  }
}
