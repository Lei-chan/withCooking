"use client";
//react
import { useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Resizer from "react-image-file-resizer";
//next.js
import Image from "next/image";
import { useRouter } from "next/navigation";
//context
import { UserContext } from "../../providers";
//css
import styles from "./recipeEdit.module.css";
//components
import {
  BtnFavorite,
  ErrorMessageRecipe,
  Loading,
  LoadingRecipe,
} from "../recipeCommon/recipeCommon";
//type
import {
  MyError,
  TYPE_FILE,
  TYPE_INGREDIENT,
  TYPE_INGREDIENT_UNIT,
  TYPE_INGREDIENTS,
  TYPE_INSTRUCTION,
  TYPE_LANGUAGE,
  TYPE_MEDIA,
  TYPE_RECIPE,
  TYPE_REGION_UNIT,
  TYPE_SERVINGS_UNIT,
} from "../../config/type";
//settings
import { MAX_SERVINGS, NUMBER_OF_TEMPERATURES } from "../../config/settings";
//methods for recipe
import {
  calcTransitionXSlider,
  getImageFileData,
  getIngGridTemplateColumnsStyle,
  isRecipeAllowed,
  uploadRecipeCreate,
  uploadRecipeUpdate,
} from "../../helpers/recipes";
//method for convertion
import { convertIngUnits } from "../../helpers/converter";
//general methods
import {
  authErrorRedirect,
  generateErrorMessage,
  getSize,
  isApiError,
  logNonApiError,
  wait,
} from "../../helpers/other";
//library
import { nanoid } from "nanoid";

export default function RecipeEdit({
  language,
  mediaContext,
  recipe,
  error,
  createOrUpdate,
  handleChangeEdit = undefined,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  recipe: TYPE_RECIPE;
  error: string;
  createOrUpdate: "create" | "update";
  handleChangeEdit?: (editOrNot: boolean) => void | undefined;
}) {
  const router = useRouter();
  const userContext = useContext(UserContext);

  //design
  const [windowWidth, setWindowWidth] = useState<null | number>(null);
  const [recipeWidth, setRecipeWidth] = useState<null | string>(null);
  const [fontSizeFinal, setFontSizeFinal] = useState("1.5vw");
  const [headerSize, setHeaderSize] = useState(
    parseFloat(fontSizeFinal) * 1.1 + "px"
  );
  const [marginTop, setMarginTop] = useState("30px");

  useEffect(() => {
    const handleResize = () =>
      setWindowWidth(document.documentElement.clientWidth);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!windowWidth) return;

    const recipeWid =
      windowWidth *
        (mediaContext === "mobile"
          ? 0.9
          : mediaContext === "tablet"
          ? 0.7
          : 0.5) +
      "px";
    setRecipeWidth(recipeWid);

    const fontSizeEn =
      mediaContext === "mobile"
        ? getSize(recipeWid, 0.045, "4.5vw")
        : mediaContext === "tablet"
        ? getSize(recipeWid, 0.034, "2.7vw")
        : mediaContext === "desktop" && windowWidth <= 1100
        ? getSize(recipeWid, 0.031, "1.5vw")
        : getSize(recipeWid, 0.028, "1.3vw");

    const fontSizeFin =
      language === "ja" ? parseFloat(fontSizeEn) * 0.9 + "px" : fontSizeEn;
    setFontSizeFinal(fontSizeFin);

    setHeaderSize(parseFloat(fontSizeFin) * 1.1 + "px");

    setMarginTop(getSize(recipeWid, 0.11, "30px"));
  }, [mediaContext, language, windowWidth]);

  //recipe
  //set favorite and images when user change them and set other fields when user submits the recipe
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE>(recipe);

  useEffect(() => {
    setCurRecipe(recipe);
  }, [recipe]);

  //message
  const [isPending, setIsPending] = useState(false);
  const [curError, setCurError] = useState(error);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCurError(error);
  }, [error]);

  function displayError(errorMessage: string) {
    setCurError(errorMessage);
  }

  function handleChangeMainImage(
    mainImageFile: TYPE_FILE,
    mainImagePreviewFile: TYPE_FILE
  ) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.mainImage = mainImageFile;
      newRecipe.mainImagePreview = mainImagePreviewFile;
      return newRecipe;
    });
  }

  function handleDeleteMainImage() {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.mainImage = newRecipe.mainImagePreview = undefined;
      return newRecipe;
    });
  }

  function handleAddInstrucion() {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.instructions = [
        ...prev.instructions,
        { instruction: "", image: undefined },
      ];
      return newRecipe;
    });
  }

  function handleDeleteInstruciton(index: number) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.instructions = prev.instructions.toSpliced(index, 1);
      return newRecipe;
    });
  }

  function handleChangeInstruction(value: string, i: number) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.instructions[i].instruction = value;
      return newRecipe;
    });
  }

  function handleDeleteInstructionImage(index: number) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.instructions[index].image = undefined;
      return newRecipe;
    });
  }

  function handleChangeInstructionImage(file: TYPE_FILE, index: number) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.instructions[index].image = file;
      return newRecipe;
    });
  }

  function handleChangeMemoryImages(filesArr: TYPE_FILE[]) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.memoryImages = [...prev.memoryImages, ...filesArr];
      return newRecipe;
    });
  }

  function handleDeleteMemoryImage(index: number) {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.memoryImages = prev.memoryImages.toSpliced(index, 1);
      return newRecipe;
    });
  }

  function handleClickFavorite() {
    setCurRecipe((prev) => {
      const newRecipe = { ...prev };
      newRecipe.favorite = !prev.favorite;
      return newRecipe;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let recipeData;
    try {
      setIsPending(true);
      setCurError("");

      const formData = new FormData(e.currentTarget);
      const dataArr = [...formData];

      //filter out temp with no input
      const tempArr = [
        formData.get("temperature1"),
        formData.get("temperature2"),
        formData.get("temperature3"),
        formData.get("temperature4"),
      ]
        .filter((temp) => temp)
        .map((temp) => parseFloat(String(temp)));

      ///ingredients
      const numberOfIngredients = dataArr.filter(
        (arr) => arr[0].includes("ingredient") && arr[0].includes("Name")
      ).length;

      //filter out ing line with no ingredine and amount
      const ingredients = new Array(numberOfIngredients)
        .fill("")
        .map((_, i) => {
          const ingredient = String(
            formData.get(`ingredient${i + 1}Name`)
          )?.trim();

          const amount = +(formData.get(`ingredient${i + 1}Amount`) || 0);

          const unitData = formData.get(
            `ingredient${i + 1}Unit`
          ) as TYPE_INGREDIENT_UNIT;
          const customUnitData = String(
            formData.get(`ingredient${i + 1}CustomUnit`)
          )?.trim();

          const unit = unitData !== "other" ? unitData : customUnitData;

          return {
            id: undefined,
            ingredient,
            amount,
            unit,
            convertion: convertIngUnits(amount, unit),
          };
        })
        .filter((ing) => ing.ingredient || ing.amount);

      //filter out instruction with no instruction and image
      const instructions = curRecipe?.instructions.filter(
        (inst) => inst.instruction || inst.image
      );

      const newRecipe = {
        _id: curRecipe._id || undefined,
        favorite: curRecipe.favorite,
        mainImage: curRecipe.mainImage,
        mainImagePreview: curRecipe.mainImagePreview,
        title: String(formData.get("title"))?.trim() || "",
        author: String(formData.get("author")).trim() || "",
        servings: {
          servings: +(formData.get("servings") || 0),
          unit: String(formData.get("servingsUnit")),
          customUnit: String(formData.get("servingsCustomUnit") || "").trim(),
        },
        temperatures: {
          temperatures: tempArr,
          unit:
            formData.get("temperatureUnit") === "℉" ? "℉" : ("℃" as "℉" | "℃"),
        },
        ingredients,
        preparation: String(formData.get("preparation")).trim(),
        instructions,
        description: String(formData.get("description")).trim(),
        memoryImages: curRecipe.memoryImages,
        comments: String(formData.get("comments")).trim(),
        createdAt:
          createOrUpdate === "create"
            ? new Date().toISOString()
            : curRecipe.createdAt,
        updatedAt: new Date().toISOString(),
      };

      //store data before in case it disappears when error happens
      setCurRecipe(newRecipe);

      if (!isRecipeAllowed(newRecipe)) {
        const err = new Error(
          language === "ja"
            ? "一つ以上の欄を入力してください"
            : "Please fill more than one input field"
        ) as MyError;
        err.statusCode = 400;
        throw err;
      }

      recipeData =
        createOrUpdate === "create"
          ? await uploadRecipeCreate(newRecipe, userContext)
          : await uploadRecipeUpdate(newRecipe, userContext);

      setIsPending(false);
      handleChangeEdit && handleChangeEdit(false);
      setMessage(
        language === "ja"
          ? `レシピの${
              createOrUpdate === "create" ? "作成" : "更新"
            }が完了しました！`
          : `Recipe ${
              createOrUpdate === "create" ? "created" : "updated"
            } successfully :)`
      );
      if (createOrUpdate === "update") {
        await wait();
        setMessage("");
      }

      if (createOrUpdate === "create")
        router.push(`/recipes/${recipeData._id}`);
    } catch (err: unknown) {
      setIsPending(false);

      if (!isApiError(err))
        return logNonApiError(err, "Error while creating recipe");

      console.error(
        "Error while creating recipe",
        err.message,
        err.statusCode || 500
      );

      const errorMessage = generateErrorMessage(language, err, "recipe");

      setCurError(
        errorMessage ||
          (language === "ja"
            ? "レシピ作成中にサーバーエラーが発生しました🙇‍♂️ もう一度お試しください"
            : "Server error while creating recipe 🙇‍♂️ Please try again")
      );

      await authErrorRedirect(router, err.statusCode);
    }
  }

  return !isPending ? (
    <>
      {(curError || message) && (
        <ErrorMessageRecipe
          mediaContext={mediaContext}
          fontSize={fontSizeFinal}
          error={curError}
          message={message}
          mainOrRecipe="recipe"
        />
      )}

      {!curRecipe || !windowWidth || !recipeWidth ? (
        <LoadingRecipe mediaContext={mediaContext} />
      ) : (
        <form
          style={{
            position: "relative",
            textAlign: "center",
            backgroundImage:
              "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
            width: recipeWidth,
            height: "fit-content",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: mediaContext === "mobile" ? "6% 0" : "3% 0",
            color: "rgb(60, 0, 116)",
            boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
            borderRadius: mediaContext === "mobile" ? "5px" : "10px",
            margin:
              mediaContext === "mobile" || mediaContext === "tablet"
                ? "4% 0"
                : "2% 0",
          }}
          onSubmit={handleSubmit}
        >
          <ImageTitleEdit
            mediaContext={mediaContext}
            language={language}
            recipeWidth={recipeWidth}
            fontSize={fontSizeFinal}
            curTitle={curRecipe.title}
            curImage={curRecipe.mainImage}
            onChangeImage={handleChangeMainImage}
            deleteImage={handleDeleteMainImage}
            displayError={displayError}
          />
          <BriefExplanationEdit
            mediaContext={mediaContext}
            language={language}
            recipeWidth={recipeWidth}
            fontSize={fontSizeFinal}
            curRecipe={curRecipe}
            onClickFavorite={handleClickFavorite}
          />
          <IngredientsEdit
            mediaContext={mediaContext}
            language={language}
            fontSize={fontSizeFinal}
            headerSize={headerSize}
            ingredients={curRecipe.ingredients}
            regionUnit="original"
          />
          <InstructionsEdit
            mediaContext={mediaContext}
            language={language}
            recipeWidth={recipeWidth}
            fontSize={fontSizeFinal}
            headerSize={headerSize}
            marginTop={marginTop}
            preparation={curRecipe.preparation}
            instructions={curRecipe.instructions}
            addInstruction={handleAddInstrucion}
            deleteInstruction={handleDeleteInstruciton}
            onChangeInstruction={handleChangeInstruction}
            deleteImage={handleDeleteInstructionImage}
            onChangeImage={handleChangeInstructionImage}
            displayError={displayError}
          />
          <AboutThisRecipeEdit
            mediaContext={mediaContext}
            language={language}
            fontSize={fontSizeFinal}
            headerSize={headerSize}
            marginTop={marginTop}
            curDescription={curRecipe.description}
          />
          <MemoriesEdit
            mediaContext={mediaContext}
            language={language}
            recipeWidth={recipeWidth}
            fontSize={fontSizeFinal}
            headerSize={headerSize}
            marginTop={marginTop}
            images={curRecipe.memoryImages}
            onChangeImages={handleChangeMemoryImages}
            deleteImage={handleDeleteMemoryImage}
            displayError={displayError}
          />
          <CommentsEdit
            mediaContext={mediaContext}
            language={language}
            fontSize={fontSizeFinal}
            headerSize={headerSize}
            marginTop={marginTop}
            curComments={curRecipe.comments}
          />
          <button
            className={styles.btn__upload_recipe}
            style={{ fontSize: headerSize, marginTop: headerSize }}
            type="submit"
          >
            {language === "ja" ? "アップロード" : "Upload"}
          </button>
        </form>
      )}
    </>
  ) : (
    <Loading
      language={language}
      mediaContext={mediaContext}
      message={
        language === "ja"
          ? `レシピを${createOrUpdate === "create" ? "作成" : "更新"}中…`
          : `${
              createOrUpdate === "create" ? "Creating" : "Updating"
            } your recipe...`
      }
    />
  );
}

function ImageTitleEdit({
  mediaContext,
  language,
  recipeWidth,
  fontSize,
  curTitle,
  curImage,
  onChangeImage,
  deleteImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  recipeWidth: string;
  fontSize: string;
  curTitle: string;
  curImage: TYPE_FILE | undefined;
  onChangeImage: (
    mainImageFile: TYPE_FILE,
    mainImagePreviewFile: TYPE_FILE
  ) => void;
  deleteImage: () => void;
  displayError: (error: string) => void;
}) {
  //design
  const width =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.82, "250px")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.74, "400px")
      : getSize(recipeWidth, 0.7, "440px");
  const height =
    parseFloat(width) *
      (mediaContext === "mobile"
        ? 0.65
        : mediaContext === "tablet"
        ? 0.63
        : 0.6) +
    "px";

  const [title, setTitle] = useState(curTitle);

  function handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setTitle(value);
  }

  async function handleChangeImage(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const files = e.currentTarget.files;
      if (!files) return;

      const mainImageFile = (await new Promise((resolve) =>
        Resizer.imageFileResizer(
          files[0],
          440,
          264,
          "WEBP",
          100,
          0,
          (uri) => resolve(getImageFileData(files[0], uri as string)),
          "base64"
        )
      )) as TYPE_FILE;

      const mainImagePreviewFile = (await new Promise((resolve) =>
        Resizer.imageFileResizer(
          files[0],
          50,
          50,
          "WEBP",
          100,
          0,
          (uri) => resolve(getImageFileData(files[0], uri as string)),
          "base64"
        )
      )) as TYPE_FILE;

      onChangeImage(mainImageFile, mainImagePreviewFile);
    } catch (err: unknown) {
      console.error("Error while resizing main image", 500);
      displayError(
        language === "ja"
          ? "画像のアップロード中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
          : "Server error while uploading image 🙇‍♂️ Please try again!"
      );
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
      }}
    >
      {!curImage?.data ? (
        <div className={styles.grey_background} style={{ width, height }}>
          <div
            style={{
              position: "relative",
              width:
                mediaContext === "mobile" || mediaContext === "tablet"
                  ? language === "ja"
                    ? "70%"
                    : "60%"
                  : language === "ja"
                  ? "60%"
                  : "50%",
              height: "13%",
              left: "4%",
              bottom: "3%",
            }}
          >
            <button
              className={clsx(styles.btn__img, styles.btn__upload_img)}
              style={{
                width: "100%",
                height: "100%",
                left: "0",
                color: "rgba(255, 168, 7, 1)",
                fontWeight: "bold",
                fontSize,
                letterSpacing: mediaContext === "mobile" ? "0.2vw" : "0.05vw",
              }}
              type="button"
            >
              {language === "ja" ? "画像をアップロード" : "Upload Image"}
            </button>
            <input
              className={styles.input__file}
              style={{
                width: "100%",
                height: "100%",
                left: "0",
              }}
              type="file"
              accept="image/*"
              name="mainImage"
              onChange={handleChangeImage}
            />
          </div>
        </div>
      ) : (
        <>
          <button
            className={clsx(styles.btn__img, styles.btn__trash_img)}
            style={{
              top: mediaContext === "mobile" ? "102%" : "0",
              right: mediaContext === "mobile" ? "-5%" : "-8%",
              width: mediaContext === "mobile" ? "10%" : "7%",
              height: mediaContext === "mobile" ? "11%" : "9%",
              opacity: curImage ? 1 : 0,
            }}
            type="button"
            onClick={deleteImage}
          ></button>
          <Image
            src={curImage.data}
            alt={language === "ja" ? "メイン画像" : "main image"}
            width={parseFloat(width)}
            height={parseFloat(height)}
          ></Image>
        </>
      )}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          top: "-10%",
          left: "7%",
          width: "85%",
          minHeight: `calc(${fontSize} * 2)`,
          maxHeight: "fit-content",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          backgroundImage:
            "linear-gradient(150deg, rgb(255, 230, 0) 10%,rgb(255, 102, 0))",
          letterSpacing: "0.1vw",
          padding: "2% 3.5%",
          transform: "skewX(-17deg)",
          zIndex: "2",
        }}
      >
        <input
          style={{
            width: "100%",
            height: "100%",
            background: "none",
            border: "none",
            letterSpacing: "0.07vw",
            fontSize: `calc(${fontSize} * 1.5)`,
            textAlign: "center",
            color: "rgb(60, 0, 116)",
          }}
          name="title"
          placeholder={
            language === "ja"
              ? `${
                  mediaContext !== "mobile" ? "クリックして" : ""
                }タイトルをセット`
              : `${
                  mediaContext !== "mobile" ? "Click here to set" : "Set"
                } a title`
          }
          value={title}
          onChange={handleChangeTitle}
        ></input>
      </div>
    </div>
  );
}

