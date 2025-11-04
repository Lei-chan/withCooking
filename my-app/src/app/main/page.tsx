"use client";
//react
import React, { useEffect, useRef, useState, useContext } from "react";
//next.js
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
//type
import { TYPE_USER_CONTEXT, TYPE_MEDIA, TYPE_RECIPE } from "../lib/config/type";
//general methods
import { getSize } from "@/app/lib/helpers/other";
//methods for recipes
import {
  createMessage,
  calcNumberOfPages,
  getUserRecipes,
} from "@/app/lib/helpers/recipes";
//context
import { MediaContext, UserContext } from "../lib/providers";
//media
import news from "@/app/lib/models/news";

//components
import {
  OverlayMessage,
  PaginationButtons,
  RecipeNoEdit,
} from "../lib/components/components";
//library
import { nanoid } from "nanoid";
import { error } from "console";

export default function MAIN() {
  const mediaContext = useContext(MediaContext);
  const userContext = useContext(UserContext);

  const searchRef = useRef(null);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [isDraggingX, setIsDraggingX] = useState(false);
  const [isDraggingY, setIsDraggingY] = useState(false);
  const [recipeWidth, setRecipeWidth] = useState(
    mediaContext === "mobile"
      ? window.innerWidth + "px"
      : mediaContext === "tablet"
      ? window.innerWidth * 0.65 + "px"
      : window.innerWidth * 0.55 + "px"
  );
  const [timerHeight, setTimerHeight] = useState(
    window.innerHeight * 0.65 + "px"
  );
  const timerNoteWidth =
    mediaContext === "mobile"
      ? window.innerWidth + "px"
      : window.innerWidth - parseFloat(recipeWidth) + "px";

  function handleMouseDownX() {
    setIsDraggingX(true);
  }

  function handleMouseDownY() {
    if (mediaContext === "mobile") return;
    setIsDraggingY(true);
  }

  function handleMouseUp() {
    setIsDraggingX(false);
    mediaContext !== "mobile" && setIsDraggingY(false);
  }

  function handleMouseMoveRecipe(e: React.MouseEvent<HTMLDivElement>) {
    if (isDraggingX) {
      const positioX = e.clientX;
      setRecipeWidth(`${positioX}px`);
    }

    if (isDraggingY) {
      const positionY = e.clientY;
      setTimerHeight(`${positionY}px`);
    }
  }

  const handleToggleDropdown = function () {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleToggleSearch = function () {
    setIsSearchVisible(!isSearchVisible);
  };

  const handleCloseDropdownSearch = function (
    e: React.MouseEvent<HTMLDivElement>
  ) {
    const target = e.target as HTMLElement;

    if (
      target.closest("ul") ||
      target.closest("div") === searchRef.current ||
      target.closest('button[value="increase"]') ||
      target.closest('button[value="decrease"]') ||
      (!isDropdownVisible && !isSearchVisible)
    )
      return;

    setIsDropdownVisible(false);
    setIsSearchVisible(false);
  };

  function handleToggleLogout() {
    setIsMessageVisible(!isMessageVisible);
  }

  console.log(mediaContext);

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      onClick={handleCloseDropdownSearch}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMoveRecipe}
    >
      {userContext?.isMessageVisible && (
        <OverlayMessage option="message" content="welcome" />
      )}
      {isMessageVisible && (
        <OverlayMessage
          option="question"
          content="logout"
          toggleLogout={handleToggleLogout}
        />
      )}
      <div
        style={
          mediaContext === "mobile"
            ? { width: "100%", height: "100%" }
            : {
                display: "flex",
                flexDirection: "row",
                width: "100%",
                height: "100%",
              }
        }
      >
        <Search
          searchRef={searchRef}
          mediaContext={mediaContext}
          userContext={userContext}
          isSearchVisible={isSearchVisible}
          onClickSearch={handleToggleSearch}
        />
        {mediaContext !== "mobile" && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: `calc(${recipeWidth} - 1.5%)`,
              width: "2%",
              height: "100%",
              cursor: "ew-resize",
              zIndex: "5",
            }}
            onMouseDown={handleMouseDownX}
          ></div>
        )}
        <DropdownMenu
          mediaContext={mediaContext}
          isDropdownVisible={isDropdownVisible}
          onClickDropdown={handleToggleDropdown}
          onClickLogout={handleToggleLogout}
        />

        <section
          style={{
            position: "relative",
            textAlign: "center",
            backgroundImage:
              "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
            width: recipeWidth,
            height: "100%",
            overflowY: "scroll",
            scrollbarColor: "rgb(255, 255, 232) rgb(253, 231, 157)",
          }}
        >
          <RecipeNoEdit
            mediaContext={mediaContext}
            userContext={userContext}
            recipeWidth={recipeWidth}
            error=""
            mainOrRecipe="main"
            userRecipe={null}
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateRows: `${timerHeight} calc(100% - ${timerHeight})`,
            width:
              mediaContext === "mobile"
                ? "100%"
                : `calc(100% - ${recipeWidth})`,
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `calc(${timerHeight} - 2%)`,
              right: "0",
              width: `calc(100% - ${recipeWidth})`,
              height: "2%",
              cursor: "ns-resize",
              zIndex: "5",
            }}
            onMouseDown={handleMouseDownY}
          ></div>
          <Timers mediaContext={mediaContext} timerWidth={timerNoteWidth} />
          <Note mediaContext={mediaContext} noteWidth={timerNoteWidth} />
        </section>
      </div>
    </div>
  );
}

