"use client";
import dynamic from "next/dynamic";
import { createContext, useState, useCallback, useMemo } from "react";
import { wait } from "./helper";
import { MEDIA, MESSAGE_TIMEOUT } from "./config";
import { useMediaQuery } from "react-responsive";
import { is } from "zod/locales";

//mediaContext
export const MediaContext = createContext<MEDIA>("desktop");

//userContext
export const UserContext = createContext<{
  accessToken: string;
  isMessageVisible: boolean;
  firstLogin: (accessToken: string) => void;
  login: (accessToken: string) => void;
  logout: () => void;
} | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  //media
  const isMobile = useMediaQuery({ maxWidth: 479 });
  const isTablet = useMediaQuery({ minWidth: 480, maxWidth: 768 });
  const isDesktop = useMediaQuery({ minWidth: 769, maxWidth: 1439 });
  const isBig = useMediaQuery({ minWidth: 1440 });

  function getMedia() {
    if (isMobile) return "mobile";
    if (isTablet) return "tablet";
    if (isDesktop) return "desktop";
    if (isBig) return "big";
  }

  const media = getMedia();

  //user context
  const [accessToken, setAccessToken] = useState("");
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const firstLogin = useCallback(async (accessToken: string) => {
    setAccessToken(accessToken);
    await showMessage();
  }, []);

  async function showMessage() {
    setIsMessageVisible(true);
    await wait(MESSAGE_TIMEOUT);
    setIsMessageVisible(false);
  }

  const login = useCallback((accessToken: string) => {
    setAccessToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    setAccessToken("");
  }, []);

  const userContextValue = useMemo(
    () => ({ accessToken, isMessageVisible, firstLogin, login, logout }),
    [accessToken, isMessageVisible, firstLogin, login, logout]
  );

  return (
    media && (
      <UserContext value={userContextValue}>
        <MediaContext value={media}>{children}</MediaContext>
      </UserContext>
    )
  );
}
