"use client";
import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  MAX_DESKTOP,
  MAX_MOBILE,
  MAX_TABLET,
  MIN_BIG,
  MIN_DESKTOP,
  MIN_TABLET,
} from "./config/media";
import { TYPE_MEDIA, TYPE_USER_CONTEXT } from "./config/type";
import { MESSAGE_TIMEOUT } from "./config/settings";
import { wait } from "./helpers/other";

//mediaContext
export const MediaContext = createContext<TYPE_MEDIA>("desktop");

//userContext
export const UserContext = createContext<TYPE_USER_CONTEXT>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  //media
  const [media, setMedia] = useState<TYPE_MEDIA>("desktop");
  //user context
  const [accessToken, setAccessToken] = useState("");
  const [numberOfRecipes, setNumberOfRecipes] = useState(0);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  //media
  useEffect(() => {
    const updateMedia = () => {
      if (window.matchMedia(`( width >= ${MIN_BIG}px )`).matches)
        return setMedia("big");

      if (
        window.matchMedia(`(
            ${MAX_DESKTOP}px >= width >= ${MIN_DESKTOP}px
          )`).matches
      )
        return setMedia("desktop");

      if (
        window.matchMedia(`(
            ${MAX_TABLET}px >= width >= ${MIN_TABLET}px
          )`).matches
      )
        return setMedia("tablet");

      if (window.matchMedia(`( ${MAX_MOBILE}px >= width )`).matches)
        return setMedia("mobile");
    };

    updateMedia();
    window.addEventListener("resize", updateMedia);

    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  //user context
  const firstLogin = useCallback(
    async (accessToken: string, numberOfRecipes: number) => {
      setAccessToken(accessToken);
      setNumberOfRecipes(numberOfRecipes);

      //for persisting data
      localStorage.setItem("numberOfRecipes", numberOfRecipes + "");
      await showMessage();
    },
    [],
  );

  //set numberOfRecipes stored in localStorage to state when user reloads page
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
    localStorage.removeItem("language");
    localStorage.removeItem("numberOfRecipes");
    setNumberOfRecipes(0);
    setAccessToken("");
  }, []);

  const addNumberOfRecipes = useCallback(() => {
    setNumberOfRecipes((prev) => {
      localStorage.setItem("numberOfRecipes", prev + 1 + "");
      return prev + 1;
    });
  }, []);

  const reduceNumberOfRecipes = useCallback(
    (deletedNumberOfRecipes: number) => {
      setNumberOfRecipes((prev) => {
        localStorage.setItem(
          "numberOfRecipes",
          prev - deletedNumberOfRecipes + "",
        );
        return prev - deletedNumberOfRecipes;
      });
    },
    [],
  );

  const userContextValue = useMemo(
    () => ({
      accessToken,
      numberOfRecipes,
      isMessageVisible,
      firstLogin,
      login,
      logout,
      addNumberOfRecipes,
      reduceNumberOfRecipes,
    }),
    [
      accessToken,
      numberOfRecipes,
      isMessageVisible,
      firstLogin,
      login,
      logout,
      addNumberOfRecipes,
      reduceNumberOfRecipes,
    ],
  );

  return (
    <MediaContext value={media}>
      <UserContext value={userContextValue}>{children} </UserContext>
    </MediaContext>
  );
}
