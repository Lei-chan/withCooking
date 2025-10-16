"use client";
import dynamic from "next/dynamic";
import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { wait, getData, getOrderedRecipes, getUserRecipes } from "./helper";
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
  // const RECIPES_PER_REQ = 24;
  const [accessToken, setAccessToken] = useState("");
  // const [startIndex, setStartIndex] = useState(0);
  // const [recipes, setRecipes] = useState<any[] | null>(null);
  const [numberOfRecipes, setNumberOfRecipes] = useState(0);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const firstLogin = useCallback(
    async (accessToken: string, numberOfRecipes: number) => {
      setAccessToken(accessToken);
      setNumberOfRecipes(numberOfRecipes);

      //for persisting data
      localStorage.setItem("numberOfRecipes", numberOfRecipes + "");
      // setUserRecipes(accessToken);
      await showMessage();
    },
    []
  );

  //get 24 recipes at a time
  // async function setUserRecipes(accessToken: string) {
  //   try {
  //     const data = await getUserRecipes(
  //       accessToken,
  //       startIndex,
  //       RECIPES_PER_REQ
  //     );

  //     setNumberOfRecipes(data.numberOfRecipes);
  //     setRecipes((prev) => {
  //       const newRecipes = prev ? [...prev, ...data.data] : data.data;
  //       return newRecipes.length ? getOrderedRecipes(newRecipes) : [];
  //     });
  //     setStartIndex((prev) => prev + RECIPES_PER_REQ);
  //   } catch (err: any) {
  //     console.error("Error while getting recipes", err.message);
  //   }
  // }

  //provokes the next fetch to get more user recipes
  // useEffect(() => {
  //   if (startIndex >= numberOfRecipes) return;
  //   // localStorage.setItem("startIndex", startIndex + "");
  //   setUserRecipes(accessToken);
  // }, [startIndex]);

  // //set recipes in localStorage for when user reloads page
  // useEffect(() => {
  //   localStorage.setItem("recipes", JSON.stringify(recipes));
  // }, [recipes]);

  // //set numberOfRecipes in localStorage for when user reloads page
  // useEffect(() => {
  //   localStorage.setItem("numberOfRecipes", numberOfRecipes + "");
  // }, [numberOfRecipes]);

  // //set numberOfRecipes stored in localStorage to state when user reloads page
  useEffect(() => {
    const storedNumberOfRecipes = localStorage.getItem("numberOfRecipes");

    setNumberOfRecipes(parseInt(storedNumberOfRecipes || "0"));
  }, []);

  async function showMessage() {
    setIsMessageVisible(true);
    await wait(MESSAGE_TIMEOUT);
    setIsMessageVisible(false);
  }

  const login = useCallback(async (accessToken: string) => {
    setAccessToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    setAccessToken("");
    localStorage.removeItem("numberOfRecipes");
  }, []);

  const userContextValue = useMemo(
    () => ({
      accessToken,
      // recipes,
      numberOfRecipes,
      isMessageVisible,
      firstLogin,
      login,
      logout,
    }),
    [accessToken, numberOfRecipes, isMessageVisible, firstLogin, login, logout]
  );

  return (
    media && (
      <UserContext value={userContextValue}>
        <MediaContext value={media}>{children}</MediaContext>
      </UserContext>
    )
  );
}
