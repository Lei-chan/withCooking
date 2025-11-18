//react
import clsx from "clsx";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "../../config/type";

export default function PaginationButtons({
  language,
  mediaContext,
  fontSize,
  styles,
  curPage,
  numberOfPages,
  isPending,
  onClickPagination,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  styles: { readonly [key: string]: string };
  curPage: number;
  numberOfPages: number;
  isPending: boolean;
  onClickPagination: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const fontSizePagination =
    mediaContext === "mobile"
      ? fontSize
      : mediaContext === "tablet"
      ? `calc(${fontSize} * 0.9)`
      : `calc(${fontSize} * 0.8)`;
  const padding =
    mediaContext === "mobile"
      ? "1% 2%"
      : mediaContext === "tablet"
      ? "0.2% 1.2%"
      : mediaContext === "desktop"
      ? "1%"
      : "0.8%";

  return (
    <div className={styles.container__pagination}>
      {!isPending && curPage > 1 && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_left)}
          style={{ fontSize: fontSizePagination, padding }}
          value="decrease"
          onClick={onClickPagination}
        >
          {mediaContext === "mobile" || mediaContext === "tablet"
            ? `${curPage - 1}`
            : `${language === "ja" ? "ページ" : "Page"} ${curPage - 1}`}
          <br />
          &larr;
        </button>
      )}
      {!isPending && numberOfPages > curPage && (
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_right)}
          style={{ fontSize: fontSizePagination, padding }}
          value="increase"
          onClick={onClickPagination}
        >
          {mediaContext === "mobile" || mediaContext === "tablet"
            ? `${curPage + 1}`
            : `${language === "ja" ? "ページ" : "Page"} ${curPage + 1}`}
          <br />
          &rarr;
        </button>
      )}
    </div>
  );
}
