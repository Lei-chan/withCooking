"use client";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { MediaContext } from "../lib/providers";
import howToUse from "../lib/models/howToUse";
import clsx from "clsx";
import { check } from "zod";
import { MIN_TABLET } from "../lib/config/media";

export default function HowToUse() {
  const mediaContext = useContext(MediaContext);

  //design
  const fontSize =
    mediaContext === "mobile"
      ? "5vw"
      : mediaContext === "tablet"
      ? "2.7vw"
      : mediaContext === "desktop"
      ? "1.8vw"
      : "1.5vw";
  const fontHeaderSize = `calc(${fontSize} * 1.1)`;
  const imageSizeNormalWidth =
    mediaContext === "mobile"
      ? 300
      : mediaContext === "tablet"
      ? 500
      : mediaContext === "desktop"
      ? 600
      : 650;
  const imageSizeNormalHeight = imageSizeNormalWidth * 0.5;

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [numberOfResults, setNumberOfResults] = useState<number | null>(null);

  //ref for search
  const indexRef = useRef<HTMLDivElement>(null);

  //refs for scrollIntoView & search
  const mainRef = useRef<HTMLDivElement>(null);
  const mainSetRecipeRef = useRef<HTMLDivElement>(null);
  const mainAdjustRef = useRef<HTMLDivElement>(null);
  const mainTimersRef = useRef<HTMLDivElement>(null);
  const mainNotesRef = useRef<HTMLDivElement>(null);
  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const mainLogoutRef = useRef<HTMLDivElement>(null);
  const recipesRef = useRef<HTMLDivElement>(null);
  const createRecipeRef = useRef<HTMLDivElement>(null);
  const editRecipeRef = useRef<HTMLDivElement>(null);
  const deleteRecipeRef = useRef<HTMLDivElement>(null);
  const shareRecipeRef = useRef<HTMLDivElement>(null);
  const moreAboutRecipeRef = useRef<HTMLDivElement>(null);
  const converterRef = useRef<HTMLDivElement>(null);
  const converterDetailsRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const feedbackDetailsRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const newsDetailsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const checkAccountRef = useRef<HTMLDivElement>(null);
  const changeAccountRef = useRef<HTMLDivElement>(null);
  const closeAccountRef = useRef<HTMLDivElement>(null);

  //ref for scrollIntoView
  const screenTopRef = useRef<HTMLDivElement>(null);

  // const refsForSearch = useMemo(
  //   () => [
  //     mainRef,
  //     mainSetRecipeRef,
  //     mainAdjustRef,
  //     mainTimersRef,
  //     mainNotesRef,
  //     mainDropdownRef,
  //     mainLogoutRef,
  //     recipesRef,
  //     createRecipeRef,
  //     editRecipeRef,
  //     deleteRecipeRef,
  //     shareRecipeRef,
  //     moreAboutRecipeRef,
  //     converterRef,
  //     converterDetailsRef,
  //     feedbackRef,
  //     feedbackDetailsRef,
  //     newsRef,
  //     newsDetailsRef,
  //     accountRef,
  //     checkAccountRef,
  //     changeAccountRef,
  //     closeAccountRef,
  //     indexRef,
  //   ],
  //   [
  //     mainRef,
  //     mainSetRecipeRef,
  //     mainAdjustRef,
  //     mainTimersRef,
  //     mainNotesRef,
  //     mainDropdownRef,
  //     mainLogoutRef,
  //     recipesRef,
  //     createRecipeRef,
  //     editRecipeRef,
  //     deleteRecipeRef,
  //     shareRecipeRef,
  //     moreAboutRecipeRef,
  //     converterRef,
  //     converterDetailsRef,
  //     feedbackRef,
  //     feedbackDetailsRef,
  //     newsRef,
  //     newsDetailsRef,
  //     accountRef,
  //     checkAccountRef,
  //     changeAccountRef,
  //     closeAccountRef,
  //     indexRef,
  //   ]
  // );

  const refsForSearch = [
    mainRef,
    mainSetRecipeRef,
    mainAdjustRef,
    mainTimersRef,
    mainNotesRef,
    mainDropdownRef,
    mainLogoutRef,
    recipesRef,
    createRecipeRef,
    editRecipeRef,
    deleteRecipeRef,
    shareRecipeRef,
    moreAboutRecipeRef,
    converterRef,
    converterDetailsRef,
    feedbackRef,
    feedbackDetailsRef,
    newsRef,
    newsDetailsRef,
    accountRef,
    checkAccountRef,
    changeAccountRef,
    closeAccountRef,
    indexRef,
  ];

  function handleClickSearch() {
    setIsSearchVisible(!isSearchVisible);
  }

  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const target = e.currentTarget;
    const value = new FormData(target).get("search");

    setNumberOfResults(null);
    setKeyword(String(value).trim().toLowerCase());

    target.querySelector("input")?.blur();
  }

  function handleClickUpArrow() {
    if (screenTopRef?.current)
      screenTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  //callback functions for scrollIntoView
  function handleClickMain() {
    if (mainRef?.current)
      mainRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleClickMainSetRecipe() {
    if (mainSetRecipeRef?.current)
      mainSetRecipeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickMainAdjust() {
    if (mainAdjustRef?.current)
      mainAdjustRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickMainTimers() {
    if (mainTimersRef?.current)
      mainTimersRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickMainNotes() {
    if (mainNotesRef?.current)
      mainNotesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickMainDropdown() {
    if (mainDropdownRef?.current)
      mainDropdownRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickMainLogout() {
    if (mainLogoutRef?.current)
      mainLogoutRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickRecipes() {
    if (recipesRef?.current)
      recipesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleClickCreateRecipe() {
    if (createRecipeRef?.current)
      createRecipeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickEditRecipe() {
    if (editRecipeRef?.current)
      editRecipeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickDeleteRecipe() {
    if (deleteRecipeRef?.current)
      deleteRecipeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickShareRecipe() {
    if (shareRecipeRef?.current)
      shareRecipeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickMoreAboutRecipe() {
    if (moreAboutRecipeRef?.current)
      moreAboutRecipeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickConverter() {
    if (converterRef?.current)
      converterRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickConverterDetails() {
    if (converterDetailsRef?.current)
      converterDetailsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickFeedback() {
    if (feedbackRef?.current)
      feedbackRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickFeedbackDetails() {
    if (feedbackDetailsRef?.current)
      feedbackDetailsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickNews() {
    if (newsRef?.current)
      newsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleClickNewsDetails() {
    if (newsDetailsRef?.current)
      newsDetailsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickAccount() {
    if (accountRef?.current)
      accountRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleClickCheckAccount() {
    if (checkAccountRef?.current)
      checkAccountRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickChangeAccount() {
    if (changeAccountRef?.current)
      changeAccountRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickCloseAccount() {
    if (closeAccountRef?.current)
      closeAccountRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  //search => mark keywords in texts, set numberOfResults matches keyword
  useEffect(() => {
    // When no keyword is put, get rid of old <span></span>
    if (!keyword) {
      refsForSearch.forEach((ref) => {
        if (ref.current) {
          const childrenArr = Array.from(ref.current.children);

          //get rid of old <span></span>
          const replacedInnerHTML = childrenArr.map((child) =>
            child.innerHTML
              .replaceAll('<span style="background-color: yellow">', "")
              .replaceAll("</span>", "")
          );

          childrenArr.forEach(
            (child, i) => (child.innerHTML = replacedInnerHTML[i])
          );
        }
      });

      return;
    }

    //When keyword is truty value
    const keywordUpperCase = keyword.toUpperCase();
    const keywordFirstUpperCase =
      keyword.at(0)?.toUpperCase() + keyword.slice(1);

    let results = 0;
    refsForSearch.forEach((ref) => {
      if (ref.current) {
        const childrenArr = Array.from(ref.current.children);

        //get rid of old <span></span> and add new span
        const replacedInnerHTML = childrenArr.map((child) =>
          child.innerHTML
            .replaceAll('<span style="background-color: yellow">', "")
            .replaceAll("</span>", "")
            .replaceAll(
              keyword,
              `<span style='background-color: yellow'>${keyword}</span>`
            )
            .replaceAll(
              keywordUpperCase,
              `<span style='background-color: yellow'>${keywordUpperCase}</span>`
            )
            .replaceAll(
              keywordFirstUpperCase,
              `<span style='background-color: yellow'>${keywordFirstUpperCase}</span>`
            )
        );

        //changing current HTML to replaced (marked) HTML
        childrenArr.forEach(
          (child, i) => (child.innerHTML = replacedInnerHTML[i])
        );

        //count number of results
        // First, connect all elements in an array and separate by whitespace again, so it becomes one array with elements separated by words.
        // Second, add 1 if the word includes </span>
        const resultsInCurChilden = replacedInnerHTML
          .join(" ")
          .split(" ")
          .reduce((acc, word) => {
            return word.includes("</span>") ? acc + 1 : acc;
          }, results);

        results = resultsInCurChilden;
      }
    });

    setNumberOfResults(results);
  }, [keyword]);

  console.log(mediaContext);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        width: "100vw",
        minHeight: "100vh",
        maxHeight: "fit-content",
        backgroundColor: "#fff9e9ff",
        padding: "6% 0 0 0",
      }}
      ref={screenTopRef}
    >
      <h1
        style={{
          color: "#6e6c00ff",
          letterSpacing: "0.1vw",
          fontSize: `calc(${fontSize} * 1.9)`,
          marginBottom: "4%",
        }}
      >
        How to use
      </h1>
      <div
        style={{
          width: "100%",
          height: "10%",
          position: "fixed",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "right",
          top: "2%",
          right: "2%",
          zIndex: "10",
          padding: "0 2%",
        }}
      >
        {numberOfResults !== null && (
          <p
            style={{
              display: "flex",
              width:
                mediaContext === "mobile"
                  ? "20%"
                  : mediaContext === "tablet"
                  ? "15%"
                  : "10%",
              height: "100%",
              flexDirection: "column",
              textAlign: "center",
              justifyContent: "center",
              backgroundColor: "#fffebbff",
              fontSize,
              color: "#b44200ff",
              boxShadow: "#00000046 2px 2px 7px",
              borderRadius: "6px",
              padding: "1%",
            }}
          >{`${numberOfResults} results`}</p>
        )}
        <form
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "right",
            width:
              mediaContext === "mobile"
                ? "76%"
                : mediaContext === "tablet"
                ? "81%"
                : "86%",
            height: "100%",
            gap: "4%",
            overflow: "hidden",
            // backgroundColor: "blue",
          }}
          onSubmit={handleSubmitSearch}
        >
          <input
            style={{
              fontSize,
              width:
                mediaContext === "mobile"
                  ? "75%"
                  : mediaContext === "tablet"
                  ? "50%"
                  : "30%",
              height: "80%",
              textAlign: "center",
              padding: "2%",
              letterSpacing: "0.1vw",
              borderRadius: "3px",
              borderColor: "#00000042",
              transform: isSearchVisible
                ? "translateX(0%)"
                : "translateX(150%)",
              transition: "all 0.4s",
            }}
            type="search"
            name="search"
            placeholder="search by keyword"
          ></input>
          <button
            className={styles.btn__image}
            style={{
              width:
                mediaContext === "mobile"
                  ? "15%"
                  : mediaContext === "tablet"
                  ? "8%"
                  : mediaContext === "desktop"
                  ? "5%"
                  : "4%",
              aspectRatio: "1",
              backgroundImage: "url('/icons/magnifying-grass.svg')",
            }}
            type="button"
            onClick={handleClickSearch}
          ></button>
        </form>
      </div>
      <button
        className={styles.btn__image}
        style={{
          position: "fixed",
          bottom: "3%",
          right:
            mediaContext === "mobile"
              ? "5%"
              : mediaContext === "tablet"
              ? "4%"
              : "3%",
          width:
            mediaContext === "mobile"
              ? "8%"
              : mediaContext === "tablet"
              ? "5%"
              : "4%",
          aspectRatio: "1/1",
          backgroundImage: 'url("/icons/up-arrow.svg")',
        }}
        onClick={handleClickUpArrow}
      ></button>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width:
            mediaContext === "mobile"
              ? "90%"
              : mediaContext === "tablet"
              ? "70%"
              : "60%",
          height: "fit-content",
          backgroundColor: "#fffefcff",
          borderRadius: "5px",
          boxShadow: "#00000042 3px 3px 7px",
          padding:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "7%"
              : "7%",
          marginBottom: "10%",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            fontSize,
          }}
          ref={indexRef}
        >
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickMain}
          >
            Main Page
          </a>
          {/* <div className={styles.container__a} style={{ fontSize }}> */}
          <a className={styles.a} onClick={handleClickMainAdjust}>
            How can I adjust the recipe, timer, and notes sizes?
          </a>
          <a className={styles.a} onClick={handleClickMainSetRecipe}>
            How can I set a recipe?
          </a>
          <a className={styles.a} onClick={handleClickMainTimers}>
            How do timers work?
          </a>
          <a className={styles.a} onClick={handleClickMainNotes}>
            How do notes work?
          </a>
          <a className={styles.a} onClick={handleClickMainDropdown}>
            How can I go to different pages?
          </a>
          <a className={styles.a} onClick={handleClickMainLogout}>
            How can I log out?
          </a>
          {/* </div> */}
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickRecipes}
          >
            Recipes, Create Recipe, Recipe Page
          </a>
          {/* <div className={styles.container__a} style={{ fontSize }}> */}
          <a className={styles.a} onClick={handleClickCreateRecipe}>
            How can I create a recipe?
          </a>
          <a className={styles.a} onClick={handleClickEditRecipe}>
            How can I edit a recipe?
          </a>
          <a className={styles.a} onClick={handleClickDeleteRecipe}>
            How can I delete a recipe?
          </a>
          <a className={styles.a} onClick={handleClickShareRecipe}>
            How can I share a recipe?
          </a>
          <a className={styles.a} onClick={handleClickMoreAboutRecipe}>
            Tell me more about what I can do with a recipe!
          </a>
          {/* </div> */}
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickConverter}
          >
            Converter Page
          </a>
          {/* <div className={styles.container__a} style={{ fontSize }}> */}
          <a className={styles.a} onClick={handleClickConverterDetails}>
            What can I do on the converter page?
          </a>
          {/* </div> */}
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickFeedback}
          >
            Feedback Page
          </a>
          {/* <div className={styles.container__a} style={{ fontSize }}> */}
          <a className={styles.a} onClick={handleClickFeedbackDetails}>
            What can I do on the feedback page?
          </a>
          {/* </div> */}
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickNews}
          >
            News Page
          </a>
          {/* <div className={styles.container__a} style={{ fontSize }}> */}
          <a className={styles.a} onClick={handleClickNewsDetails}>
            What can I do on the news page?
          </a>
          {/* </div> */}
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickAccount}
          >
            Account Page
          </a>
          {/* <div className={styles.container__a} style={{ fontSize }}> */}
          <a className={styles.a} onClick={handleClickCheckAccount}>
            How can I check my account information?
          </a>
          <a className={styles.a} onClick={handleClickChangeAccount}>
            How can I change my account information?
          </a>
          <a className={styles.a} onClick={handleClickCloseAccount}>
            How can I close my account?
          </a>
          {/* </div> */}
        </div>
      </div>
      <div
        style={{
          padding:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "0 5%"
              : "0 10%",
        }}
      >
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={mainRef}
        >
          Main Page
        </h3>
        <Image
          src="/how-to-use/main.webp"
          alt="Main page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <div className={styles.container__answer} ref={mainAdjustRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I adjust the recipe, timer, and notes sizes?
          </p>
          <Image
            src="/how-to-use/main-adjust.gif"
            alt="Main page adjust video"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            {`When you want to change the recipe and timer/notes width, or the
            timer and notes height, place a cursor onto where the two sections
            are separated, and drag it to where you want to move it to.
            You can adjust the sizes only when you are using a device larger
            than a tablet (width is larger than ${MIN_TABLET}px).`}
          </p>
        </div>
        <div className={styles.container__answer} ref={mainSetRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I set a recipe?
          </p>
          <Image
            src="/how-to-use/main-search.webp"
            alt="Search menu image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <Image
            src="/how-to-use/main-search-details.webp"
            alt="Search menu details image"
            width={imageSizeNormalWidth * 0.9}
            height={imageSizeNormalHeight * 1.1}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Click the top left three line icon to open/close the search section.
            <br />
            Search your recipe by either the title or ingredient. An incomplete
            title or ingredient works too.
          </p>
        </div>
        <div className={styles.container__answer} ref={mainTimersRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How do timers work?
          </p>
          <Image
            src="/how-to-use/main-timers.webp"
            alt="Timers image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.5}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Put numbers in the h (hours), min (minutes), and sec (seconds) input
            fields, and click the start button. Maximum allowed time is
            23h59min59sec. When a timer finished, the alarm will go off.
            <br />
            🍳 To pause timer : Click the Pause button
            <br />
            🍳 To restart timer : Click the Start button
            <br />
            🍳 To stop timer alarm : Click the Stop button
            <br />
            🍳 To reset timer : Clic the reset button <br />
            🍳 To change timer title : Change texts in the top input field
            <br />
            🍳 To add timer : Click the +Add button. You can add 10 timers at
            maximum.
            <br />
            🍳 To delete timer : Click the top right x button
          </p>
        </div>
        <div className={styles.container__answer} ref={mainNotesRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How do notes work?
          </p>
          <Image
            src="/how-to-use/main-notes.webp"
            alt="Notes image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can write anything you want here. What you write will disappear
            when you reload the page or go to a different page.
          </p>
        </div>
        <div className={styles.container__answer} ref={mainDropdownRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I go to a different page?
          </p>
          <Image
            src="/how-to-use/main-dropdown.webp"
            alt="Dropdown menu image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Click the top right three line icon to open/close the dropdown menu.
            Click the page your want to go to.
          </p>
        </div>
        <div className={styles.container__answer} ref={mainLogoutRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={mainLogoutRef}
          >
            How can I log out?
          </p>
          <Image
            src="/how-to-use/others-logout.webp"
            alt="Logout image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.6}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Click the top right three line icon to open/close the dropdown menu.
            Click the bottom Logout button and click the I'm sure button.
          </p>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={recipesRef}
        >
          Recipes, Create Recipe, Recipe Pages
        </h3>
        <Image
          src="/how-to-use/recipes.webp"
          alt="Recipes page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <p className={styles.p__answer} style={{ fontSize, marginTop: "1%" }}>
          Recipes page image
        </p>
        <Image
          src="/how-to-use/recipe-no-edit.webp"
          alt="No edit recipe image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <p className={styles.p__answer} style={{ fontSize, marginTop: "1%" }}>
          Recipe page image
        </p>
        <Image
          src="/how-to-use/recipe-edit.webp"
          alt="Edit recipe image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight * 1.7}
        ></Image>
        <p className={styles.p__answer} style={{ fontSize, marginTop: "1%" }}>
          Recipe page (edit) image
        </p>
        <div className={styles.container__answer} ref={createRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I create a recipe?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            Click the top right create button on the recipes page and go to the
            create recipe page. Fill the form and click the upload button.
          </p>
          <Image
            src="/how-to-use/recipe-create1.webp"
            alt="Create recipe image1"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.8}
          ></Image>
          <Image
            src="/how-to-use/recipe-create2.webp"
            alt="Create recipe image2"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.5}
          ></Image>
        </div>
        <div className={styles.container__answer} ref={editRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I edit a recipe?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            Click the recipe you want to edit on the recipes page and go to the
            recipe page.
          </p>
          <Image
            src="/how-to-use/recipe-no-edit.webp"
            alt="No edit recipe image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Click the top right Edit button to edit the recipe.
          </p>
          <Image
            src="/how-to-use/recipe-edit.webp"
            alt="Edit recipe image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.7}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Fill the form and click the upload button.
          </p>
        </div>
        <div className={styles.container__answer} ref={deleteRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I delete a recipe?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            Click the select recipe button on the recipes page.
          </p>
          <Image
            src="/how-to-use/recipes-select.webp"
            alt="Select recipe image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Select the recipes you want to delete. Click the trash can button to
            delete them.
            <br />
            When you want to quit selecting, click the stop selecting button.
          </p>
        </div>
        <div className={styles.container__answer} ref={shareRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I share a recipe?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            Click the recipe you want to share on the recipes page and go to the
            recipe page. <br />
            Copy the link and share it with anyone.
          </p>
        </div>
        <div className={styles.container__answer} ref={moreAboutRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            Tell me more about what I can do with a recipe!
          </p>
          <Image
            src="/how-to-use/brief-explanation.webp"
            alt="Change servings, region, and temperature units image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.6}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can change servings, regions, and temperature units used in a
            recipe. When you change them, converted ingredient amounts, units,
            and temperatures will be displayed.
          </p>
          <Image
            src="/how-to-use/recipe-ing.webp"
            alt="Check recipe ingredients image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 0.9}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can check each ingredient, so you won't forget which one you've
            already added.
          </p>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={converterRef}
        >
          Converter Page
        </h3>
        <Image
          src="/how-to-use/converter.webp"
          alt="Converter page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <div className={styles.container__answer} ref={converterDetailsRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            What can I do on the converter page?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can convert ingredient units (e.g. grams, oz), temperature units
            (℉, ℃), and length units (e.g. cm, inches)!
          </p>
          <Image
            src="/how-to-use/converter-ing.webp"
            alt="Convert ingredient units image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 0.8}
          ></Image>
          <Image
            src="/how-to-use/converter-others.webp"
            alt="Convert temperature and length units image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 0.85}
          ></Image>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={feedbackRef}
        >
          Feedback Page
        </h3>
        <Image
          src="/how-to-use/feedback.webp"
          alt="Feedback page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <div className={styles.container__answer} ref={feedbackDetailsRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            What can I do on the feedback page?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can send a feedback about the website! I appreciete if you give
            me any thoughts about the website or tell me about bugs you
            encounter!
          </p>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={newsRef}
        >
          News Page
        </h3>
        <Image
          src="/how-to-use/news.webp"
          alt="News page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <div className={styles.container__answer} ref={newsDetailsRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            What can I do on the news page?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can check news about the website, such as new features or bugs
            information.
          </p>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={accountRef}
        >
          Account Page
        </h3>
        <Image
          src="/how-to-use/account.webp"
          alt="Account page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight * 1.3}
        ></Image>
        <div className={styles.container__answer} ref={checkAccountRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I check my account information?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can check your account information on the account page. You
            can't check your password for a security reason.
          </p>
        </div>
        <div className={styles.container__answer} ref={changeAccountRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I change my account information?
          </p>
          <Image
            src="/how-to-use/account-email.webp"
            alt="Change email image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.1}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Put new email in the input field and click the Submit button on the
            account page.
          </p>
          <Image
            src="/how-to-use/account-password.webp"
            alt="Change password image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.1}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Put your current password and new password in the input fields, and
            click the Change button on the account page.
          </p>
        </div>
        <div className={styles.container__answer} ref={closeAccountRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            How can I close my account?
          </p>
          <Image
            src="/how-to-use/account-close.webp"
            alt="Close account image"
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.1}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize }}>
            Close your account by clicking the Close and I'm sure button on the
            account page.
          </p>
        </div>
      </div>
    </div>
  );
}
