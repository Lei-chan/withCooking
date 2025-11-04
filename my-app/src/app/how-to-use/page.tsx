"use client";
import { useContext, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { MediaContext } from "../lib/providers";
import howToUse from "../lib/models/howToUse";
import clsx from "clsx";

export default function HowToUse() {
  const mediaContext = useContext(MediaContext);

  //design
  const fontSize = mediaContext === "mobile" ? "5vw" : "2vw";
  const fontHeaderSize = `calc(${fontSize} * 1.1)`;
  const imageSizeNormalWidth = mediaContext === "mobile" ? 300 : 400;
  const imageSizeNormalHeight = imageSizeNormalWidth * 0.5;

  const [isSearchVisible, setIsSearchVisible] = useState(false);

  //refs for scrollIntoView
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

  function handleClickSearch() {
    setIsSearchVisible(!isSearchVisible);
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
        padding: "6% 0 7% 0",
      }}
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
          position: "absolute",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "right",
          width: "80%",
          height: "10%",
          top: "2%",
          right: "2%",
          gap: "2%",
          overflow: "hidden",
          //   backgroundColor: "blue",
        }}
      >
        <input
          style={{
            fontSize,
            width: "75%",
            height: "fit-content",
            textAlign: "center",
            padding: "2%",
            letterSpacing: "0.1vw",
            borderRadius: "3px",
            borderColor: "#00000042",
            transform: isSearchVisible ? "translateX(0%)" : "translateX(150%)",
            transition: "all 0.4s",
          }}
          type="search"
          placeholder="search by keyword"
        ></input>
        <button
          style={{
            width: "15%",
            aspectRatio: "1",
            backgroundImage: "url('/icons/magnifying-grass.svg')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundColor: "transparent",
            border: "none",
          }}
          onClick={handleClickSearch}
        ></button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "90%",
          height: "fit-content",
          backgroundColor: "#fffefcff",
          borderRadius: "5px",
          boxShadow: "#00000042 3px 3px 7px",
          padding: "5%",
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
          }}
        >
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickMain}
          >
            Main Page
          </a>
          <div className={styles.container__a} style={{ fontSize }}>
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
          </div>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickRecipes}
          >
            Recipes, Create Recipe, Recipe Page
          </a>
          <div className={styles.container__a} style={{ fontSize }}>
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
          </div>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickConverter}
          >
            Converter Page
          </a>
          <div className={styles.container__a} style={{ fontSize }}>
            <a className={styles.a} onClick={handleClickConverterDetails}>
              What can I do on the converter page?
            </a>
          </div>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickFeedback}
          >
            Feedback Page
          </a>
          <div className={styles.container__a} style={{ fontSize }}>
            <a className={styles.a} onClick={handleClickFeedbackDetails}>
              What can I do on the feedback page?
            </a>
          </div>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickNews}
          >
            News Page
          </a>
          <div className={styles.container__a} style={{ fontSize }}>
            <a className={styles.a} onClick={handleClickNewsDetails}>
              What can I do on the news page?
            </a>
          </div>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickAccount}
          >
            Account Page
          </a>
          <div className={styles.container__a} style={{ fontSize }}>
            <a className={styles.a} onClick={handleClickCheckAccount}>
              How can I check my account information?
            </a>
            <a className={styles.a} onClick={handleClickChangeAccount}>
              How can I change my account information?
            </a>
            <a className={styles.a} onClick={handleClickCloseAccount}>
              How can I close my account?
            </a>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 5%" }}>
        <h3 className={styles.small_header} ref={mainRef}>
          Main Page
        </h3>
        <Image
          src="/how-to-use/main.webp"
          alt="Main page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={mainAdjustRef}
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
            When you want to change the recipe and timer/notes width, or the
            timer and notes height, place a cursor onto where the two sections
            are separated, and drag it to where you want to move it to.
            <br />
            You can adjust the sizes only when you are using a device larger
            than a tablet (width is larger than px).
          </p>
        </div>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={mainSetRecipeRef}
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
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={mainTimersRef}
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
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={mainNotesRef}
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
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={mainDropdownRef}
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
        <div className={styles.container__answer}>
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
            height={imageSizeNormalHeight}
          ></Image>
          <p>
            Click the top right three line icon to open/close the dropdown menu.
            Click the bottom Logout button and click the I'm sure button.
          </p>
        </div>
        <h3 className={styles.small_header} ref={recipesRef}>
          Recipes, Create Recipe, Recipe Pages
        </h3>
        <Image
          src="/how-to-use/recipes.webp"
          alt="Recipes page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <p className={styles.p__answer} style={{ fontSize }}>
          Recipes page image
        </p>
        <Image
          src="/how-to-use/recipe-no-edit.webp"
          alt="No edit recipe image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <p className={styles.p__answer} style={{ fontSize }}>
          Recipe page image
        </p>
        <Image
          src="/how-to-use/recipe-edit.webp"
          alt="Edit recipe image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight * 1.7}
        ></Image>
        <p className={styles.p__answer} style={{ fontSize }}>
          Recipe page (edit) image
        </p>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={createRecipeRef}
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
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={editRecipeRef}
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
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={deleteRecipeRef}
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
          <p>
            Select the recipes you want to delete. Click the trash can button to
            delete them.
            <br />
            When you want to quit selecting, click the stop selecting button.
          </p>
        </div>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={shareRecipeRef}
          >
            How can I share a recipe?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            Click the recipe you want to share on the recipes page and go to the
            recipe page. <br />
            Copy the link and share it with anyone.
          </p>
        </div>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={moreAboutRecipeRef}
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
        <h3 className={styles.small_header} ref={converterRef}>
          Converter Page
        </h3>
        <Image
          src="/how-to-use/converter.webp"
          alt="Converter page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={converterDetailsRef}
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
        <h3 className={styles.small_header} ref={feedbackRef}>
          Feedback Page
        </h3>
        <Image
          src="/how-to-use/feedback.webp"
          alt="Feedback page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={feedbackDetailsRef}
          >
            What can I do on the feedback page?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can send a feedback about the website! I appreciete if you give
            me any thoughts about the website or tell me about bugs you
            encounter!
          </p>
        </div>
        <h3 className={styles.small_header} ref={newsRef}>
          News Page
        </h3>
        <Image
          src="/how-to-use/news.webp"
          alt="News page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={newsDetailsRef}
          >
            What can I do on the news page?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can check news about the website, such as new features or bugs
            information.
          </p>
        </div>
        <h3 className={styles.small_header} ref={accountRef}>
          Account Page
        </h3>
        <Image
          src="/how-to-use/account.webp"
          alt="Account page image"
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight * 1.3}
        ></Image>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={checkAccountRef}
          >
            How can I check my account information?
          </p>
          <p className={styles.p__answer} style={{ fontSize }}>
            You can check your account information on the account page. You
            can't check your password for a security reason.
          </p>
        </div>
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={changeAccountRef}
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
        <div className={styles.container__answer}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={closeAccountRef}
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