function Search({
  mediaContext,
  userContext,
  isSearchVisible,
  searchRef,
  onClickSearch,
}: {
  mediaContext: TYPE_MEDIA;
  userContext: TYPE_USER_CONTEXT;
  isSearchVisible: boolean;
  searchRef: any;
  onClickSearch: () => void;
}) {
  const RECIPES_PER_PAGE = 6;
  const searchMenuSize =
    window.innerWidth *
      (mediaContext === "mobile"
        ? 0.7
        : mediaContext === "tablet"
        ? 0.5
        : mediaContext === "desktop" && window.innerWidth <= 1100
        ? 0.35
        : 0.28) +
    "px";
  const fontSize =
    parseFloat(searchMenuSize) *
      (mediaContext === "mobile"
        ? 0.07
        : mediaContext === "tablet"
        ? 0.06
        : 0.055) +
    "px";
  const mainImageSize = parseFloat(searchMenuSize) * 0.2 + "px";

  const [recipes, setRecipes] = useState<TYPE_RECIPE[] | []>([]);
  const [numberOfRecipes, setNumberOfRecipes] = useState(
    userContext?.numberOfRecipes || null
  );
  const [numberOfPages, setNumberOfPages] = useState<number>(0);
  const [curPage, setCurPage] = useState<number>(1);

  const [keyword, setKeyword] = useState("");

  const [isPending, setIsPending] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // //set numberOfRecipes for the first render
  useEffect(() => {
    if (userContext?.numberOfRecipes === null || !userContext) return;
    setNumberOfRecipes(userContext.numberOfRecipes);
    setNumberOfPages(
      calcNumberOfPages(userContext.numberOfRecipes, RECIPES_PER_PAGE)
    );
    (async () => {
      setIsPending(true);
      await setUserRecipes();
      setIsPending(false);
    })();
  }, [userContext?.numberOfRecipes]);

  //6 recipes per fetch
  async function setUserRecipes(key: string = "") {
    try {
      //If user doesn't have any recipes => return
      if (!userContext?.numberOfRecipes) return;

      const RECIPES_PER_FETCH = 6;

      const data = await getUserRecipes(
        userContext?.accessToken,
        (curPage - 1) * RECIPES_PER_FETCH,
        RECIPES_PER_FETCH,
        key
      );

      setRecipes(data.data);
      setNumberOfRecipes(data.numberOfRecipes);
      setNumberOfPages(
        calcNumberOfPages(data.numberOfRecipes, RECIPES_PER_PAGE)
      );

      data.newAccessToken && userContext?.login(data.newAccessToken);
    } catch (err: any) {
      console.error("Error while getting recipes", err.message);
      setError("Server error while getting recipes 🙇‍♂️ Please retry again!");
    }
  }

  //when curPage changes, change curRecipes too
  useEffect(() => {
    (async () => {
      setIsPending(true);
      await setUserRecipes(keyword);
      setIsPending(false);
    })();
  }, [curPage, keyword]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const keywordData = new FormData(e.currentTarget).get("keyword");
    if (!keywordData && keywordData !== "") return;

    const structuredKeyword = String(keywordData).trim().toLowerCase();

    setKeyword(structuredKeyword);
    setCurPage(1);
  }

  //I'm gonna make it work for arrow keydown event later too!
  function handlePagination(e: React.MouseEvent<HTMLButtonElement>) {
    const target = e.currentTarget;

    target.value === "decrease"
      ? setCurPage((prev) => prev - 1)
      : setCurPage((prev) => prev + 1);
  }

  function handleClickPreview(recipe: any) {
    window.location.hash = recipe._id;
  }

  useEffect(() => {
    const message = createMessage(
      error,
      isPending,
      numberOfRecipes,
      recipes.length
    ) as string;
    setMessage(message);
  }, [error, isPending, numberOfRecipes, recipes.length]);

  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: searchMenuSize,
        height: "100%",
        zIndex: "10",
        transition: "all 0.3s",
        transform: !isSearchVisible ? "translateX(-100%)" : "translateX(0%)",
        fontSize: fontSize,
      }}
    >
      <button
        className={styles.btn__search_menu}
        type="button"
        onClick={onClickSearch}
      ></button>
      <div className={styles.search_menu} ref={searchRef}>
        <form className={styles.container__search} onSubmit={handleSubmit}>
          <input
            id={styles.input__search}
            style={{ fontSize: `calc(${fontSize} * 0.9)` }}
            name="keyword"
            type="search"
            placeholder="Search your recipe"
          ></input>
          <button
            className={styles.btn__search}
            style={{ fontSize: `calc(${fontSize} * 0.7)` }}
            type="submit"
          >
            Search
          </button>
        </form>
        <ul className={styles.search_results}>
          {message || isPending ? (
            <p className={styles.no_results} style={{ fontSize: fontSize }}>
              {message || "Loading..."}
            </p>
          ) : (
            recipes.map((recipe, i) => (
              <li
                key={i}
                className={styles.recipe_preview}
                onClick={() => handleClickPreview(recipe)}
              >
                {recipe.mainImagePreview?.data ? (
                  <Image
                    style={{ borderRadius: "50%" }}
                    src={recipe.mainImagePreview.data}
                    alt="main image"
                    width={parseFloat(mainImageSize)}
                    height={parseFloat(mainImageSize)}
                  ></Image>
                ) : (
                  <div
                    style={{
                      backgroundColor: "grey",
                      width: mainImageSize,
                      height: mainImageSize,
                      borderRadius: "50%",
                    }}
                  ></div>
                )}
                <p className={styles.title}>{recipe.title}</p>
                {recipe.favorite && (
                  <Image
                    src="/icons/star-on.png"
                    alt="favorite icon"
                    width={parseFloat(mainImageSize) * 0.3}
                    height={parseFloat(mainImageSize) * 0.3}
                  ></Image>
                )}
              </li>
            ))
          )}
        </ul>
        {/* {!isPending && curPage > 1 && (
          <button
            className={clsx(
              styles.btn__pagination,
              styles.btn__pagination_left
            )}
            type="button"
            value="decrease"
            onClick={handlePagination}
          >
            Page {curPage - 1}
            <br />
            &larr;
          </button>
        )}
        {!isPending && curPage < numberOfPages && (
          <button
            className={clsx(
              styles.btn__pagination,
              styles.btn__pagination_right
            )}
            type="button"
            value="increase"
            onClick={handlePagination}
          >
            Page {curPage + 1}
            <br />
            &rarr;{" "}
          </button>
        )} */}
        <PaginationButtons
          mediaContext={mediaContext}
          fontSize={fontSize}
          styles={styles}
          curPage={curPage}
          numberOfPages={numberOfPages}
          isPending={isPending}
          onClickPagination={handlePagination}
        />
      </div>
    </div>
  );
}