function BriefExplanationEdit({
  mediaContext,
  language,
  recipeWidth,
  fontSize,
  curRecipe,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  recipeWidth: string;
  fontSize: string;
  curRecipe: TYPE_RECIPE;
  onClickFavorite: () => void;
}) {
  //design
  const width = getSize(recipeWidth, 0.9, "90%");
  const fontSizeBrief = parseFloat(fontSize) * 0.95 + "px";
  const iconSize = parseFloat(fontSizeBrief);
  const fontFukidashiSize = `calc(${fontSizeBrief} * 0.9)`;

  const [mouseOver, setMouseOver] = useState([false, false, false]);

  const [author, setAuthour] = useState(curRecipe.author);
  const [servings, setServings] = useState(curRecipe.servings.servings);
  const [servingsUnit, setServingsUnit] = useState<TYPE_SERVINGS_UNIT>(
    (curRecipe.servings.unit || "people") as TYPE_SERVINGS_UNIT
  );
  const [servingsCustomUnit, setServingsCustomUnit] = useState(
    curRecipe.servings.customUnit
  );
  const [temperatureUnit, setTemperatureUnit] = useState(
    curRecipe.temperatures.unit
  );

  function handleMouseOver(e: React.MouseEvent<HTMLDivElement>) {
    const index = e.currentTarget.dataset.icon;
    if (!index) return;

    setMouseOver((prev) => {
      const newMouseOver = [...prev];
      newMouseOver[+index] = true;
      return newMouseOver;
    });
  }

  function handleMouseOut(e: React.MouseEvent<HTMLDivElement>) {
    const index = e.currentTarget.dataset.icon;
    if (!index) return;

    setMouseOver((prev) => {
      const newMouseOver = [...prev];
      newMouseOver[+index] = false;
      return newMouseOver;
    });
  }

  function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.currentTarget;
    const value = target.value;

    if (target.name === "author") setAuthour(value);
    if (target.name === "servings") setServings(+value);
    if (target.name === "servingsUnit")
      setServingsUnit(value as TYPE_SERVINGS_UNIT);
    if (target.name === "servingsCustomUnit") setServingsCustomUnit(value);
    if (target.name === "temperatureUnit") {
      (value === "℉" || value === "℃") && setTemperatureUnit(value);
    }
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width,
        height: "fit-content",
        gap: "3%",
        margin:
          mediaContext === "mobile"
            ? "10% 0 5% 0"
            : mediaContext === "tablet"
            ? "8% 0 5% 0"
            : "6% 0 5% 0 ",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          minWidth: "80%",
          width: "fit-content",
          maxWidth: "91%",
          height: "100%",
          whiteSpace: "nowrap",
          padding:
            mediaContext === "mobile"
              ? "5% 3%"
              : mediaContext === "tablet"
              ? "4% 3%"
              : "3%",
          backgroundColor: "rgb(255, 217, 0)",
          borderRadius: "1% / 7%",
          gap: "20%",
          boxShadow: "rgba(0, 0, 0, 0.27) 3px 3px 5px",
        }}
      >
        {mediaContext === "mobile" ? (
          <>
            <div
              className={styles.container__author_servings}
              style={{ gap: "3%" }}
            >
              <div
                className={styles.container__fukidashi}
                style={{
                  top: "-280%",
                  left: "-13%",
                  opacity: !mouseOver[0] ? 0 : 1,
                  width: "45%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{
                    fontSize: fontFukidashiSize,
                  }}
                >
                  {language === "ja"
                    ? "このレシピの作者"
                    : "Name of the person who will make the recipe"}
                </p>
              </div>
              <div
                className={styles.icons__brief_explanation}
                data-icon="0"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <Image
                  src={"/icons/person.svg"}
                  alt={language === "ja" ? "アイコン 人" : "person icon"}
                  width={iconSize}
                  height={iconSize}
                ></Image>
              </div>
              <input
                className={styles.input__brief_explanation}
                style={{ width: "35%", fontSize }}
                name="author"
                placeholder={language === "ja" ? "作者" : "Author"}
                value={author}
                onChange={handleChangeInput}
              ></input>
            </div>
            <div
              className={styles.container__author_servings}
              style={{ gap: "3%" }}
            >
              <div
                className={styles.container__fukidashi}
                style={{
                  top: "-420%",
                  left: "-13%",
                  opacity: !mouseOver[1] ? 0 : 1,
                  width: "70%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{ fontSize: fontFukidashiSize }}
                >
                  {language === "ja"
                    ? "このレシピの量。もし使いたい単位が選択肢にない場合、「その他」を選択し、「カスタム」に使用したい単位を入力してください"
                    : "Number of servings. If there isn't a unit you want to use in the selector, please select other and fill out the  custom unit field."}
                </p>
              </div>
              <div
                className={styles.icons__brief_explanation}
                data-icon="1"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <Image
                  src={"/icons/servings.svg"}
                  alt={language === "ja" ? "アイコン 量" : "servings icon"}
                  width={iconSize}
                  height={iconSize}
                ></Image>
              </div>
              <input
                className={styles.input__brief_explanation}
                style={{ width: "35%", fontSize }}
                type="number"
                min="1"
                max={MAX_SERVINGS}
                name="servings"
                placeholder={language === "ja" ? "レシピの量" : "Servings"}
                value={servings || ""}
                onChange={handleChangeInput}
              />
              <select
                className={styles.input__brief_explanation}
                style={{ width: "40%", fontSize }}
                name="servingsUnit"
                value={servingsUnit}
                onChange={handleChangeInput}
              >
                <option value="people">
                  {language === "ja" ? "人分" : "people"}
                </option>
                <option value="slices">
                  {language === "ja" ? "スライス" : "slices"}
                </option>
                <option value="pieces">
                  {language === "ja" ? "個分" : "pieces"}
                </option>
                <option value="cups">
                  {language === "ja" ? "カップ分" : "cups"}
                </option>
                <option value="bowls">
                  {language === "ja" ? "杯分" : "bowls"}
                </option>
                <option value="other">
                  {language === "ja" ? "その他" : "other"}
                </option>
              </select>
              {servingsUnit === "other" && (
                <input
                  className={styles.input__brief_explanation}
                  style={{ width: "25%", fontSize }}
                  name="servingsCustomUnit"
                  placeholder={language === "ja" ? "カスタム" : "custom"}
                  value={servingsCustomUnit}
                  onChange={handleChangeInput}
                />
              )}
            </div>
          </>
        ) : (
          <div
            className={styles.container__author_servings}
            style={{ gap: "2%" }}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                top: "-295%",
                left: "-13%",
                opacity: !mouseOver[0] ? 0 : 1,
                width: mediaContext === "tablet" ? "38%" : "34%",
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{
                  fontSize: fontFukidashiSize,
                }}
              >
                {language === "ja"
                  ? "このレシピの作者"
                  : "Name of the person who will make the recipe"}
              </p>
            </div>
            <div
              className={styles.icons__brief_explanation}
              data-icon="0"
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <Image
                src={"/icons/person.svg"}
                alt={language === "ja" ? "アイコン 人" : "person icon"}
                width={iconSize}
                height={iconSize}
              ></Image>
            </div>
            <input
              className={styles.input__brief_explanation}
              style={{
                width: servingsUnit !== "other" ? "23%" : "19%",
                fontSize,
              }}
              name="author"
              placeholder={language === "ja" ? "作者" : "Author"}
              value={author}
              onChange={handleChangeInput}
            ></input>
            <div
              className={styles.icons__brief_explanation}
              data-icon="1"
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div
                className={styles.container__fukidashi}
                style={{
                  top: mediaContext === "tablet" ? "-370%" : "-350%",
                  left: "10%",
                  opacity: !mouseOver[1] ? 0 : 1,
                  width: mediaContext === "tablet" ? "50.5%" : "42%",
                }}
              >
                <p
                  className={styles.p__fukidashi}
                  style={{ fontSize: fontFukidashiSize }}
                >
                  {language === "ja"
                    ? "このレシピの量。もし使いたい単位が選択肢にない場合、「その他」を選択し、「カスタム」に使用したい単位を入力してください"
                    : "Number of servings. If there isn't a unit you want to use in the selector, please select other and fill out the custom unit field."}
                </p>
              </div>
              <Image
                src={"/icons/servings.svg"}
                alt={language === "ja" ? "アイコン 量" : "servings icon"}
                width={iconSize}
                height={iconSize}
              ></Image>
            </div>
            <input
              className={styles.input__brief_explanation}
              style={{
                width: servingsUnit !== "other" ? "25%" : "17%",
                fontSize,
              }}
              type="number"
              min="1"
              max={MAX_SERVINGS}
              name="servings"
              placeholder={language === "ja" ? "レシピの量" : "Servings"}
              value={servings || ""}
              onChange={handleChangeInput}
            />
            <select
              className={styles.input__brief_explanation}
              style={{
                width: servingsUnit !== "other" ? "25%" : "22%",
                fontSize,
              }}
              name="servingsUnit"
              value={servingsUnit}
              onChange={handleChangeInput}
            >
              <option value="people">
                {language === "ja" ? "人分" : "people"}
              </option>
              <option value="slices">
                {language === "ja" ? "スライス" : "slices"}
              </option>
              <option value="pieces">
                {language === "ja" ? "個分" : "pieces"}
              </option>
              <option value="cups">
                {language === "ja" ? "カップ" : "cups"}
              </option>
              <option value="bowls">
                {language === "ja" ? "杯分" : "bowls"}
              </option>
              <option value="other">
                {language === "ja" ? "その他" : "other"}
              </option>
            </select>
            {servingsUnit === "other" && (
              <input
                className={styles.input__brief_explanation}
                style={{ width: "20%", fontSize }}
                name="servingsCustomUnit"
                placeholder={
                  language === "ja"
                    ? `カスタム${mediaContext !== "tablet" ? "単位" : ""}`
                    : `custom ${mediaContext !== "tablet" ? "unit" : ""}`
                }
                value={servingsCustomUnit}
                onChange={handleChangeInput}
              />
            )}
          </div>
        )}
        <div className={styles.container__units} style={{ gap: "2%" }}>
          <div
            className={styles.container__fukidashi}
            style={{
              top:
                mediaContext === "mobile"
                  ? "-290%"
                  : mediaContext === "tablet"
                  ? "-295%"
                  : "-290%",
              left: "-13%",
              opacity: !mouseOver[2] ? 0 : 1,
              width:
                mediaContext === "mobile"
                  ? "54%"
                  : mediaContext === "tablet"
                  ? "40.5%"
                  : "34.5%",
            }}
          >
            <p
              className={styles.p__fukidashi}
              style={{ fontSize: fontFukidashiSize }}
            >
              {language === "ja"
                ? "このレシピで使われる温度（オーブンの温度など）"
                : "Temperatures used in the recipe (e.g., oven temperatures)"}
            </p>
          </div>
          <div
            className={styles.icons__brief_explanation}
            style={{ marginRight: "1%" }}
            data-icon="2"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <Image
              src={"/icons/temperature.svg"}
              alt={language === "ja" ? "アイコン 温度" : "temperature icon"}
              width={iconSize}
              height={iconSize}
            ></Image>
          </div>
          {Array(NUMBER_OF_TEMPERATURES)
            .fill("")
            .map((_, i) => (
              <InputTempEdit
                key={i}
                mediaContext={mediaContext}
                language={language}
                fontSize={fontSize}
                temperature={
                  curRecipe.temperatures.temperatures[i] || undefined
                }
                i={i}
              />
            ))}
          <select
            className={styles.input__brief_explanation}
            style={{
              width: "fit-content",
              fontSize,
            }}
            name="temperatureUnit"
            value={temperatureUnit}
            onChange={handleChangeInput}
          >
            <option value="℃">℃</option>
            <option value="℉">℉</option>
          </select>
        </div>
      </div>
      <BtnFavorite
        mediaContext={mediaContext}
        favorite={curRecipe.favorite}
        onClickFavorite={onClickFavorite}
      />
    </div>
  );
}

