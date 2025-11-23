//css
import styles from "./searchBar.module.css";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "../../config/type";

export default function SearchBar({
  language,
  mediaContext,
  fontSize,
  width,
  height,
  borderRadius,
  boxShadow,
  inputWidth,
  handleSetKeyword,
  handleSetCurPage,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  width: string;
  height: string;
  borderRadius: string;
  boxShadow: string;
  inputWidth: string;
  handleSetKeyword: (keyword: string) => void;
  handleSetCurPage: (page: number) => void;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const keywordData = new FormData(e.currentTarget).get("keyword");
    if (!keywordData && keywordData !== "") return;

    const structuredKeyword = String(keywordData).trim().toLowerCase();

    handleSetKeyword(structuredKeyword);
    handleSetCurPage(1);
  }

  return (
    <form
      className={styles.container__search}
      style={{ width, height, borderRadius, boxShadow }}
      onSubmit={handleSubmit}
    >
      <input
        style={{
          textAlign: "center",
          borderColor: "rgb(255, 166, 0, 0.671)",
          height: "55%",
          letterSpacing: "0.05vw",
          wordSpacing: "0.2vw",
          fontSize: `calc(${fontSize} * 0.9)`,
          borderRadius: mediaContext === "mobile" ? "3px" : "5px",
          width: inputWidth,
        }}
        name="keyword"
        type="search"
        placeholder={language === "ja" ? "レシピを検索" : "Search your recipe"}
      ></input>
      <button
        style={{
          height: "fit-content",
          borderRadius: "39% / 50%",
          padding: language === "ja" ? "3px 6px" : "3px 4px",
          border: "none",
          backgroundColor: "rgb(255, 231, 126)",
          color: "black",
          letterSpacing: "0.05vw",
          fontSize: `calc(${fontSize} * 0.8)`,
        }}
        type="submit"
      >
        {language === "ja" ? "検索" : "Search"}
      </button>
    </form>
  );
}