function DropdownMenu({
  mediaContext,
  isDropdownVisible,
  onClickDropdown,
  onClickLogout,
}: {
  mediaContext: TYPE_MEDIA;
  isDropdownVisible: boolean;
  onClickDropdown: () => void;
  onClickLogout: () => void;
}) {
  const fontSize =
    mediaContext === "mobile"
      ? "4vw"
      : mediaContext === "tablet"
      ? "2.7vw"
      : "1.8vw";

  //check if news has new info
  const isNewsNew = news.some((news) => news.new);

  return (
    <div
      style={{
        position: "absolute",
        top:
          mediaContext === "mobile" || mediaContext === "tablet" ? "0%" : "1%",
        right: "3%",
        aspectRatio: "1 / 1.8",
        zIndex: "10",
        width:
          mediaContext === "mobile"
            ? "60%"
            : mediaContext === "tablet"
            ? "38%"
            : "20%",
        pointerEvents: !isDropdownVisible ? "none" : "all",
      }}
    >
      <button
        style={{
          pointerEvents: "all",
          width:
            mediaContext === "mobile"
              ? "16%"
              : mediaContext === "tablet"
              ? "19%"
              : "22%",
          aspectRatio: "1",
          background: "none",
          border: "none",
          backgroundImage: 'url("/icons/dropdown.svg")',
          backgroundRepeat: "no-repeat",
          backgroundSize: "65%",
          backgroundPosition: "center",
          marginLeft:
            mediaContext !== "desktop" && mediaContext !== "big"
              ? "90%"
              : "80%",
        }}
        type="button"
        onClick={onClickDropdown}
      ></button>
      <ul
        style={{
          width: "100%",
          height: "100%",
          listStyleType: "none",
          textAlign: "center",
          borderRadius: "1.8% / 1%",
          boxShadow: "rgba(0, 0, 0, 0.315) 4px 4px 10px",
          overflow: "hidden",
          transition: "all 0.4s",
          fontSize: fontSize,
          opacity: !isDropdownVisible ? 0 : 1,
        }}
      >
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/recipes"
        >
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/recipes.svg"}
              alt="recipe icon"
              width={25}
              height={25}
            ></Image>
            <span>Recipes</span>
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/converter"
        >
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/convert.svg"}
              alt="converter icon"
              width={25}
              height={25}
            ></Image>
            <span>Converter</span>
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/account"
        >
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/account.svg"}
              alt="account icon"
              width={25}
              height={25}
            ></Image>
            <span>Account</span>
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/news"
        >
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/news.svg"}
              alt="news icon"
              width={25}
              height={25}
            ></Image>
            <span>News</span>
            {isNewsNew && (
              <span
                style={{
                  fontSize: `calc(${fontSize} * 0.9)`,
                  color: "orangered",
                }}
              >
                new!
              </span>
            )}
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/how-to-use"
        >
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/howtouse.svg"}
              alt="how to use icon"
              width={25}
              height={25}
            ></Image>
            <span>How to use</span>
          </li>
        </Link>
        <Link
          className={styles.link__dropdown}
          href="http://localhost:3000/feedback"
        >
          <li className={styles.list} style={{ gap: "8%" }}>
            <Image
              src={"/icons/feedback.svg"}
              alt="feedback icon"
              width={25}
              height={25}
            ></Image>
            <span>Feedback</span>
          </li>
        </Link>
        <li
          className={styles.list}
          style={{ gap: "8%" }}
          onClick={onClickLogout}
        >
          <Image
            src={"/icons/logout.svg"}
            alt="logout icon"
            width={25}
            height={25}
          ></Image>
          <span style={{ color: "rgba(233, 4, 4, 1)" }}>Logout</span>
        </li>
      </ul>
    </div>
  );
}