function InputTempEdit({
  mediaContext,
  language,
  fontSize,
  temperature,
  i,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  temperature: number | undefined;
  i: number;
}) {
  const [temp, setTemp] = useState(temperature);

  function handleChangeTemp(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setTemp(value !== "" ? +value : undefined);
  }

  return (
    <input
      className={styles.input__brief_explanation}
      style={{
        width: mediaContext === "mobile" ? "16%" : "18%",
        fontSize,
      }}
      type="number"
      name={`temperature${i + 1}`}
      placeholder={`${
        mediaContext === "mobile" ? "" : language === "ja" ? "温度" : "temp"
      } ${i + 1}`}
      value={temp !== undefined ? temp : ""}
      onChange={handleChangeTemp}
    ></input>
  );
}

function IngredientsEdit({
  mediaContext,
  language,
  fontSize,
  headerSize,
  ingredients,
  regionUnit,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  headerSize: string;
  ingredients: TYPE_INGREDIENTS;
  regionUnit: TYPE_REGION_UNIT;
}) {
  const [numberOfLines, setNumberOfLines] = useState(ingredients.length);
  const [lines, setLines] = useState<{ id: string }[] | []>(
    ingredients.map(() => {
      return { id: nanoid() };
    })
  );
  const [deletedIndex, setDeletedIndex] = useState<number>();

  function handleClickPlus() {
    setNumberOfLines((prev) => prev + 1);
  }

  function handleClickDelete(i: number) {
    setDeletedIndex(i);
    setNumberOfLines((prev) => prev - 1);
  }

  ////Manually update lines to remain current state when users delete line
  useEffect(() => {
    setLines((prev) => {
      ///when line is added
      if (prev.length < numberOfLines) return [...prev, { id: nanoid() }];

      ///when line is deleted
      if (prev.length > numberOfLines) {
        if (!deletedIndex && deletedIndex !== 0) return prev;

        return [...prev].toSpliced(deletedIndex, 1);
      }

      return prev;
    });
  }, [numberOfLines, deletedIndex]);

  return (
    <div
      style={{
        position: "relative",
        width: mediaContext === "mobile" ? "93%" : "90%",
        height: "fit-content",
        backgroundColor: "rgb(255, 247, 177)",
        padding: "2% 2% 8% 2%",
        borderRadius: "3px",
        overflowX: "visible",
      }}
    >
      <h2
        className={styles.header}
        style={{
          fontSize: headerSize,
          marginBottom: headerSize,
        }}
      >
        {language === "ja" ? "材料" : "Ingredients"}
      </h2>
      <div
        style={{
          width: "100%",
          height: "fit-content",
          display: "grid",
          gridTemplateColumns: getIngGridTemplateColumnsStyle(
            ingredients,
            regionUnit,
            mediaContext,
            true
          ),
          justifyItems: "left",
          marginTop: "2%",
          fontSize,
          wordSpacing: "0.1vw",
          columnGap: mediaContext === "tablet" ? "0" : "5%",
          rowGap:
            mediaContext === "mobile" ? `calc(${fontSize} * 2)` : fontSize,
        }}
      >
        {lines.map((line, i) => (
          <IngLineEdit
            key={line.id}
            mediaContext={mediaContext}
            language={language}
            fontSize={fontSize}
            ingredient={
              ingredients[i] || {
                ingredient: "",
                amount: 0,
                unit: "g",
                convertion: {
                  original: { amount: 0, unit: "g" },
                  metric: undefined,
                  us: undefined,
                  japan: undefined,
                  australia: undefined,
                  metricCup: undefined,
                  g: undefined,
                  kg: undefined,
                  oz: undefined,
                  lb: undefined,
                  ml: undefined,
                  L: undefined,
                  usCup: undefined,
                  japaneseCup: undefined,
                  imperialCup: undefined,
                  riceCup: undefined,
                  tsp: undefined,
                  tbsp: undefined,
                  australianTbsp: undefined,
                },
              }
            }
            i={i}
            onClickDelete={handleClickDelete}
          />
        ))}
        <div className={styles.ingredients_line}>
          <ButtonPlus
            mediaContext={mediaContext}
            fontSize={fontSize}
            onClickBtn={handleClickPlus}
          />
        </div>
      </div>
    </div>
  );
}

