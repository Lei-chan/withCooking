//next.js
import Link from "next/link";
//component
import { ButtonEditMain } from "../recipeCommon/recipeCommon";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA, TYPE_RECIPE_LINK } from "../../config/type";
//general method
import { getSize } from "../../helpers/other";

export default function RecipeLinkNoEdit({
  language,
  mediaContext,
  recipeWidth,
  recipeHeight,
  recipe,
  mainOrRecipe,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  recipeWidth: number;
  recipeHeight: number;
  recipe: TYPE_RECIPE_LINK;
  mainOrRecipe: "main" | "recipe";
}) {
  //design
  const fontSizeEn =
    mediaContext === "mobile"
      ? getSize(recipeWidth + "px", 0.046, "4.5vw")
      : mediaContext === "tablet"
      ? getSize(recipeWidth + "px", 0.036, "2.7vw")
      : mediaContext === "desktop" && window.innerWidth <= 1100
      ? getSize(recipeWidth + "px", 0.032, "1.5vw")
      : getSize(recipeWidth + "px", 0.03, "1.3vw");
  const fontSizeFinal =
    language === "ja" ? `calc(${fontSizeEn} * 0.9)` : fontSizeEn;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2%",
      }}
    >
      {mainOrRecipe === "main" && (
        <ButtonEditMain
          mediaContext={mediaContext}
          language={language}
          fontSize={fontSizeFinal}
        />
      )}
      <iframe
        title="external recipe link"
        width={recipeWidth}
        height={recipeHeight}
        src={recipe.link}
        loading="lazy"
      ></iframe>
      <p style={{ width: recipeWidth, marginTop: "2%" }}>
        {language === "ja"
          ? "登録されたレシピリンクのウェブサイトのセキュリティの問題により、ここにそのサイトを表示できない場合があります。その場合は、こちらのリンクから直接そのサイトにアクセスしてください。"
          : "For security reasons, the website linked in the recipe may not allow its page to be displayed here. If the page doesn't appear, please click this link to visit the website directly."}
      </p>
      <Link href={recipe.link}>
        {language === "ja"
          ? `${recipe.title}のリンク`
          : `Link of ${recipe.title}`}
      </Link>
    </div>
  );
}
