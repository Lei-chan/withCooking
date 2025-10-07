"use client";
import { createContext } from "react";

export const AccessTokenContext = createContext<{
  accessToken: string;
  isMessageVisible: boolean;
  firstLogin: (accessToken: string) => void;
  login: (accessToken: string) => void;
  logout: () => void;
} | null>(null);
