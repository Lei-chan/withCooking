"use client";
import dynamic from "next/dynamic";
import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { wait, getData, getOrderedRecipes } from "./helper";
import {
  MAX_DESKTOP,
  MAX_MOBILE,
  MAX_TABLET,
  TYPE_MEDIA,
  MESSAGE_TIMEOUT,
  MIN_BIG,
  MIN_DESKTOP,
  MIN_TABLET,
  TYPE_USER_CONTEXT,
} from "./config";
import { useMediaQuery } from "react-responsive";

//mediaContext
export const MediaContext = createContext<TYPE_MEDIA>("desktop");

//userContext
export const UserContext = createContext<TYPE_USER_CONTEXT>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  //media
  const isMobile = useMediaQuery({ maxWidth: MAX_MOBILE });
  const isTablet = useMediaQuery({
    minWidth: MIN_TABLET,
    maxWidth: MAX_TABLET,
  });
  const isDesktop = useMediaQuery({
    minWidth: MIN_DESKTOP,
    maxWidth: MAX_DESKTOP,
  });
  const isBig = useMediaQuery({ minWidth: MIN_BIG });

  function getMedia() {
    if (isMobile) return "mobile";
    if (isTablet) return "tablet";
    if (isDesktop) return "desktop";
    if (isBig) return "big";
  }

  const media = getMedia();

  //user context
  const [accessToken, setAccessToken] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [recipes, setRecipes] = useState<any[] | null>(null);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const firstLogin = useCallback(async (accessToken: string) => {
    setAccessToken(accessToken);
    setUserRecipes(accessToken);
    await showMessage();
  }, []);

  useEffect(() => {
    setUserRecipes(accessToken);
  }, [startIndex]);

  //get 6 recipes at a time
  async function setUserRecipes(accessToken: string) {
    try {
      const data = await getData(
        `/api/users/recipes?startIndex=${startIndex}&endIndex=${
          startIndex + 6
        }`,
        {
          method: "GET",
          headers: { authorization: `Bearer ${accessToken}` },
        }
      );
      console.log(data);

      setRecipes((prev) => {
        const newRecipes = prev ? [...prev, ...data.data] : data.data;
        return newRecipes.length ? getOrderedRecipes(newRecipes) : [];
      });
      //issue
      setStartIndex((prev) =>
        prev >= data.numberOfRecipes - 6 ? prev : prev + 6
      );
    } catch (err: any) {
      console.error("Error while getting recipes", err.message);
    }
  }
  console.log(recipes);

  async function showMessage() {
    setIsMessageVisible(true);
    await wait(MESSAGE_TIMEOUT);
    setIsMessageVisible(false);
  }

  const login = useCallback(async (accessToken: string) => {
    setAccessToken(accessToken);
    setUserRecipes(accessToken);
  }, []);

  const logout = useCallback(() => {
    setAccessToken("");
  }, []);

  const userContextValue = useMemo(
    () => ({
      accessToken,
      recipes,
      isMessageVisible,
      firstLogin,
      login,
      logout,
    }),
    [accessToken, recipes, isMessageVisible, firstLogin, login, logout]
  );

  return (
    media && (
      <UserContext value={userContextValue}>
        <MediaContext value={media}>{children}</MediaContext>
      </UserContext>
    )
  );
}
