"use client";
//react
import { useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
//next.js
import Image from "next/image";
//css
import styles from "./page.module.css";
//context
import { LanguageContext, MediaContext } from "../lib/providers";
//media
import { MIN_TABLET } from "../lib/config/media";
//general method
import { getFontSizeForLanguage } from "../lib/helpers/other";

export default function HowToUse() {
  //language
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || "en";

  //design
  const mediaContext = useContext(MediaContext);

  const fontSizeEn =
    mediaContext === "mobile"
      ? "5vw"
      : mediaContext === "tablet"
      ? "2.7vw"
      : mediaContext === "desktop"
      ? "1.8vw"
      : "1.5vw";
  const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);
  const fontHeaderSize = `calc(${fontSizeFinal} * 1.1)`;
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
  const timersRef = useRef<HTMLDivElement>(null);
  const memosRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logoutRef = useRef<HTMLDivElement>(null);
  const recipesRef = useRef<HTMLDivElement>(null);
  const recipeLimitRef = useRef<HTMLDivElement>(null);
  const createRecipeRef = useRef<HTMLDivElement>(null);
  const editRecipeRef = useRef<HTMLDivElement>(null);
  const deleteRecipeRef = useRef<HTMLDivElement>(null);
  const shareRecipeRef = useRef<HTMLDivElement>(null);
  const cannotViewRecipeLinkRef = useRef<HTMLDivElement>(null);
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

  const refsForSearch = [
    mainRef,
    mainSetRecipeRef,
    mainAdjustRef,
    timersRef,
    memosRef,
    dropdownRef,
    logoutRef,
    recipesRef,
    recipeLimitRef,
    createRecipeRef,
    editRecipeRef,
    deleteRecipeRef,
    shareRecipeRef,
    cannotViewRecipeLinkRef,
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

  //titles
  const mainTitle = language === "ja" ? "メインページ" : "Main Page";
  const mainSetRecipeTitle =
    language === "ja"
      ? "どうすればレシピをセットできますか？"
      : "How can I set a recipe?";
  const mainResizeTitle =
    language === "ja"
      ? "どのようにレシピ、タイマー、メモのサイズを調整できますか？"
      : "How can I resize the recipe, timer, and memos?";
  const mainTimersTitle =
    language === "ja"
      ? "どのようにタイマーを使用できますか？"
      : "How can I use timers?";
  const mainMemosTitle =
    language === "ja"
      ? "どのようにメモ欄を使用できますか？"
      : "How do memos work?";
  const mainDropdownTitle =
    language === "ja"
      ? "どうすれば別のページに移動することができますか？"
      : "How can I go to different pages?";
  const mainLogoutTitle =
    language === "ja"
      ? "どうやってログアウトできますか？"
      : "How can I log out?";
  const recipesTitle =
    language === "ja"
      ? "レシピまとめ、レシピ作成、レシピページ"
      : "Recipes, Create Recipe, Recipe Page";
  const recipeLimitTitle =
    language === "ja"
      ? "レシピは何個まで作成できますか？"
      : "How many recipes can I create?";
  const createRecipeTitle =
    language === "ja"
      ? "どのようにレシピを作ることができますか？"
      : "How can I create a recipe?";
  const editRecipeTitle =
    language === "ja"
      ? "どのようにレシピを編集することができますか？"
      : "How can I edit a recipe?";
  const deleteRecipeTitle =
    language === "ja"
      ? "どのようにレシピを削除することができますか？"
      : "How can I delete a recipe?";
  const shareRecipeTitle =
    language === "ja"
      ? "どのようにレシピをシェアすることができますか？"
      : "How can I share a recipe?";
  const cannotViewRecipeLinkTitle =
    language === "ja"
      ? "外部リンクから作成したレシピを見ることができません"
      : "I cannot view the recipe created from an external link";
  const moreAboutRecipeTitle =
    language === "ja"
      ? "レシピでできることをもっと詳しく教えてください！"
      : "Tell me more about what I can do with recipes!";
  const converterTitle =
    language === "ja" ? "単位変換ぺージ" : "Converter Page";
  const converterDetailsTitle =
    language === "ja"
      ? "単位変換ページでは何ができますか？"
      : "What can I do on the Converter page?";
  const feedbackTitle =
    language === "ja" ? "フィードバックページ" : "Feedback Page";
  const feedbackDetailsTitle =
    language === "ja"
      ? "フィードバックページでは何ができますか？"
      : "What can I do on the Feedback page?";
  const newsTitle = language === "ja" ? "ニュースページ" : "News Page";
  const newsDetailsTitle =
    language === "ja"
      ? "ニュースページでは何ができますか？"
      : "What can I do on the News page?";
  const accountTitle = language === "ja" ? "アカウントページ" : "Account Page";
  const checkAccountTitle =
    language === "ja"
      ? "どのように自分のアカウント情報を確認できますか？"
      : "How can I check my account information?";
  const changeAccountTitle =
    language === "ja"
      ? "どのように自分のアカウント情報を変更することができますか？"
      : "How can I change my account information?";
  const closeAccountTitle =
    language === "ja"
      ? "どうやって退会することができますか？"
      : "How can I close my account?";

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

  //callback functions for scrollIntoView
  function handleClickUpArrow() {
    if (screenTopRef?.current)
      screenTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

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

  function handleClickTimers() {
    if (timersRef?.current)
      timersRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickMemos() {
    if (memosRef?.current)
      memosRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickDropdown() {
    if (dropdownRef?.current)
      dropdownRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickLogout() {
    if (logoutRef?.current)
      logoutRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleClickRecipes() {
    if (recipesRef?.current)
      recipesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleClickRecipeLimit() {
    if (recipeLimitRef?.current)
      recipeLimitRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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

  function handleClickCannotViewRecipeLink() {
    if (cannotViewRecipeLinkRef?.current)
      cannotViewRecipeLinkRef.current.scrollIntoView({
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
          fontSize: `calc(${fontSizeFinal} * 1.9)`,
          marginBottom: "4%",
        }}
      >
        {language === "ja" ? "使い方" : "How To Use"}
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
              fontSize: fontSizeFinal,
              color: "#b44200ff",
              boxShadow: "#00000046 2px 2px 7px",
              borderRadius: "6px",
              padding: "1%",
            }}
          >{`${numberOfResults} ${language === "ja" ? "件" : "results"}`}</p>
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
          }}
          onSubmit={handleSubmitSearch}
        >
          <input
            style={{
              fontSize: fontSizeFinal,
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
            placeholder={
              language === "ja" ? "キーワードで検索" : "search by keyword"
            }
          ></input>
          <button
            className={styles.btn__image}
            style={{
              width:
                mediaContext === "mobile"
                  ? "14%"
                  : mediaContext === "tablet"
                  ? "7%"
                  : mediaContext === "desktop"
                  ? "5%"
                  : "3.5%",
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
            fontSize: fontSizeFinal,
          }}
          ref={indexRef}
        >
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickMain}
          >
            {mainTitle}
          </a>
          <a className={styles.a} onClick={handleClickMainSetRecipe}>
            {mainSetRecipeTitle}
          </a>
          <a className={styles.a} onClick={handleClickMainAdjust}>
            {mainResizeTitle}
          </a>
          <a className={styles.a} onClick={handleClickTimers}>
            {mainTimersTitle}
          </a>
          <a className={styles.a} onClick={handleClickMemos}>
            {mainMemosTitle}
          </a>
          <a className={styles.a} onClick={handleClickDropdown}>
            {mainDropdownTitle}
          </a>
          <a className={styles.a} onClick={handleClickLogout}>
            {mainLogoutTitle}
          </a>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickRecipes}
          >
            {recipesTitle}
          </a>
          <a className={styles.a} onClick={handleClickRecipeLimit}>
            {recipeLimitTitle}
          </a>
          <a className={styles.a} onClick={handleClickCreateRecipe}>
            {createRecipeTitle}
          </a>
          <a className={styles.a} onClick={handleClickEditRecipe}>
            {editRecipeTitle}
          </a>
          <a className={styles.a} onClick={handleClickDeleteRecipe}>
            {deleteRecipeTitle}
          </a>
          <a className={styles.a} onClick={handleClickShareRecipe}>
            {shareRecipeTitle}
          </a>
          <a className={styles.a} onClick={handleClickCannotViewRecipeLink}>
            {cannotViewRecipeLinkTitle}
          </a>
          <a className={styles.a} onClick={handleClickMoreAboutRecipe}>
            {moreAboutRecipeTitle}
          </a>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickConverter}
          >
            {converterTitle}
          </a>
          <a className={styles.a} onClick={handleClickConverterDetails}>
            {converterDetailsTitle}
          </a>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickFeedback}
          >
            {feedbackTitle}
          </a>
          <a className={styles.a} onClick={handleClickFeedbackDetails}>
            {feedbackDetailsTitle}
          </a>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickNews}
          >
            {newsTitle}
          </a>
          <a className={styles.a} onClick={handleClickNewsDetails}>
            {newsDetailsTitle}
          </a>
          <a
            className={clsx(styles.small_header, styles.a__small_header)}
            style={{ fontSize: fontHeaderSize }}
            onClick={handleClickAccount}
          >
            {accountTitle}
          </a>
          <a className={styles.a} onClick={handleClickCheckAccount}>
            {checkAccountTitle}
          </a>
          <a className={styles.a} onClick={handleClickChangeAccount}>
            {changeAccountTitle}
          </a>
          <a className={styles.a} onClick={handleClickCloseAccount}>
            {closeAccountTitle}
          </a>
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
          {mainTitle}
        </h3>
        <Image
          src={`/how-to-use/${language}/main-explanation.webp`}
          alt={language === "ja" ? "メインページ画像" : "Main page image"}
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <div className={styles.container__answer} ref={mainSetRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {mainSetRecipeTitle}
          </p>
          <Image
            src={`/how-to-use/${language}/main-search-explanation.webp`}
            alt={language === "ja" ? "検索メニュー画像" : "Search menu image"}
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <Image
            src={`/how-to-use/${language}/main-search-details.webp`}
            alt={
              language === "ja"
                ? "検索メニュー詳細画像"
                : "Search menu details image"
            }
            width={imageSizeNormalWidth * 0.9}
            height={imageSizeNormalHeight * 1.1}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "左上にある三本線のボタンをクリックしてください。タイトルか材料でレシピを検索してください。途中までの記入でも検索できます。セットしたいレシピをクリックしてください。"
              : "Click the three-line button in the top left. Search your recipes by title or ingredient—partial words work too. Then, click the recipe you want to select."}
          </p>
        </div>
        <div className={styles.container__answer} ref={mainAdjustRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {mainResizeTitle}
          </p>
          <Image
            src="/how-to-use/main-adjust.gif"
            alt={
              language === "ja"
                ? "メインページサイズ調整ビデオ"
                : "Main page size adjust video"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? `レシピ、タイマー・ノートの横幅、またはタイマーとノートの高さを調整するには、まずマウス・指を２つのエリアを隔てている間に置き、そのまま動かしたい方向にマウス・指を動かしてください。タブレットサイズ (${MIN_TABLET}px) 以上のデバイスからの利用でのみご利用いただける機能です。`
              : `To adjust the width of the recipe and timers/memos sections, or the height of the timers or memos section, place your cursor on the devider between the two sections and drag it to your desired position.
            This feature is available only when using a device larger than tablet size(${MIN_TABLET}px).`}
          </p>
        </div>
        <div className={styles.container__answer} ref={timersRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {mainTimersTitle}
          </p>
          <Image
            src={`/how-to-use/${language}/timers-details.webp`}
            alt={language === "ja" ? "タイマー画像" : "Timers image"}
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.5}
          ></Image>
          <p
            className={styles.p__answer}
            style={{ fontSize: fontSizeFinal, whiteSpace: "wrap" }}
          >
            {language === "ja"
              ? "数字を時間、分、秒と書いてある欄に入力し、開始を押します。最大のセット可能な時間は23時間59分59秒です。タイマーが終了したら、アラーム音が鳴ります 🍳タイマーを一時停止する：一時停止を押す 🍳停止したタイマーを再開する：開始を押す 🍳タイマーのアラームを止める：停止を押す 🍳タイマーをリセットする：リセットを押す 🍳タイマーの名前を変更する：タイマーの一番上にある欄の名前を変更する 🍳タイマーを追加する：+追加ボタンを押す（１０個まで追加可能） 🍳タイマーを消去する：右上のｘボタンを押す"
              : "Enter the numbers in the h (hours), min (minutes), and sec (seconds) fields, then click Start. The maximum allowed time is 23h 59m 59s. When a timer finishes, an alarm will sound. 🍳 To pause a timer : Click Pause 🍳 To restart a timer : Click Start 🍳 To stop the alarm : Click Stop 🍳 To reset a timer : Clic reset 🍳 To change  a timer's title : Edit the name in the top input field 🍳 To add a timer : Click +Add (up to 10 timers at total) 🍳 To delete a  timer : Click the x button in the top right"}
          </p>
        </div>
        <div className={styles.container__answer} ref={memosRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {mainMemosTitle}
          </p>
          <Image
            src={`/how-to-use/${language}/memos.webp`}
            alt={language === "ja" ? "メモ画像" : "Memos image"}
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "なんでも好きなことを入力できます。ここに書かれた内容は、ページをリロードするか、他のページに移動をすると消えてしまいます。"
              : "You can write anything you want here. Your memos will disappear when you reload the page or navigate away."}
          </p>
        </div>
        <div className={styles.container__answer} ref={dropdownRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {mainDropdownTitle}
          </p>
          <Image
            src={`/how-to-use/${language}/dropdown.webp`}
            alt={
              language === "ja"
                ? "ドロップダウンメニュー画像"
                : "Dropdown menu image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "右上にある三本線のボタンを押してください。行きたいページをクリックすればそのページに移動することができます。"
              : "Click the three-line button in the top right. Then select the page you want to go to."}
          </p>
        </div>
        <div className={styles.container__answer} ref={logoutRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
            ref={logoutRef}
          >
            {mainLogoutTitle}
          </p>
          <Image
            src={`/how-to-use/${language}/logout.webp`}
            alt={language === "ja" ? "ログアウト画像" : "Logout image"}
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.6}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "右上にある三本線のボタンを押してください。ログアウトと書かれているところを押し、メッセージの「はい」というボタンを押してログアウトできます。"
              : `Click the three-line button in the top right. Then click the Logout button in the bottom and  "I'm Sure" in the message.`}
          </p>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={recipesRef}
        >
          {recipesTitle}
        </h3>
        <Image
          src={`/how-to-use/${language}/recipes-explanation.webp`}
          alt={
            language === "ja" ? "レシピまとめページ画像" : "Recipes page image"
          }
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <p
          className={styles.p__answer}
          style={{ fontSize: fontSizeFinal, marginTop: "1%" }}
        >
          {language === "ja" ? "レシピまとめページ画像" : "Recipes page image"}
        </p>
        <p
          className={styles.p__answer}
          style={{
            fontSize: fontSizeFinal,
            marginTop: "1%",
            color: "rgb(180, 108, 0)",
            fontWeight: "bold",
          }}
        >
          {language === "ja" ? "レシピページ画像" : "Recipe page image"}
        </p>
        <Image
          src={`/how-to-use/${language}/recipe-noedit-explanation.webp`}
          alt={
            language === "ja"
              ? "はじめから作成されたレシピ画像"
              : "Recipe created from scratch image"
          }
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <p
          className={styles.p__answer}
          style={{ fontSize: `calc(${fontSizeFinal} * 0.9)`, marginTop: "1%" }}
        >
          {language === "ja"
            ? "はじめから作成されたレシピ"
            : "Recipe created from scratch"}
        </p>
        <Image
          src={`/how-to-use/${language}/recipe-link-noedit.webp`}
          alt={
            language === "ja"
              ? "外部リンクから作成されたレシピ画像"
              : "Recipe created from an external link image"
          }
          width={imageSizeNormalWidth}
          height={imageSizeNormalHeight}
        ></Image>
        <p
          className={styles.p__answer}
          style={{ fontSize: `calc(${fontSizeFinal} * 0.9)`, marginTop: "1%" }}
        >
          {language === "ja"
            ? "リンクから作成されたレシピ"
            : "Recipe created from a link"}
        </p>
        <div className={styles.container__answer} ref={recipeLimitRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {recipeLimitTitle}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "はじめから作成されたレシピ・外部リンクから作成されたレシピ合わせて100レシピまで無料で作成いただけます。"
              : "You can create up to 100 recipes for free, including both original recipes and those created from external links."}
          </p>
        </div>
        <div className={styles.container__answer} ref={createRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {createRecipeTitle}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "レシピまとめページの右上にある新規作成ボタンを押し、レシピ作成ページに移動します"
              : `Click the create button in the top right of the Recipes page to go to the recipe creation screen.`}
          </p>
          <Image
            src={`/how-to-use/${language}/create-from.webp`}
            alt={
              language === "ja"
                ? "レシピ作成方法選択画像"
                : "Select the way of recipe creation image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "はじめからというボタンと外部のリンクからというボタンができます。一からオリジナルのレシピを作りたいという場合は「はじめから」、別のサイトからお気に入りのレシピを登録したいという場合は「外部のリンクから」を選択します。"
              : "Two buttons will appear: From Scratch and From an External Link. Select From Scratch when you want to create your own original recipe, and select From an External Link when you want to register your favorite recipe from another website. "}
          </p>
          <Image
            src={`/how-to-use/${language}/create1.webp`}
            alt={
              language === "ja"
                ? "レシピ作成（はじめから）画像１"
                : "Create recipe from scratch image1"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.8}
          ></Image>
          <Image
            src={`/how-to-use/${language}/create2.webp`}
            alt={
              language === "ja"
                ? "レシピ作成（はじめから）画像２"
                : "Create recipe from scratch image2"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.5}
          ></Image>
          <p
            className={styles.p__answer}
            style={{
              fontSize: `calc(${fontSizeFinal} * 0.9)`,
              marginTop: "1%",
            }}
          >
            {language === "ja" ? "はじめから作成する" : "Create from scratch"}
          </p>
          <Image
            src={`/how-to-use/${language}/create-recipe-link.webp`}
            alt={
              language === "ja"
                ? "レシピ外部リンクから作成画像"
                : "Create recipe from an external link image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p
            className={styles.p__answer}
            style={{
              fontSize: `calc(${fontSizeFinal} * 0.9)`,
              marginTop: "1%",
            }}
          >
            {language === "ja"
              ? "外部リンクから作成する"
              : "Create from an external link"}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "その後、フォームを入力しアップロードを押してください。"
              : "Then fill out the form and click Upload."}
          </p>
        </div>
        <div className={styles.container__answer} ref={editRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {editRecipeTitle}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "レシピまとめページで、編集したいレシピをクリックしてください。レシピページに移動します。"
              : "Click the recipe you want to edit on the Recipes page to open its Recipe page."}
          </p>
          <Image
            src={`/how-to-use/${language}/recipe-noedit-explanation.webp`}
            alt={
              language === "ja"
                ? "レシピ画像（編集でない）"
                : "Recipe image (no edit)"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p
            className={styles.p__answer}
            style={{ fontSize: `calc(${fontSizeFinal} * 0.9)` }}
          >
            {language === "ja"
              ? "はじめから作成されたレシピ"
              : "Recipe created from scratch"}
          </p>
          <Image
            src={`/how-to-use/${language}/recipe-link-noedit.webp`}
            alt={
              language === "ja"
                ? "リンクから作成されたレシピ画像（編集でない）"
                : "Recipe created from an external link image (no edit)"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p
            className={styles.p__answer}
            style={{ fontSize: `calc(${fontSizeFinal} * 0.9)` }}
          >
            {language === "ja"
              ? "リンクから作成されたレシピ"
              : "Recipe created from a link"}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "右上にある編集と書いてあるボタンを押してください。"
              : "Click Edit in the top right."}
          </p>
          <Image
            src={`/how-to-use/${language}/recipe-edit.webp`}
            alt={
              language === "ja"
                ? "はじめから作成されたレシピ画像（編集）"
                : "Recipe created from scratch image (edit)"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.7}
          ></Image>
          <p
            className={styles.p__answer}
            style={{ fontSize: `calc(${fontSizeFinal} * 0.9)` }}
          >
            {language === "ja"
              ? "はじめから作成されたレシピ（編集）"
              : "Recipe created from scratch (edit)"}
          </p>
          <Image
            src={`/how-to-use/${language}/recipe-link-edit.webp`}
            alt={
              language === "ja"
                ? "リンクから作成されたレシピ画像（編集）"
                : "Recipe created from an external link image (edit)"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p
            className={styles.p__answer}
            style={{ fontSize: `calc(${fontSizeFinal} * 0.9)` }}
          >
            {language === "ja"
              ? "リンクから作成されたレシピ（編集）"
              : "Recipe created from a link (edit)"}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "フォームにある内容を変更して、アップロードボタンを押してください。"
              : "Edit the form content, then click Upload."}
          </p>
        </div>
        <div className={styles.container__answer} ref={deleteRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {deleteRecipeTitle}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "レシピまとめページのレシピを選択と書いてあるボタンを押します。"
              : "Click the Select Recipe button on the Recipes page."}
          </p>
          <Image
            src={`/how-to-use/${language}/recipes-select.webp`}
            alt={language === "ja" ? "レシピ選択画像" : "Select recipe image"}
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "削除したいレシピの横にあるチェックボックスをチェックしてください。ページをまたいでの選択はできません。ゴミ箱のボタンを押しレシピを削除してください。削除をせずにレシピ選択をやめたい場合は、選択を終了ボタンを押してください。"
              : "Click the checkboxes next to the recipes you want to delete. (You cannot select recipes across multiple pages.) Then click the trash can icon to delete them. If you want to stop selecting recipes without deleting them, click the Stop Selecting button."}
          </p>
        </div>
        <div className={styles.container__answer} ref={shareRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {shareRecipeTitle}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "レシピまとめページでシェアしたいレシピをクリックします。レシピページに移動します。リンクをコピーしてシェアしてください。"
              : "Click the recipe you want to share on the Recipes page to open its Recipe page. Then copy the link and share it with anyone."}
          </p>
        </div>
        <div className={styles.container__answer} ref={cannotViewRecipeLinkRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {cannotViewRecipeLinkTitle}
          </p>
          <Image
            src={`/how-to-use/${language}/recipe-link-refuse.webp`}
            alt={
              language === "ja"
                ? "外部リンクから作成されたレシピ見えない画像"
                : "Cannot view recipe created from an external link image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "登録されたリンクのウェブサイトのセキュリティの問題により、そのサイトのレシピを表示できない場合があります。その場合は、そのレシピの一番下に添付してあるリンクから直接そのサイトにアクセスしてください。"
              : "For security reasons, the website linked in the recipe may not allow its page to be displayed. If the page doesn't appear, please click the link in the bottom of the recipe page to visit the website directly."}
          </p>
        </div>
        <div className={styles.container__answer} ref={moreAboutRecipeRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {moreAboutRecipeTitle}
          </p>
          <Image
            src={`/how-to-use/${language}/brief-explanation-details.webp`}
            alt={
              language === "ja"
                ? "レシピ分量、単位システム、温度単位の変更画像"
                : "Change servings, unit systems, and temperature units image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.6}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "レシピの分量を変更したり、どの単位システムを使用したいかを選んだり、温度の単位を変換することができます。このサイトが瞬時に計算をして、変換された材料や温度を画面に表示します。"
              : "You can adjust the number of servings, choose your preferred unit system, and switch temperature units. This website will instantly calculate and display the converted ingredient amounts and temperatures."}
          </p>
          <Image
            src={`/how-to-use/${language}/recipe-ing.webp`}
            alt={
              language === "ja"
                ? "レシピ材料チェックリスト画像"
                : "Recipe ingredients checkbox image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 0.9}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "どの材料を追加したのか忘れないように、各材料にチェックを入れていくことができます。"
              : "You can check off each ingredient so you won't forget which ones you've already added."}
          </p>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={converterRef}
        >
          {converterTitle}
        </h3>
        <Image
          src={`/how-to-use/${language}/converter.webp`}
          alt={
            language === "ja" ? "単位変換ページ画像" : "Converter page image"
          }
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
            {converterDetailsTitle}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "グラムやオンス等の材料の単位、温度の単位（℉、 ℃）、センチやインチ等の長さの単位を変換できます。"
              : "You can convert ingredient units (e.g., grams, oz), temperature units (℉/℃), and length units (e.g., cm, inches)."}
          </p>
          <Image
            src={`/how-to-use/${language}/converter-ing.webp`}
            alt={
              language === "ja"
                ? "材料単位の変換画像"
                : "Convert ingredient units image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 0.8}
          ></Image>
          <Image
            src={`/how-to-use/${language}/converter-others.webp`}
            alt={
              language === "ja"
                ? "温度と長さ単位の変換画像"
                : "Convert temperature and length units image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 0.85}
          ></Image>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={feedbackRef}
        >
          {feedbackTitle}
        </h3>
        <Image
          src={`/how-to-use/${language}/feedback.webp`}
          alt={
            language === "ja"
              ? "フィードバックページ画像"
              : "Feedback page image"
          }
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
            {feedbackDetailsTitle}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "このウェブサイトに対するご意見・ご感想を送ることができます。このサイトについてどう思うのか、またバグを見つけた際にフィードバックを送っていただけると非常に助かります！"
              : "You can send feedback about the website! I'd appreciete any thoughts you have or any bugs you encounter!"}
          </p>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={newsRef}
        >
          {newsTitle}
        </h3>
        <Image
          src={`/how-to-use/${language}/news.webp`}
          alt={language === "ja" ? "ニュースページ画像" : "News page image"}
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
            {newsDetailsTitle}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "このウェブサイトの新しい情報をチェックすることができます。新機能の紹介や、バグの情報などを掲載していきます。"
              : "You can check updates about the website, such as new features or bug information."}
          </p>
        </div>
        <h3
          className={styles.small_header}
          style={{ fontSize: `calc(${fontHeaderSize} * 1.1)` }}
          ref={accountRef}
        >
          {accountTitle}
        </h3>
        <Image
          src={`/how-to-use/${language}/account.webp`}
          alt={
            language === "ja" ? "アカウントページ画像" : "Account page image"
          }
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
            {checkAccountTitle}
          </p>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "アカウント情報はアカウントページから確認できます。セキュリティー上の問題から、パスワードの確認はできません。"
              : "You can view your account information on the Account page. For security reasons, your password cannot be displayed."}
          </p>
        </div>
        <div className={styles.container__answer} ref={changeAccountRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {changeAccountTitle}
          </p>
          <Image
            src={`/how-to-use/${language}/email.webp`}
            alt={
              language === "ja"
                ? "メールアドレス変更画像"
                : "Change email image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.1}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "アカウントページで、メールアドレス欄に新しいメールアドレスを入力し、更新を押してください。"
              : "Enter new email in the input field and click Submit on the Account page."}
          </p>
          <Image
            src={`/how-to-use/${language}/password.webp`}
            alt={
              language === "ja" ? "パスワード変更画像" : "Change password image"
            }
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.1}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "アカウントページで、現在のパスワードと新しいパスワードをそれぞれの欄に入力し、変更を押してください。"
              : "Enter your current password and your new password in the input fields, the click Change on the Account page."}
          </p>
        </div>
        <div className={styles.container__answer} ref={closeAccountRef}>
          <p
            className={styles.p__question}
            style={{
              fontSize: fontHeaderSize,
            }}
          >
            {closeAccountTitle}
          </p>
          <Image
            src={`/how-to-use/${language}/close-account.webp`}
            alt={language === "ja" ? "退会手続き画像" : "Close account image"}
            width={imageSizeNormalWidth}
            height={imageSizeNormalHeight * 1.1}
          ></Image>
          <p className={styles.p__answer} style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "アカウントページで一番下の退会ボタンを押し、注意書きの下にある「はい」と書いてあるボタンを押して退会できます。"
              : `Close your account by clicking Close and then "I'm Sure" under the disclaimer on the Account page.`}
          </p>
        </div>
      </div>
    </div>
  );
}