function Timers({
  mediaContext,
  timerWidth,
}: {
  mediaContext: TYPE_MEDIA;
  timerWidth: string;
}) {
  const MAX_TIMERS = 10;
  const fontSize =
    mediaContext === "mobile"
      ? getSize(timerWidth, 0.045, "3.5vw")
      : mediaContext === "tablet"
      ? getSize(timerWidth, 0.07, "2.7vw")
      : mediaContext === "desktop" && window.innerWidth <= 1100
      ? getSize(timerWidth, 0.035, "1.5vw")
      : getSize(timerWidth, 0.031, "1.3vw");

  const [timerKeys, setTimerKeys] = useState(
    Array(1)
      .fill("")
      .map((_) => {
        return { id: nanoid() };
      })
  );

  const handleDeleteTimers = function (i: number) {
    if (!timerKeys.length) return;
    setTimerKeys((prev) => prev.toSpliced(i, 1));
  };

  const handleAddTimers = function () {
    if (timerKeys.length === MAX_TIMERS) return;
    setTimerKeys((prev) => [...prev, { id: nanoid() }]);
  };

  return (
    <section
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: "linear-gradient(rgb(255, 217, 0), rgb(255, 166, 1))",
        width: "100%",
        height: "100%",
        overflowY: "auto",
        scrollbarColor: "rgb(255, 199, 125) rgb(212, 120, 0)",
        textAlign: "center",
        padding: "3% 0 1% 0",
      }}
    >
      <h2
        style={{
          fontSize: `calc(${fontSize} * 1.4)`,
          letterSpacing: "0.1vw",
          marginBottom: "5%",
        }}
      >
        Timers
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "1fr"
              : "1fr 1fr",
          rowGap: mediaContext === "mobile" ? "3%" : "1%",
          justifyItems: "center",
          width:
            mediaContext === "mobile"
              ? "90%"
              : mediaContext === "tablet"
              ? "100%"
              : mediaContext === "desktop" && window.innerWidth <= 1100
              ? "95%"
              : "90%",
          height: "fit-content",
          fontSize: fontSize,
        }}
      >
        {timerKeys.map((keyObj, i) => (
          <Timer
            key={keyObj.id}
            mediaContext={mediaContext}
            fontSize={fontSize}
            index={i}
            onClickDelete={handleDeleteTimers}
          />
        ))}
        {timerKeys.length === MAX_TIMERS || (
          <div
            className={styles.container__timer}
            style={{
              justifyContent: "center",
              width: mediaContext === "mobile" ? "80%" : "90%",
            }}
          >
            <button
              className={styles.btn__timer}
              style={{
                width: "fit-content",
                aspectRatio: "1",
                letterSpacing: "0.05vw",
                lineHeight: "105%",
                padding: "4%",
                backgroundImage:
                  "linear-gradient(rgb(251, 255, 0), rgb(255, 217, 0))",
                fontSize: `calc(${fontSize} * 0.9)`,
              }}
              onClick={handleAddTimers}
            >
              +<br />
              Add
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Timer({
  mediaContext,
  fontSize,
  index,
  onClickDelete,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  index: number;
  onClickDelete: (i: number) => void;
}) {
  const MAX_HOURS = 23;
  const MAX_MINUTES = 59;
  const MAX_SECONDS = 59;

  //design
  const fontSizeTimeInput = parseFloat(fontSize) * 1.2 + "px";
  const fontSizeControlBtn = parseFloat(fontSize) * 0.9 + "px";

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const defaultTime = { hours: "", minutes: "", seconds: "" };
  const [title, setTitle] = useState(`Timer ${index + 1}`);
  const [time, setTime] = useState(defaultTime);
  const [paused, setPaused] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  function isTimerSet() {
    return !time.hours && !time.minutes && !time.seconds ? false : true;
  }

  const handleChangeTitle = function (e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.currentTarget.value);
  };

  useEffect(() => {
    if (!isTimerSet()) return;

    //if paused is true, get rid of the timeout
    if (paused) {
      timeoutId && clearTimeout(timeoutId);
      return;
    }

    const id = setTimeout(() => {
      const numberHours = parseInt(time.hours);
      const numberMinutes = parseInt(time.minutes);
      const numberSeconds = parseInt(time.seconds);

      if (!numberHours && !numberMinutes && !numberSeconds)
        return audioRef.current?.play();

      setNewTime(numberSeconds, numberMinutes, numberHours);
    }, 1000);

    setTimeoutId(id);

    return () => clearTimeout(id);
  }, [time, paused]);

  function setNewTime(
    curNumberSeconds: number,
    curNumberMinutes: number,
    curNumberHours: number
  ) {
    const nextSeconds = !curNumberSeconds
      ? "59"
      : (curNumberSeconds - 1).toString().padStart(2, "0");

    let nextMinutes: string = "0";
    if (nextSeconds === "59") {
      if (!curNumberMinutes) nextMinutes = "59";
      if (curNumberMinutes)
        nextMinutes = (curNumberMinutes - 1).toString().padStart(2, "0");
    } else {
      nextMinutes = time.minutes;
    }

    let nextHours: string = "0";
    if (nextSeconds === "59" && nextMinutes === "59") {
      if (!curNumberHours) nextHours = "00";
      if (curNumberHours)
        nextHours = (curNumberHours - 1).toString().padStart(2, "0");
    } else {
      nextHours = time.hours;
    }

    setTime({
      hours: nextHours,
      minutes: nextMinutes,
      seconds: nextSeconds,
    });
  }

  const handleStart = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const inputHours = +(formData.get("hours") || 0);
    const inputMinutes = +(formData.get("minutes") || 0);
    const inputSeconds = +(formData.get("seconds") || 0);

    if (!validateTime(inputHours, inputMinutes, inputSeconds)) return;

    const newTime = convertTime(inputHours, inputMinutes, inputSeconds);
    if (!newTime) return;

    setTime(newTime);
  };

  function convertTime(hours: number, minutes: number, seconds: number) {
    if (hours > MAX_HOURS) return null;

    //all fields within the allowed range
    if (minutes <= MAX_MINUTES && seconds <= MAX_SECONDS)
      return {
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      };

    //minutes, seconds, or both are not within the allowd range => convert
    const newSeconds = seconds % 60;
    const min = +parseInt(seconds / 60 + "") + minutes;
    const newMinutes = min % 60;
    const newHours = +parseInt(min / 60 + "") + hours;

    if (newHours > MAX_HOURS) return null;

    return {
      hours: newHours.toString().padStart(2, "0"),
      minutes: newMinutes.toString().padStart(2, "0"),
      seconds: newSeconds.toString().padStart(2, "0"),
    };
  }

  function validateTime(hours: number, minutes: number, seconds: number) {
    //if no input => false
    if (!hours && !minutes && !seconds) return false;

    //if input is lower than 0 => false
    if (
      (hours && hours < 0) ||
      (minutes && minutes < 0) ||
      (seconds && seconds < 0)
    )
      return false;

    if (!convertTime(hours, minutes, seconds)) return false;

    return true;
  }

  const handleStop = function () {
    if (
      parseInt(time.hours) ||
      parseInt(time.minutes) ||
      parseInt(time.seconds)
    )
      return setPaused(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTime(defaultTime);
  };

  const togglePaused = () => {
    setPaused(!paused);
  };

  const handlePause = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "start") return;

    if (!isTimerSet()) return;

    togglePaused();
  };

  const handleRestart = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (e.currentTarget.value === "pause") return;

    togglePaused();
  };

  const handleReset = function () {
    if (!isTimerSet()) return;

    setTime(defaultTime);
  };

  return (
    <form
      className={styles.container__timer}
      style={{
        backgroundColor: "rgb(255, 245, 199)",
        width: mediaContext === "mobile" ? "80%" : "90%",
        gap: "8%",
        boxShadow: "rgba(0, 0, 0, 0.267) 3px 3px 8px",
      }}
      data-timer={index}
      onSubmit={handleStart}
    >
      <audio loop ref={audioRef} src="/timerAlerm.mp3"></audio>
      <button
        className={styles.btn__timer}
        style={{
          position: "absolute",
          backgroundColor: "orange",
          width: mediaContext === "mobile" ? "7%" : "8%",
          aspectRatio: "1",
          top: mediaContext !== "tablet" ? "2%" : "1%",
          right: "1%",
          fontWeight: "bold",
          fontSize: `calc(${fontSize} * 0.9)`,
        }}
        type="button"
        onClick={() => {
          onClickDelete(index);
          handleStop();
        }}
      >
        &times;
      </button>
      <input
        style={{
          width: "80%",
          height: "16%",
          textAlign: "center",
          marginTop: "8%",
          borderRadius: "2% / 18%",
          borderColor: "orange",
          fontSize: fontSize,
        }}
        type="text"
        placeholder="Set title for timer"
        value={title}
        onChange={handleChangeTitle}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: "3%",
          width: "80%",
          whiteSpace: "nowrap",
        }}
      >
        {!isTimerSet() ? (
          <>
            <input
              className={styles.input__time}
              style={{ fontSize: fontSizeTimeInput }}
              name="hours"
              type="number"
              placeholder="h"
              min="0"
              max="23"
              defaultValue={time.hours}
            />
            <input
              className={styles.input__time}
              style={{ fontSize: fontSizeTimeInput }}
              name="minutes"
              type="number"
              placeholder="min"
              min="0"
              max="59"
              defaultValue={time.minutes}
            />
            <input
              className={styles.input__time}
              style={{ fontSize: fontSizeTimeInput }}
              name="seconds"
              type="number"
              placeholder="sec"
              min="0"
              max="59"
              defaultValue={time.seconds}
            />
          </>
        ) : (
          <>
            <span
              style={{
                fontSize: `calc(${fontSize}* 1.7)`,
                letterSpacing: "0.07vw",
              }}
            >
              {time.hours} : {time.minutes} : {time.seconds}
            </span>
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          width: "100%",
          height: "fitContent",
          gap: "6%",
        }}
      >
        <button
          className={styles.btn__control_timer}
          style={{
            fontSize: fontSizeControlBtn,
            backgroundColor: "greenyellow",
          }}
          type="submit"
          onClick={handleStop}
        >
          {!isTimerSet() ? "Start" : "Stop"}
        </button>
        <button
          className={styles.btn__control_timer}
          style={{
            fontSize: fontSizeControlBtn,
            backgroundColor: "rgb(255, 153, 0)",
          }}
          type="button"
          onClick={(e) => {
            handlePause(e);
            handleRestart(e);
          }}
          value={!paused ? "pause" : "start"}
        >
          {!paused ? "Pause" : "Start"}
        </button>
        <button
          className={styles.btn__control_timer}
          style={{
            fontSize: fontSizeControlBtn,
            backgroundColor: "rgb(191, 52, 255)",
          }}
          type="reset"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

function Note({
  mediaContext,
  noteWidth,
}: {
  mediaContext: TYPE_MEDIA;
  noteWidth: string;
}) {
  return (
    <textarea
      style={{
        resize: "none",
        border: "none",
        backgroundImage:
          "linear-gradient(rgb(254, 255, 213), rgb(254, 255, 186))",
        width: "100%",
        overflowY: "auto",
        scrollbarColor: "rgb(255, 250, 209) rgb(255, 231, 92)",
        fontSize:
          mediaContext === "mobile"
            ? getSize(noteWidth, 0.047, "4vw")
            : mediaContext === "tablet"
            ? getSize(noteWidth, 0.07, "2.7vw")
            : mediaContext === "desktop" && window.innerWidth <= 1100
            ? getSize(noteWidth, 0.04, "1.5vw")
            : getSize(noteWidth, 0.03, "1.3vw"),
        letterSpacing:
          mediaContext === "mobile" || mediaContext === "tablet"
            ? "0.1vw"
            : "0.05vw",
        padding: "2% 2.8%",
        zIndex: "1",
      }}
      contentEditable="true"
      placeholder="Use this section for anything :)"
    ></textarea>
  );
}
