//next.js
import Image from "next/image";
//css
import styles from "./recipePreview.module.css";
//type
import {
  TYPE_LANGUAGE,
  TYPE_MEDIA,
  TYPE_USER_RECIPE,
  TYPE_USER_RECIPE_LINK,
} from "../../config/type";

export default function RecipePreview({
  language,
  mediaContext,
  recipe,
  width,
  height,
  imageSize,
  fontSize,
  borderRadius,
  borderBottom,
  onClickPreview,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  recipe: TYPE_USER_RECIPE | TYPE_USER_RECIPE_LINK;
  width: string;
  height: string;
  imageSize: number;
  fontSize: string;
  borderRadius: string;
  borderBottom: string;
  onClickPreview: (recipe: TYPE_USER_RECIPE | TYPE_USER_RECIPE_LINK) => void;
}) {
  return (
    <li
      className={styles.recipe_preview}
      style={{ width, height, borderRadius, borderBottom }}
      onClick={() => onClickPreview(recipe)}
    >
      {"mainImagePreview" in recipe && recipe.mainImagePreview?.data ? (
        <Image
          style={{ borderRadius: "50%", maxHeight: "95%" }}
          src={recipe.mainImagePreview.data}
          alt={language === "ja" ? "メイン画像" : "main image"}
          width={imageSize}
          height={imageSize}
        ></Image>
      ) : (
        <div
          style={{
            width: `${imageSize}px`,
            height: `${imageSize}px`,
            borderRadius: "50%",
            backgroundColor: "grey",
            opacity: "link" in recipe ? "0" : "1",
          }}
        ></div>
      )}
      <p
        style={{
          fontSize:
            mediaContext === "mobile" ? `calc(${fontSize} * 1.1)` : fontSize,
          width: "59%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {recipe.title}
      </p>
      {recipe.favorite && (
        <Image
          src="/icons/star-on.png"
          alt={language === "ja" ? "アイコンお気に入り" : "favorite icon"}
          width={imageSize * 0.3}
          height={imageSize * 0.3}
        ></Image>
      )}
    </li>
  );
}