function IngLineEdit({
  mediaContext,
  language,
  fontSize,
  ingredient,
  i,
  onClickDelete,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  ingredient: TYPE_INGREDIENT;
  i: number;
  onClickDelete: (i: number) => void;
}) {
  const typeIngArr: TYPE_INGREDIENT_UNIT[] = [
    "noUnit",
    "other",
    "g",
    "kg",
    "oz",
    "lb",
    "ml",
    "L",
    "usCup",
    "japaneseCup",
    "imperialCup",
    "riceCup",
    "tsp",
    "tbsp",
    "australianTbsp",
    "pinch",
    "can",
    "slice",
  ];

  const isTypeIngUnit = (unit: string) =>
    typeIngArr.includes(unit as TYPE_INGREDIENT_UNIT);

  const [line, setLine] = useState({
    ingredient: ingredient.ingredient,
    amount: ingredient.amount,
    unit: isTypeIngUnit(ingredient.unit) ? ingredient.unit : "other",
    customUnit: isTypeIngUnit(ingredient.unit) ? "" : ingredient.unit,
  });

  function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.currentTarget;

    setLine((prev) => {
      const newLine = { ...prev };
      if (target.name.includes("Name")) newLine.ingredient = target.value;
      if (target.name.includes("Amount")) newLine.amount = +target.value;
      if (target.name.includes("Unit") && !target.name.includes("CustomUnit"))
        newLine.unit = target.value;
      if (target.name.includes("CustomUnit")) newLine.customUnit = target.value;
      return newLine;
    });
  }

  return (
    <div
      className={styles.ingredients_line}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "2%",
      }}
    >
      <button
        className={clsx(styles.btn__img, styles.btn__trash_img)}
        style={{
          width: `calc(${fontSize} * 1.2)`,
          height: "80%",
          right:
            mediaContext === "mobile"
              ? "2%"
              : mediaContext === "tablet"
              ? "-7.5%"
              : "-7%",
          top: mediaContext === "mobile" ? "120%" : "10%",
        }}
        type="button"
        onClick={() => onClickDelete(i)}
      ></button>
      <span style={{ fontSize }}>{i + 1}. </span>
      <input
        className={styles.input__brief_explanation}
        style={{
          width: line.unit !== "other" ? "35%" : "27%",
          fontSize,
          padding: "1%",
        }}
        name={`ingredient${i + 1}Name`}
        placeholder={`${language === "ja" ? "材料" : "Ingredient"} ${i + 1}`}
        value={line.ingredient}
        onChange={handleChangeInput}
      ></input>
      <input
        className={styles.input__brief_explanation}
        style={{
          width: line.unit !== "other" ? "26%" : "20%",
          fontSize,
          padding: "1%",
        }}
        type="number"
        name={`ingredient${i + 1}Amount`}
        placeholder={language === "ja" ? "量" : "Amount"}
        value={line.amount || ""}
        onChange={handleChangeInput}
      ></input>
      <select
        className={styles.input__brief_explanation}
        style={{
          width: line.unit !== "other" ? "25%" : "18%",
          fontSize,
          padding: "1%",
        }}
        name={`ingredient${i + 1}Unit`}
        value={line.unit}
        onChange={handleChangeInput}
      >
        <option value="g">g</option>
        <option value="kg">kg</option>
        <option value="lb">lb</option>
        <option value="oz">oz</option>
        <option value="ml">ml</option>
        <option value="L">L</option>
        <option value="usCup">
          {language === "ja" ? "カップ（アメリカ）" : "cup (US)"}
        </option>
        <option value="japaneseCup">
          {language === "ja" ? "カップ（日本）" : "cup (Japan)"}
        </option>
        <option value="imperialCup">
          {language === "ja"
            ? "メトリックカップ (1カップ = 250ml)"
            : "Metric cup (1cup = 250ml)"}
        </option>
        <option value="riceCup">{language === "ja" ? "合" : "rice cup"}</option>
        <option value="tsp">{language === "ja" ? "小さじ" : "tsp"}</option>
        <option value="tbsp">{language === "ja" ? "大さじ" : "tbsp"}</option>
        <option value="australianTbsp">
          {language === "ja" ? "大さじ（オーストラリア）" : "tbsp (Australia)"}
        </option>
        <option value="pinch">{language === "ja" ? "つまみ" : "pinch"}</option>
        <option value="can">{language === "ja" ? "缶" : "can"}</option>
        <option value="slice">
          {language === "ja" ? "スライス" : "slice"}
        </option>
        <option value="other">{language === "ja" ? "その他" : "Other"}</option>
        <option value="noUnit">
          {language === "ja" ? "単位なし" : "No unit"}
        </option>
      </select>
      {line.unit === "other" && (
        <input
          className={styles.input__brief_explanation}
          style={{ width: "25%", padding: "1%", fontSize }}
          type="text"
          name={`ingredient${i + 1}CustomUnit`}
          placeholder={language === "ja" ? "カスタム単位" : "Custom Unit"}
          value={line.customUnit}
          onChange={handleChangeInput}
        />
      )}
    </div>
  );
}

