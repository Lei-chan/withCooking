"use client";
//react
import { useContext, useState } from "react";
//next.js
import { useRouter } from "next/navigation";
//context
import { UserContext } from "../../providers";
//css
import styles from "./recipeLinkEdit.module.css";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA, TYPE_RECIPE_LINK } from "../../config/type";
import {
  authErrorRedirect,
  generateErrorMessage,
  getFontSizeForLanguage,
  isApiError,
  logNonApiError,
} from "../../helpers/other";
import { uploadRecipeCreate, uploadRecipeUpdate } from "../../helpers/recipes";

export default function RecipeLinkEdit({
  language,
  mediaContext,
  recipe,
  createOrEdit,
  handleChangeEdit,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  recipe: TYPE_RECIPE_LINK;
  createOrEdit: "create" | "edit";
  handleChangeEdit?: () => void;
}) {
  const router = useRouter();
  const userContext = useContext(UserContext);

  //design
  const fontSizeEn =
    mediaContext === "mobile"
      ? "4.7vw"
      : mediaContext === "tablet"
      ? "2.7vw"
      : mediaContext === "desktop"
      ? "1.5vw"
      : "1.3vw";
  const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);
  const smallHeaderSize = `calc(${fontSizeFinal} * 1.2)`;
  const linkNameInputStyle = {
    fontSize: fontSizeFinal,
    marginBottom: smallHeaderSize,
    width: "70%",
    padding: "2px 5px",
    letterSpacing: language !== "ja" ? "0.5px" : "0",
  };

  const [link, setLink] = useState(recipe.link);
  const [title, setTitle] = useState(recipe.title);
  const [favorite, setFavorite] = useState(recipe.favorite);
  const [comments, setComments] = useState(recipe.comments || "");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.currentTarget;

    if (target.name === "title") setTitle(target.value);
    if (target.name === "link") setLink(target.value);
    if (target.name === "favorite") setFavorite(target.checked);
  }

  function handleChangeTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setComments(e.currentTarget.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    let recipeData;
    try {
      e.preventDefault();

      setError("");
      setIsPending(true);

      const formData = new FormData(e.currentTarget);

      const link = String(formData.get("link")).trim();
      const title = String(formData.get("title")).trim();
      const favorite = formData.get("favorite");

      //validate link
      const isValidLink = URL.canParse(link);

      if (!isValidLink)
        return setError(
          language === "ja"
            ? "有効なリンクを入力して下さい"
            : "Please enter valid link"
        );

      if (!title)
        return setError(
          language === "ja"
            ? "レシピの名前を入力してください"
            : "Please enter the recipe name"
        );

      const newRecipeFromLink = {
        _id: recipe._id || undefined,
        title,
        link,
        favorite: favorite === "on" ? true : false,
        comments,
        createdAt:
          createOrEdit === "create"
            ? new Date().toISOString()
            : recipe.createdAt,
        updatedAt: new Date().toISOString(),
      };

      //send recipe
      recipeData =
        createOrEdit === "create"
          ? await uploadRecipeCreate(newRecipeFromLink, userContext)
          : await uploadRecipeUpdate(newRecipeFromLink, userContext);

      setIsPending(false);
      setMessage(
        language === "ja"
          ? `レシピが${createOrEdit === "create" ? "作成" : "更新"}されました！`
          : `Recipe ${
              createOrEdit === "create" ? "created" : "updated"
            } successfully!`
      );
      createOrEdit === "edit" && handleChangeEdit && handleChangeEdit();

      createOrEdit === "create" && router.push(`/recipes/${recipeData._id}`);
    } catch (err: unknown) {
      setIsPending(false);

      if (!isApiError(err))
        return logNonApiError(
          err,
          `Error while ${
            createOrEdit === "create" ? "creating" : "updating"
          } recipe`
        );

      console.error(
        `Error while ${
          createOrEdit === "create" ? "creating" : "updating"
        } recipe`,
        err.message,
        err.statusCode || 500
      );

      const errorMessage = generateErrorMessage(language, err, "recipe");

      setError(
        errorMessage ||
          (language === "ja"
            ? `レシピの${
                createOrEdit === "create" ? "作成" : "更新"
              }中にサーバーエラーが発生しました🙇‍♂️もう一度お試し下さい`
            : `Server error while ${
                createOrEdit === "create" ? "creating" : "updating"
              } recipe 🙇‍♂️ Please try again`)
      );

      await authErrorRedirect(router, err.statusCode);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100dvh",
        maxHeight: "100%",
        padding: "10% 0",
        overflowY: "scroll",
      }}
    >
      {(error || message || isPending) && (
        <p
          style={{
            fontSize: `calc(${fontSizeFinal} * 1.1)`,
            backgroundColor: error
              ? "orangered"
              : message
              ? "rgba(10, 231, 39, 1)"
              : "rgba(109, 221, 127, 1)",
            color: "white",
            borderRadius: "5px",
            padding: "1% 2%",
            width:
              mediaContext === "mobile"
                ? "90%"
                : mediaContext === "tablet"
                ? "70%"
                : mediaContext === "desktop"
                ? "50%"
                : "40%",
            marginBottom:
              mediaContext === "mobile"
                ? "3%"
                : mediaContext === "tablet"
                ? "2%"
                : "1%",
          }}
        >
          {error ||
            message ||
            (language === "ja" ? "レシピを作成中…" : "Creating recipe...")}
        </p>
      )}
      <form
        style={{
          width:
            mediaContext === "mobile"
              ? "90%"
              : mediaContext === "tablet"
              ? "65%"
              : mediaContext === "desktop"
              ? "45%"
              : "35%",
          height: "fit-content",
          backgroundColor: "rgba(250, 255, 207, 1)",
          borderRadius: "5px",
          boxShadow: "rgba(0, 0, 0, 0.29) 3px 3px 10px",
          padding:
            mediaContext === "mobile" || mediaContext === "tablet"
              ? "5% 2%"
              : "3% 2%",
          letterSpacing: language !== "ja" ? "1px" : "0",
        }}
        onSubmit={handleSubmit}
      >
        <div>
          <h5
            style={{
              fontSize: smallHeaderSize,
              marginBottom: fontSizeFinal,
            }}
          >
            {language === "ja"
              ? "レシピのリンクを入力してください"
              : "Enter recipe link"}
          </h5>
          <input
            style={linkNameInputStyle}
            type="url"
            name="link"
            placeholder={language === "ja" ? "レシピのリンク" : "recipe link"}
            required
            value={link}
            onChange={handleChangeInput}
          ></input>
        </div>
        <div>
          <h5
            style={{
              fontSize: smallHeaderSize,
              marginBottom: fontSizeFinal,
            }}
          >
            {language === "ja"
              ? "レシピの名前を入力してください"
              : "Enter recipe name"}
          </h5>
          <input
            style={linkNameInputStyle}
            name="title"
            placeholder={language === "ja" ? "レシピの名前" : "recipe title"}
            required
            value={title}
            onChange={handleChangeInput}
          ></input>
        </div>
        <div>
          <h5
            style={{
              fontSize: smallHeaderSize,
              marginBottom: fontSizeFinal,
            }}
          >
            {language === "ja" ? "コメント" : "Comments"}
          </h5>
          <textarea
            style={{
              fontSize: fontSizeFinal,
              marginBottom: smallHeaderSize,
              width: "70%",
              aspectRatio: "1/0.5",
              padding: "3px 5px",
              resize: "none",
            }}
            placeholder={
              language === "ja"
                ? "例）レシピの変更点など"
                : "ex) the parts of the recipe you always change"
            }
            value={comments}
            onChange={handleChangeTextarea}
          ></textarea>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: smallHeaderSize,
            height: "fit-content",
            gap: "2%",
          }}
        >
          <span style={{ fontSize: fontSizeFinal }}>
            {language === "ja"
              ? "お気に入りとして登録する"
              : "Save this recipe as favorite"}
          </span>
          <input
            style={{ width: smallHeaderSize, height: smallHeaderSize }}
            type="checkbox"
            name="favorite"
            checked={favorite}
            onChange={handleChangeInput}
          ></input>
        </div>
        <button
          className={styles.btn__upload_recipe_link}
          style={{
            fontSize: fontSizeFinal,
            letterSpacing: language !== "ja" ? "1px" : "0",
          }}
          type="submit"
        >
          {language === "ja" ? "アップロード" : "Upload"}
        </button>
      </form>
    </div>
  );
}
