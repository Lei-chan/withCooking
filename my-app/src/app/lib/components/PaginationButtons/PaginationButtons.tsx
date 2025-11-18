//css
import styles from "./paginationButtons.module.css";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "../../config/type";

export default function PaginationButtons({
  language,
  mediaContext,
  fontSize,
  height,
  curPage,
  numberOfPages,
  isPending,
  onClickPagination,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  height: string;
  curPage: number;
  numberOfPages: number;
  isPending: boolean;
  onClickPagination: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const fontSizePagination =
    mediaContext === "mobile"
      ? `calc(${fontSize} * 0.9)`
      : mediaContext === "tablet"
      ? `calc(${fontSize} * 0.8)`
      : `calc(${fontSize} * 0.7)`;
  const padding =
    mediaContext === "mobile"
      ? "1% 2%"
      : mediaContext === "tablet"
      ? "0.2% 1.2%"
      : mediaContext === "desktop"
      ? "1%"
      : "0.8%";

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height,
      }}
    >
      {!isPending && curPage > 1 && (
        <button
          className={styles.btn__pagination}
          style={{ left: "2%", fontSize: fontSizePagination, padding }}
          value="decrease"
          onClick={onClickPagination}
        >
          {mediaContext === "mobile"
            ? `${curPage - 1}`
            : `${language === "ja" ? "ページ" : "Page"} ${curPage - 1}`}
          <br />
          &larr;
        </button>
      )}
      {!isPending && numberOfPages > curPage && (
        <button
          className={styles.btn__pagination}
          style={{ right: "2%", fontSize: fontSizePagination, padding }}
          value="increase"
          onClick={onClickPagination}
        >
          {mediaContext === "mobile"
            ? `${curPage + 1}`
            : `${language === "ja" ? "ページ" : "Page"} ${curPage + 1}`}
          <br />
          &rarr;
        </button>
      )}
    </div>
  );
}