function ButtonPlus({
  mediaContext,
  fontSize,
  onClickBtn,
}: {
  mediaContext: TYPE_MEDIA;
  fontSize: string;
  onClickBtn: () => void;
}) {
  return (
    <button
      style={{
        fontWeight: "bold",
        fontSize,
        width: mediaContext === "mobile" ? "8%" : "6%",
        aspectRatio: "1",
        color: "white",
        backgroundColor: "brown",
        borderRadius: "50%",
        border: "none",
      }}
      type="button"
      onClick={onClickBtn}
    >
      +
    </button>
  );
}

function InstructionsEdit({
  mediaContext,
  language,
  recipeWidth,
  fontSize,
  headerSize,
  marginTop,
  preparation,
  instructions,
  addInstruction,
  deleteInstruction,
  onChangeInstruction,
  onChangeImage,
  deleteImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  preparation: string;
  instructions: TYPE_INSTRUCTION[] | [];
  addInstruction: () => void;
  deleteInstruction: (index: number) => void;
  onChangeInstruction: (value: string, i: number) => void;
  deleteImage: (index: number) => void;
  onChangeImage: (image: TYPE_FILE, index: number) => void;
  displayError: (error: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  //Store key so whenever user delete instruction, other instructions' info will remain the same
  const [instructionKeys, setInstructionKeys] = useState(
    instructions.map(() => {
      return { id: nanoid() };
    })
  );
  const [deletedIndex, setDeletedIndex] = useState<number>();
  const [isTextareaFocus, setIsTextareaFocus] = useState(false);
  const [textareaWithBullet, setTextareaWithBullet] = useState(preparation);

  function handleClickDelete(i: number) {
    setDeletedIndex(i);
    deleteInstruction(i);
  }

  function handleToggleTextarea() {
    setIsTextareaFocus(!isTextareaFocus);
  }

  function handleChangeTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    setTextareaWithBullet(value);
  }

  //attach key event to Enter key and add a bullet point when it's pressed
  useEffect(() => {
    function handleAddBulletPoint(e: KeyboardEvent) {
      if (e.key !== "Enter" || !textareaRef.current || !isTextareaFocus) return;

      //split texts into each line and get rid of empty line
      const splitedTextsEachLine = textareaRef.current.value
        .split("\n")
        .filter((line) => line);

      //add a new line to increase bullet
      splitedTextsEachLine.push("");

      const nextTexts = splitedTextsEachLine
        .map((line) => (!line.includes("•") ? `• ${line}` : line))
        .join("\n");

      setTextareaWithBullet(nextTexts);
    }

    window.addEventListener("keydown", handleAddBulletPoint);

    return () => window.removeEventListener("keydown", handleAddBulletPoint);
  }, [isTextareaFocus]);

  //manually add or splice key info to remain other instructions info
  useEffect(() => {
    setInstructionKeys((prev) => {
      //when user adds instruction
      if (prev.length < instructions.length) return [...prev, { id: nanoid() }];

      //when user deletes instruction
      if (prev.length > instructions.length) {
        if (!deletedIndex && deletedIndex !== 0) return prev;

        const newInstructions = [...prev];
        return newInstructions.toSpliced(deletedIndex, 1);
      }

      return prev;
    });
  }, [instructions.length, deletedIndex]);

  return (
    <div
      style={{
        position: "relative",
        marginTop,
        width: mediaContext === "mobile" ? "90%" : "80%",
        height: "fit-content",
      }}
    >
      <h2
        className={styles.header}
        style={{ fontSize: headerSize, marginBottom: headerSize }}
      >
        {language === "ja" ? "作り方" : "Instructions"}
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "fit-content",
          backgroundColor: "rgba(240, 235, 172, 0.91)",
          marginBottom: fontSize,
          padding: "2%",
        }}
      >
        <span
          style={{
            fontSize: `calc(${fontSize} * 1.1)`,
            color: "rgba(117, 109, 0, 0.91)",
            margin: "0 3% 1.5% 3%",
            letterSpacing: "0.07vw",
            alignSelf: "flex-start",
          }}
        >
          {language === "ja" ? "準備" : "Preparation"}
        </span>
        <textarea
          ref={textareaRef}
          style={{
            width: "95%",
            aspectRatio: "1/0.25",
            resize: "none",
            border: "none",
            backgroundColor: "transparent",
            padding: "2%",
            fontSize,
            letterSpacing: "0.05vw",
          }}
          placeholder={
            language === "ja"
              ? "クリックして事前準備としてやっておくことを追加してください（エンターキーを押すと、リストのように「・」が出てきます）"
              : 'Click here to add preparation steps (A bullet point will appear when you press "Enter")'
          }
          name="preparation"
          value={textareaWithBullet}
          onFocus={handleToggleTextarea}
          onBlur={handleToggleTextarea}
          onChange={handleChangeTextarea}
        ></textarea>
      </div>
      {instructionKeys.length !== 0 &&
        instructionKeys.map((keyObj, i) => (
          <InstructionEdit
            key={keyObj.id}
            mediaContext={mediaContext}
            language={language}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            i={i}
            instruction={
              instructions[i] || { instruction: "", image: undefined }
            }
            onClickDelete={handleClickDelete}
            onChangeInstruction={onChangeInstruction}
            onClickDeleteImage={deleteImage}
            onChangeImage={onChangeImage}
            displayError={displayError}
          />
        ))}
      <div
        style={{
          width: "100%",
          height: "fit-content",
          backgroundColor: "rgba(255, 255, 236, 0.91)",
          paddingBottom: "2%",
        }}
      >
        <ButtonPlus
          mediaContext={mediaContext}
          fontSize={fontSize}
          onClickBtn={addInstruction}
        />
      </div>
    </div>
  );
}

