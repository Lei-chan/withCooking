"use client";
import { createContext } from "react";

export const AccessTokenContext = createContext<{
  accessToken: string;
  login: (accessToken: string) => void;
  logout: () => void;
} | null>(null);