function InstructionEdit({
  mediaContext,
  language,
  recipeWidth,
  fontSize,
  i,
  instruction,
  onClickDelete,
  onChangeInstruction,
  onClickDeleteImage,
  onChangeImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  recipeWidth: string;
  fontSize: string;
  i: number;
  instruction: TYPE_INSTRUCTION;
  onClickDelete: (i: number) => void;
  onChangeInstruction: (value: string, i: number) => void;
  onClickDeleteImage: (i: number) => void;
  onChangeImage: (image: TYPE_FILE, i: number) => void;
  displayError: (error: string) => void;
}) {
  //design
  const imageWidth =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.28, "100px")
      : getSize(recipeWidth, 0.22, "140px");
  const imageHeight =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.2, "70px")
      : getSize(recipeWidth, 0.15, "100px");

  async function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const files = e.currentTarget.files;
      if (!files) return;

      Resizer.imageFileResizer(
        files[0],
        140,
        100,
        "WEBP",
        100,
        0,
        (uri) => {
          const fileData = getImageFileData(files[0], uri as string);
          onChangeImage(fileData, i);
        },
        "base64"
      );
    } catch (err: unknown) {
      console.error("Error while resizing instruction image", 500);
      displayError(
        language === "ja"
          ? "画像のアップロード中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
          : "Server error while uploading image 🙇‍♂️ Please try again!"
      );
    }
  }

  function handleChangeInstruction(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    onChangeInstruction(value, i);
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        textAlign: "left",
        alignItems: "center",
        gap: mediaContext === "mobile" ? "2%" : "5%",
        width: "100%",
        height: "fit-content",
        backgroundColor: "rgba(255, 255, 236, 0.91)",
        padding: "4% 3%",
        fontSize,
        letterSpacing: "0.05vw",
      }}
    >
      <span
        style={{
          position: "relative",
          top: "-35px",
          textAlign: "center",
          fontSize,
          width: mediaContext === "mobile" ? "8%" : "5%",
          aspectRatio: "1",
          borderRadius: "50%",
          color: "white",
          backgroundColor: " #ce3a00e7 ",
        }}
      >
        {i + 1}
      </span>
      <textarea
        style={{
          width: "55%",
          aspectRatio: "1/0.7",
          fontSize,
          letterSpacing: "0.03vw",
          padding: "0.3% 1%",
          resize: "none",
        }}
        name={`instruction${i + 1}`}
        placeholder={`${language === "ja" ? "作り方" : "Instruction"}${i + 1}`}
        value={instruction.instruction}
        onChange={handleChangeInstruction}
      ></textarea>
      <div
        style={{ position: "relative", width: imageWidth, height: imageHeight }}
      >
        {!instruction.image?.data ? (
          <div
            className={styles.grey_background}
            style={{ width: "100%", height: "100%" }}
          >
            <button
              className={clsx(styles.btn__img, styles.btn__upload_img)}
              style={{ width: "20%", height: "30%", top: "30%", left: "40%" }}
              type="button"
            ></button>
            <input
              className={clsx(styles.input__file)}
              style={{
                width: "20%",
                height: "30%",
                top: "30%",
                left: "40%",
              }}
              type="file"
              accept="image/*"
              name={`instruction${i + 1}Image`}
              onChange={handleChangeImg}
            />
          </div>
        ) : (
          <>
            <Image
              src={instruction.image.data}
              alt={
                language === "ja"
                  ? `作り方${i + 1} 画像`
                  : `instruction${i + 1} image`
              }
              width={parseFloat(imageWidth)}
              height={parseFloat(imageHeight)}
            ></Image>
            <button
              className={clsx(styles.btn__img, styles.btn__trash_img)}
              style={{
                right: "0",
                top: mediaContext === "mobile" ? "110%" : "103%",
                width: `calc(${fontSize} * 1.2)`,
                height: `calc(${fontSize} * 1.2)`,
              }}
              type="button"
              onClick={() => onClickDeleteImage(i)}
            ></button>
          </>
        )}
      </div>
      <button
        className={clsx(styles.btn__img, styles.btn__trash_img)}
        style={{
          right: mediaContext === "mobile" ? "-8%" : "-13%",
          top: "44%",
          width: "10%",
          height: "15%",
        }}
        type="button"
        onClick={() => onClickDelete(i)}
      ></button>
    </div>
  );
}

function AboutThisRecipeEdit({
  mediaContext,
  language,
  fontSize,
  headerSize,
  marginTop,
  curDescription,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  curDescription: string;
}) {
  const [description, setDescription] = useState(curDescription);

  function handleChangeDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;

    setDescription(value);
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        width: "100%",
        maxHeight: "30%",
        marginTop,
      }}
    >
      <h2
        className={styles.header}
        style={{ marginBottom: headerSize, fontSize: headerSize }}
      >
        {language === "ja" ? "このレシピについて" : "About This Recipe"}
      </h2>
      <div
        style={{
          backgroundColor: "rgb(255, 247, 133)",
          width: mediaContext === "mobile" ? "90%" : "85%",
          aspectRatio: mediaContext === "mobile" ? "1/0.4" : "1/0.3",
          letterSpacing: "0.05vw",
          padding: "1.2% 1.5%",
          overflowY: "hidden",
          scrollbarColor: "rgb(255, 247, 133) rgba(255, 209, 2, 1)",
        }}
      >
        <textarea
          style={{
            resize: "none",
            width: "100%",
            height: "100%",
            fontSize,
            letterSpacing: "0.05vw",
            padding: "1.2% 1.5%",
            background: "none",
            border: "none",
          }}
          name="description"
          placeholder={
            language === "ja"
              ? "クリックしてこのレシピについての説明を追加しましょう"
              : "Click here to set an explanation for the recipe"
          }
          value={description}
          onChange={handleChangeDescription}
        ></textarea>
      </div>
    </div>
  );
}

function MemoriesEdit({
  mediaContext,
  language,
  recipeWidth,
  fontSize,
  headerSize,
  marginTop,
  images,
  onChangeImages,
  deleteImage,
  displayError,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  images: [] | TYPE_FILE[];
  onChangeImages: (imagesArr: TYPE_FILE[]) => void;
  deleteImage: (i: number) => void;
  displayError: (error: string) => void;
}) {
  //design
  const width =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.9, "300px")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.65, "400px")
      : getSize(recipeWidth, 0.55, "400px");
  const height = parseInt(width) * 0.55 + "px";

  const [curImg, setCurImg] = useState(0);

  async function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const files = e.currentTarget.files;
      if (!files) return;

      const promiseArr = Array.from(files).map(
        (file) =>
          new Promise((resolve) =>
            Resizer.imageFileResizer(
              file,
              400,
              220,
              "WEBP",
              100,
              0,
              (uri) => resolve(getImageFileData(file, uri as string)),
              "base64"
            )
          )
      );
      const imageFiles = (await Promise.all(promiseArr)) as TYPE_FILE[];

      onChangeImages(imageFiles);
    } catch (err: unknown) {
      console.error("Error while resizing memory images", 500);
      displayError(
        language === "ja"
          ? "画像のアップロード中にサーバーエラーが発生しました🙇‍♂️もう一度お試しください"
          : "Server error while uploading images 🙇‍♂️ Please try again"
      );
    }
  }

  function handleClickDot(i: number) {
    setCurImg(i);
  }

  function handleDeleteImg(i: number) {
    deleteImage(i);
    //if deleted img was the last img and not the only img, set curImg as one before the img, otherwise, one after the img
    setCurImg((prev) => (prev && images.length - 1 === prev ? prev - 1 : prev));
  }

  return (
    <div
      style={{
        marginTop,
        width:
          mediaContext === "mobile"
            ? "90%"
            : mediaContext === "tablet"
            ? "65%"
            : "55%",
        height: `calc(${headerSize} * 2 + ${height})`,
      }}
    >
      <h2
        className={styles.header}
        style={{ marginBottom: headerSize, fontSize: headerSize }}
      >
        {language === "ja" ? "このレシピの思い出" : "Memories of The Recipe"}
      </h2>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height,
          overflow: "hidden",
        }}
      >
        {images.map((img, i) => (
          <MemoryImgEdit
            key={i}
            language={language}
            width={width}
            height={height}
            image={img}
            i={i}
            translateX={calcTransitionXSlider(i, curImg)}
            onClickDelete={handleDeleteImg}
          />
        ))}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: calcTransitionXSlider(images.length, curImg),
            transition: "all 0.4s",
          }}
        >
          <div
            className={styles.grey_background}
            style={{ width: "100%", height: "100%" }}
          >
            <button
              className={clsx(styles.btn__img, styles.btn__upload_img)}
              style={{
                width: language === "ja" ? "70%" : "62%",
                height: "17%",
                top: "39%",
                left: language === "ja" ? "23%" : "25%",
                fontSize,
                letterSpacing: "0.07vw",
                color: "rgba(255, 168, 7, 1)",
                fontWeight: "bold",
              }}
              type="button"
            >
              {language === "ja" ? "画像をアップロード" : "Upload Images"}
            </button>
            <input
              className={styles.input__file}
              style={{
                width: "62%",
                height: "18%",
                top: "38%",
                left: "25%",
              }}
              type="file"
              accept="image/*"
              name="memoryImages"
              multiple
              onChange={handleChangeImg}
            />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            width:
              mediaContext === "mobile"
                ? "85%"
                : mediaContext === "tablet"
                ? "80%"
                : "70%",
            height: "5%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap:
              mediaContext === "mobile"
                ? "2.4%"
                : mediaContext === "tablet"
                ? "2.2%"
                : "1.8%",
            bottom: "5%",
          }}
        >
          {/* add one for upload slide */}
          {[...images, ""].map((_, i) => (
            <button
              key={i}
              style={{
                opacity: "0.6",
                width: mediaContext === "mobile" ? "3.5%" : "3%",
                aspectRatio: "1",
                backgroundColor:
                  curImg === i ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.3)",
                borderRadius: "50%",
                border: "none",
              }}
              type="button"
              onClick={() => handleClickDot(i)}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MemoryImgEdit({
  language,
  width,
  height,
  image,
  i,
  translateX,
  onClickDelete,
}: {
  language: TYPE_LANGUAGE;
  width: string;
  height: string;
  image: TYPE_FILE;
  i: number;
  translateX: string;
  onClickDelete: (i: number) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        transform: translateX,
        transition: "all 0.4s",
      }}
    >
      <button
        className={clsx(styles.btn__img, styles.btn__trash_img)}
        style={{
          right: "0",
          top: "80%",
          width: "12%",
          height: "12%",
        }}
        type="button"
        onClick={() => onClickDelete(i)}
      ></button>
      <Image
        src={image.data}
        alt={`${language === "ja" ? "思い出画像" : "memory image"}${i + 1}`}
        width={parseFloat(width)}
        height={parseFloat(height)}
      ></Image>
    </div>
  );
}

function CommentsEdit({
  mediaContext,
  language,
  fontSize,
  headerSize,
  marginTop,
  curComments,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  curComments: string;
}) {
  const [comments, setComments] = useState(curComments);

  function handleChangeComments(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    setComments(value);
  }

  return (
    <div
      style={{
        marginTop,
        width:
          mediaContext === "mobile"
            ? "90%"
            : mediaContext === "tablet"
            ? "80%"
            : "70%",
        aspectRatio: "1/0.5",
      }}
    >
      <h2
        className={styles.header}
        style={{ fontSize: headerSize, marginBottom: headerSize }}
      >
        {language === "ja" ? "コメント" : "Comments"}
      </h2>
      <div
        style={{
          width: "100%",
          height: "70%",
          borderRadius: "1% / 3%",
          backgroundColor: "rgb(255, 253, 222)",
        }}
      >
        <textarea
          style={{
            resize: "none",
            background: "none",
            border: "none",
            width: "100%",
            height: "100%",
            fontSize,
            letterSpacing: "0.05vw",
            padding: "3%",
          }}
          name="comments"
          placeholder={
            language === "ja"
              ? "クリックしてコメントを追加しましょう"
              : "Click here to add comments"
          }
          value={comments}
          onChange={handleChangeComments}
        ></textarea>
      </div>
    </div>
  );
}
