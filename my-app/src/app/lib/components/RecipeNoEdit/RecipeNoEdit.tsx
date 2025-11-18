"use client";
//react
import { useEffect, useState } from "react";
//next.js
import { useRouter } from "next/navigation";
//css
import styles from "./recipeNoEdit.module.css";
//componets
import {
  BtnFavorite,
  ButtonEditMain,
  ErrorMessageRecipe,
} from "../recipeCommon/recipeCommon";
//type
import {
  TYPE_FILE,
  TYPE_INGREDIENT,
  TYPE_INGREDIENTS,
  TYPE_LANGUAGE,
  TYPE_MEDIA,
  TYPE_RECIPE,
  TYPE_REGION_UNIT,
  TYPE_SERVINGS_UNIT,
  TYPE_USER_CONTEXT,
} from "../../config/type";
//methods for recipe
import {
  calcTransitionXSlider,
  getIngGridTemplateColumnsStyle,
  getNextSlideIndex,
  getTemperatures,
  getTranslatedIngredientsUnit,
  getTranslatedServingsUnit,
  updateConvertion,
  updateIngsForServings,
  uploadRecipeUpdate,
} from "../../helpers/recipes";
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
import fracty from "fracty";
import Image from "next/image";
import { MAX_SERVINGS, SLIDE_TRANSITION_SEC } from "../../config/settings";

export default function RecipeNoEdit({
  language,
  mediaContext,
  userContext,
  recipeWidth,
  error,
  mainOrRecipe,
  userRecipe = null,
}: {
  language: TYPE_LANGUAGE;
  mediaContext: TYPE_MEDIA;
  userContext: TYPE_USER_CONTEXT;
  recipeWidth: string;
  error: string;
  mainOrRecipe: "main" | "recipe";
  userRecipe: TYPE_RECIPE | null;
}) {
  const router = useRouter();

  ///design
  const [windowWidth, setWindowWidth] = useState<null | number>(null);
  const [fontSizeFinal, setFontSizeFinal] = useState("1.5vw");
  const [headerSize, setHeaderSize] = useState(
    parseFloat(fontSizeFinal) * 1.1 + "px"
  );
  const marginTop = getSize(recipeWidth, 0.11, "30px");

  useEffect(() => {
    const handleResize = () =>
      setWindowWidth(document.documentElement.clientWidth);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!windowWidth) return;

    const fontSizeEn =
      mediaContext === "mobile"
        ? getSize(recipeWidth, 0.045, "4.5vw")
        : mediaContext === "tablet"
        ? getSize(recipeWidth, 0.035, "2.7vw")
        : mediaContext === "desktop" && windowWidth <= 1100
        ? getSize(recipeWidth, 0.031, "1.5vw")
        : getSize(recipeWidth, 0.028, "1.3vw");

    const fontSizeFin =
      language === "ja" ? parseFloat(fontSizeEn) * 0.9 + "px" : fontSizeEn;
    setFontSizeFinal(fontSizeFin);

    setHeaderSize(parseFloat(fontSizeFin) * 1.1 + "px");
  }, [recipeWidth, mediaContext, language, windowWidth]);

  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE | null>(userRecipe);
  //use curRecipe to modify the recipe value
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE | null>(userRecipe);
  const [favorite, setFavorite] = useState<boolean | undefined>(
    userRecipe?.favorite
  );
  const [servingsValue, setServingsValue] = useState<number | undefined>(
    userRecipe?.servings.servings
  );
  const [regionUnit, setRegionUnit] = useState<TYPE_REGION_UNIT>("original");

  const [curError, setCurError] = useState(error);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    userRecipe && setStateInit(userRecipe);
  }, [userRecipe]);

  function setStateInit(recipe: TYPE_RECIPE) {
    setRecipe(recipe);
    setCurRecipe(recipe);
    setFavorite(recipe.favorite);
    setServingsValue(recipe.servings.servings);
    setRegionUnit("original");
  }

  function handleChangeServings(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = +e.currentTarget.value;
    setServingsValue(newValue);

    if (!recipe) return;
    setCurRecipe((prev) => {
      const newRecipe = { ...recipe };
      newRecipe.ingredients = updateIngsForServings(newValue, recipe);
      //update convertion for updated ing amount
      return updateConvertion(newRecipe);
    });
  }

  function handleChangeIngredientsUnit(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const value = e.currentTarget.value as TYPE_REGION_UNIT;
    setRegionUnit(value);
  }

  //update recipe only edit is false
  async function handleClickFavorite() {
    try {
      setFavorite(!favorite);
      setCurError("");
      setSuccessMessage(
        language === "ja"
          ? "お気に入り情報を更新中…"
          : "Updating favorite status..."
      );
      if (!recipe) return;

      const newRecipe = { ...recipe };
      newRecipe.favorite = !favorite;

      const recipeData = await uploadRecipeUpdate(newRecipe, userContext);
      setStateInit(recipeData);

      setSuccessMessage(
        language === "ja"
          ? "お気に入り情報が更新されました！"
          : "Favorite status updated successfully!"
      );
      await wait();
      setSuccessMessage("");
    } catch (err: unknown) {
      setSuccessMessage("");

      if (!isApiError(err))
        return logNonApiError(err, "Error while updating recipe");

      console.error(
        "Error while updating recipe",
        err.message,
        err.statusCode || 500
      );

      const errorMessage = generateErrorMessage(language, err, "recipe");

      setCurError(
        errorMessage ||
          (language === "ja"
            ? "お気に入り情報の更新中にエラーが発生しました🙇‍♂️もう一度お試しください"
            : "Server error while updating favorite status 🙇‍♂️ Please try again")
      );

      await authErrorRedirect(router, err.statusCode);
    }
  }

  return (
    <>
      {(error || successMessage) && (
        <ErrorMessageRecipe
          mediaContext={mediaContext}
          fontSize={fontSizeFinal}
          error={curError}
          message={successMessage}
          mainOrRecipe={mainOrRecipe}
        />
      )}
      <form
        style={{
          position: "relative",
          textAlign: "center",
          backgroundImage:
            "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
          width: mainOrRecipe === "main" ? "100%" : recipeWidth,
          height: "fit-content",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding:
            mainOrRecipe === "main"
              ? "10% 0"
              : mediaContext === "mobile"
              ? "6% 0"
              : "3% 0",
          borderRadius:
            mainOrRecipe === "main"
              ? "0"
              : mediaContext === "mobile"
              ? "5px"
              : "10px",
          color: "black",
          boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
        }}
      >
        {mainOrRecipe === "main" && (
          <ButtonEditMain
            mediaContext={mediaContext}
            language={language}
            fontSize={headerSize}
          />
        )}
        <ImageTitleNoEdit
          mediaContext={mediaContext}
          language={language}
          recipeWidth={recipeWidth}
          mainOrRecipe={mainOrRecipe}
          fontSize={fontSizeFinal}
          image={recipe?.mainImage}
          title={recipe?.title || ""}
        />
        <BriefExplanationNoEdit
          mediaContext={mediaContext}
          language={language}
          recipeWidth={recipeWidth}
          mainOrRecipe={mainOrRecipe}
          fontSize={fontSizeFinal}
          curRecipe={curRecipe}
          originalServingsValue={recipe?.servings.servings || 0}
          servingsValue={servingsValue || 0}
          favorite={favorite || false}
          regionUnit={regionUnit}
          onChangeServings={handleChangeServings}
          onChangeIngredientsUnit={handleChangeIngredientsUnit}
          onClickFavorite={handleClickFavorite}
        />
        <IngredientsNoEdit
          mediaContext={mediaContext}
          language={language}
          mainOrRecipe={mainOrRecipe}
          fontSize={fontSizeFinal}
          headerSize={headerSize}
          servingsValue={servingsValue || 0}
          ingredients={curRecipe?.ingredients || []}
          regionUnit={regionUnit}
        />
        <InstructionsNoEdit
          mediaContext={mediaContext}
          language={language}
          recipeWidth={recipeWidth}
          fontSize={fontSizeFinal}
          headerSize={headerSize}
          marginTop={marginTop}
          preparation={recipe?.preparation || ""}
          instructions={recipe?.instructions || []}
        />
        <AboutThisRecipeNoEdit
          mediaContext={mediaContext}
          language={language}
          mainOrRecipe={mainOrRecipe}
          fontSize={fontSizeFinal}
          headerSize={headerSize}
          marginTop={marginTop}
          description={recipe?.description || ""}
        />
        <MemoriesNoEdit
          mediaContext={mediaContext}
          language={language}
          recipeWidth={recipeWidth}
          fontSize={fontSizeFinal}
          headerSize={headerSize}
          marginTop={marginTop}
          images={recipe?.memoryImages || []}
        />
        <CommentsNoEdit
          mediaContext={mediaContext}
          language={language}
          fontSize={fontSizeFinal}
          headerSize={headerSize}
          marginTop={marginTop}
          comments={recipe?.comments || ""}
        />

        {/* <div className={styles.container__nutrition_facts}>
          <div className={styles.nutrition_facts}>
            <div className={styles.container__h3_input}>
              <h3>Nutrition Facts</h3>
              <input
                id={styles.input__servings}
                type="number"
                min="1"
                max="500"
                defaultValue="1"
              ></input>
              <span>servings</span>
            </div>
            <table className={styles.nutrients}>
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Amount</th>
                  <th scope="col">
                    Recommended amount a day
                    <br />
                    (Adult Men/Adult Women)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Calories</th>
                  <td scope="row">300kcal(1000jl)/30%</td>
                  <td scope="row">15%</td>
                </tr>
                <tr>
                  <th scope="row">Carbs</th>
                  <td scope="row">100g/30%</td>
                  <td scope="row">20%</td>
                </tr>
                <tr>
                  <th scope="row">Protein</th>
                  <td scope="row">10g/4%</td>
                  <td scope="row">10%</td>
                </tr>
                <tr>
                  <th scope="row">Fat</th>
                  <td scope="row">20g/10%</td>
                  <td scope="row">70%</td>
                </tr>
                <tr>
                  <th scope="row">Sugar</th>
                  <td scope="row">20g/10%</td>
                  <td scope="row">70%</td>
                </tr>
                <tr>
                  <th scope="row">Sodium</th>
                  <td scope="row">2g/0.5%</td>
                  <td scope="row">10%/20%</td>
                </tr>
                <tr>
                  <th scope="row">Fibers</th>
                  <td scope="row">2g/0.5%</td>
                  <td scope="row">10%/20%</td>
                </tr>
              </tbody>
            </table>
            <p style={{ color: "red", width: "95%", marginTop: "2%" }}>
                ※ Couldn't find the information of aaaa, and aaa, so that is
                excluded here.
              </p> 
          </div>
        </div> */}
      </form>
    </>
  );
}

function ImageTitleNoEdit({
  mediaContext,
  language,
  recipeWidth,
  mainOrRecipe,
  fontSize,
  image,
  title,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  recipeWidth: string;
  mainOrRecipe: "main" | "recipe";
  fontSize: string;
  image: TYPE_FILE | undefined;
  title: string;
}) {
  //design
  const width =
    mediaContext === "mobile"
      ? getSize(recipeWidth, mainOrRecipe === "main" ? 0.8 : 0.82, "250px")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, mainOrRecipe === "main" ? 0.72 : 0.74, "400px")
      : getSize(recipeWidth, mainOrRecipe === "main" ? 0.65 : 0.7, "440px");
  const height =
    parseInt(width) *
      (mediaContext === "mobile"
        ? 0.65
        : mainOrRecipe === "recipe" && mediaContext === "tablet"
        ? 0.63
        : 0.6) +
    "px";

  return (
    <div
      style={{
        position: "relative",
        width: width,
        height: height,
      }}
    >
      {!image?.data ? (
        <div
          className={styles.grey_background}
          style={{ width: width, height: height }}
        ></div>
      ) : (
        <Image
          src={image.data}
          alt={language === "ja" ? "メイン画像" : "main image"}
          width={parseFloat(width)}
          height={parseFloat(height)}
        ></Image>
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
          padding: "1% 3.5%",
          transform: "skewX(-17deg)",
          zIndex: "2",
        }}
      >
        <p
          style={{
            width: "100%",
            height: "100%",
            fontSize: `calc(${fontSize} * 1.5)`,
            letterSpacing: "0.1vw",
            textAlign: "center",
            color: "rgb(60, 0, 116)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

function BriefExplanationNoEdit({
  mediaContext,
  language,
  recipeWidth,
  mainOrRecipe,
  fontSize,
  curRecipe,
  originalServingsValue,
  servingsValue,
  regionUnit,
  favorite,
  onChangeServings,
  onChangeIngredientsUnit,
  onClickFavorite,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  recipeWidth: string;
  mainOrRecipe: "main" | "recipe";
  fontSize: string;
  curRecipe: TYPE_RECIPE | null;
  originalServingsValue: number;
  servingsValue: number;
  regionUnit: TYPE_REGION_UNIT;
  favorite: boolean;
  onChangeServings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIngredientsUnit: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickFavorite: () => void;
}) {
  //design
  const width = getSize(recipeWidth, 0.9, "90%");
  const fontSizeEn =
    parseFloat(fontSize) * (mainOrRecipe === "main" ? 0.9 : 0.95) + "px";
  const fontSizeFinal =
    language === "ja" ? parseFloat(fontSizeEn) * 0.9 + "px" : fontSizeEn;
  const iconSize = parseFloat(fontSizeEn);
  const fontFukidashiSize = `calc(${fontSizeFinal} * 0.9)`;

  const [mouseOver, setMouseOver] = useState([false, false, false, false]);
  const [servingsUnit, setServingsUnit] = useState(curRecipe?.servings.unit);
  const [servingsCustomUnit, setServingsCustomUnit] = useState(
    curRecipe?.servings.customUnit
  );
  const [temperaturs, setTemperatures] = useState(
    curRecipe?.temperatures.temperatures.join(" / ")
  );
  const [temperatureUnit, setTemperatureUnit] = useState<"℉" | "℃">(
    curRecipe?.temperatures.unit || "℉"
  );

  useEffect(() => {
    if (!curRecipe) return;

    setServingsUnit(curRecipe.servings.unit);
    setServingsCustomUnit(curRecipe.servings.customUnit);
    setTemperatures(curRecipe.temperatures.temperatures.join(" / "));
    setTemperatureUnit(curRecipe.temperatures.unit);
  }, [curRecipe]);

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

    if (target.name === "servingsUnit") setServingsUnit(value);
    if (target.name === "servingsCustomUnit") setServingsCustomUnit(value);
    if (target.name === "temperatureUnit") {
      (value === "℉" || value === "℃") && handleChangeTempUnit(value);
    }
  }

  function handleChangeTempUnit(value: "℉" | "℃") {
    setTemperatureUnit(value);
  }

  useEffect(() => {
    if (!curRecipe) return;

    const newTemps = getTemperatures(
      curRecipe.temperatures.temperatures,
      curRecipe.temperatures.unit,
      temperatureUnit
    );
    setTemperatures(newTemps);
  }, [curRecipe, temperatureUnit]);

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
        <div
          className={styles.container__author_servings}
          style={{
            gap: mediaContext === "mobile" ? "4%" : "2%",
            marginBottom: "2%",
          }}
        >
          <div
            className={styles.container__fukidashi}
            style={{
              top: mediaContext === "mobile" ? "-275%" : "-295%",
              left: mainOrRecipe === "main" ? "0%" : "-13%",
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
              {language === "ja" ? "このレシピの作者" : "Author of the recipe"}
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
          <span
            style={{
              width: mainOrRecipe === "main" ? "19%" : "25%",
              fontSize: fontSizeFinal,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {curRecipe?.author || ""}
          </span>
          <div
            className={styles.container__fukidashi}
            style={{
              top: mediaContext === "mobile" ? "-290%" : "-300%",
              left: "30%",
              opacity: !mouseOver[1] ? 0 : 1,
              width: "44%",
            }}
          >
            <p
              className={styles.p__fukidashi}
              style={{ fontSize: fontFukidashiSize }}
            >
              {language === "ja"
                ? "このレシピの量"
                : "Number of servings of the recipe"}
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
          {originalServingsValue !== 0 && (
            <input
              className={styles.input__brief_explanation}
              style={{ width: "17%", fontSize: fontSizeFinal }}
              type="number"
              min="1"
              max={MAX_SERVINGS}
              name="servings"
              placeholder={language === "ja" ? "量" : "Servings"}
              value={servingsValue}
              onChange={onChangeServings}
            />
          )}
          <span style={{ width: "20%", fontSize: fontSizeFinal }}>
            {servingsUnit !== "other"
              ? getTranslatedServingsUnit(
                  language,
                  (servingsUnit || "people") as TYPE_SERVINGS_UNIT
                )
              : servingsCustomUnit}
          </span>
        </div>
        <div
          className={styles.container__units}
          style={{
            gap:
              mediaContext === "mobile"
                ? mainOrRecipe === "main"
                  ? "5%"
                  : "4%"
                : "2%",
          }}
        >
          <div
            className={styles.container__fukidashi}
            style={{
              top: mediaContext === "mobile" ? "-280%" : "-295%",
              left: mainOrRecipe === "main" ? "0%" : "13%",
              opacity: !mouseOver[2] ? 0 : 1,
              width: "44%",
            }}
          >
            <p
              className={styles.p__fukidashi}
              style={{ fontSize: fontFukidashiSize }}
            >
              {language === "ja"
                ? "使用したい地域の単位"
                : "Unit system you prefer"}
            </p>
          </div>
          <div
            className={styles.icons__brief_explanation}
            data-icon="2"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <Image
              src={"/icons/scale.svg"}
              alt={
                language === "ja"
                  ? "アイコン 材料単位"
                  : "ingredient units icon"
              }
              width={iconSize}
              height={iconSize}
            ></Image>
          </div>
          <select
            className={styles.input__brief_explanation}
            style={{
              width: mainOrRecipe === "main" ? "25%" : "30%",
              fontSize: fontSizeFinal,
            }}
            name="region"
            value={regionUnit}
            onChange={onChangeIngredientsUnit}
          >
            <option value="original">
              {language === "ja" ? "オリジナル" : "Original"}
            </option>
            <option value="metric">
              {language === "ja" ? "メトリック" : "Metric"}
            </option>
            <option value="us">{language === "ja" ? "アメリカ" : "US"}</option>
            <option value="japan">
              {language === "ja" ? "日本" : "Japan"}
            </option>
            <option value="australia">
              {language === "ja" ? "オーストラリア" : "Australia"}
            </option>
            <option value="metricCup">
              {language === "ja"
                ? "メトリックカップ (1カップ = 250ml)"
                : "Metric cup (1cup = 250ml)"}
            </option>
          </select>

          <div
            className={styles.container__fukidashi}
            style={{
              top: mediaContext === "mobile" ? "-275%" : "-295%",
              left: "30%",
              opacity: !mouseOver[3] ? 0 : 1,
              width: "44%",
            }}
          >
            <p
              className={styles.p__fukidashi}
              style={{ fontSize: fontFukidashiSize }}
            >
              {language === "ja"
                ? "このレシピで使用される温度"
                : "Temperatures used in the recipe"}
            </p>
          </div>
          <div
            className={styles.icons__brief_explanation}
            data-icon="3"
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
          <span style={{ fontSize: fontSizeFinal }}>{temperaturs}</span>
          <select
            className={styles.input__brief_explanation}
            style={{ width: "fit-content", fontSize: fontSizeFinal }}
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
        favorite={favorite}
        onClickFavorite={onClickFavorite}
      />
    </div>
  );
}

function IngredientsNoEdit({
  mediaContext,
  language,
  mainOrRecipe,
  fontSize,
  headerSize,
  servingsValue,
  ingredients,
  regionUnit,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  mainOrRecipe: "main" | "recipe";
  fontSize: string;
  headerSize: string;
  servingsValue: number;
  ingredients: TYPE_INGREDIENTS;
  regionUnit: TYPE_REGION_UNIT;
}) {
  return (
    <div
      style={{
        position: "relative",
        width:
          mainOrRecipe === "recipe" && mediaContext === "mobile"
            ? "93%"
            : "90%",
        height: "fit-content",
        backgroundColor: "rgb(255, 247, 177)",
        padding: "2% 2% 8% 2%",
        borderRadius: "3px",
        overflowX: "auto",
      }}
    >
      <h2
        className={styles.header}
        style={{
          fontSize: headerSize,
          marginBottom: `calc(${headerSize} * ${
            mainOrRecipe === "main" ? 0.5 : 1
          })`,
        }}
      >
        {language === "ja" ? "材料" : "Ingredients"}
      </h2>
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: getIngGridTemplateColumnsStyle(
            ingredients,
            regionUnit,
            mediaContext,
            false
          ),
          justifyItems: "left",
          marginTop: "2%",
          wordSpacing: "0.1vw",
          columnGap: mediaContext === "tablet" ? "0" : "5%",
          rowGap: mainOrRecipe === "main" ? "0" : "1%",
        }}
      >
        {ingredients.map((ing, i) => (
          <IngLineNoEdit
            key={i}
            language={language}
            fontSize={fontSize}
            servingsValue={servingsValue}
            ingredient={ing}
            regionUnit={regionUnit}
          />
        ))}
      </div>
    </div>
  );
}

function IngLineNoEdit({
  language,
  fontSize,
  servingsValue,
  ingredient,
  regionUnit,
}: {
  language: TYPE_LANGUAGE;
  fontSize: string;
  servingsValue: number;
  ingredient: TYPE_INGREDIENT;
  regionUnit: TYPE_REGION_UNIT;
}) {
  //don't modify originalIngredient
  const originalIngredient = ingredient;
  //to modify, use newIngredient
  const [newIngredient, setNewIngredient] = useState<{
    amount: number;
    unit: string;
  }>({
    amount: ingredient.amount,
    unit: getTranslatedIngredientsUnit(language, ingredient.unit),
  });

  useEffect(() => {
    const convertedIng = ingredient.convertion[regionUnit];

    //Not applicable converted ingredients unit => ingrediet otherwise converted ingredient
    const newIngredient = !convertedIng
      ? {
          amount: ingredient.amount,
          unit: getTranslatedIngredientsUnit(language, ingredient.unit),
        }
      : {
          amount: convertedIng.amount,
          unit: getTranslatedIngredientsUnit(language, convertedIng.unit),
        };
    setNewIngredient(newIngredient);
  }, [language, ingredient, servingsValue, regionUnit]);

  return (
    <div
      className={styles.ingredients_line}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "4%",
        whiteSpace: "nowrap",
        fontSize,
      }}
    >
      <input
        style={{
          width: `calc(${fontSize} * 0.8)`,
          height: `calc(${fontSize} * 0.8)`,
          marginLeft: "2%",
        }}
        type="checkbox"
      ></input>
      {language === "ja" ? (
        <p>
          {ingredient.ingredient}
          &nbsp;&nbsp;
          {!originalIngredient.amount
            ? ""
            : (newIngredient.amount !== 0 && newIngredient.unit === "g") ||
              newIngredient.unit === "kg" ||
              newIngredient.unit === "oz" ||
              newIngredient.unit === "lb" ||
              newIngredient.unit === "ml" ||
              newIngredient.unit === "L"
            ? newIngredient.amount
            : fracty(newIngredient.amount)}
          &nbsp;
          {newIngredient.unit &&
            newIngredient.unit !== "noUnit" &&
            newIngredient.unit !== "単位なし" &&
            `${newIngredient.unit}`}
        </p>
      ) : (
        <p>
          {!originalIngredient.amount
            ? ""
            : (newIngredient.amount !== 0 && newIngredient.unit === "g") ||
              newIngredient.unit === "kg" ||
              newIngredient.unit === "oz" ||
              newIngredient.unit === "lb" ||
              newIngredient.unit === "ml" ||
              newIngredient.unit === "L"
            ? newIngredient.amount
            : fracty(newIngredient.amount)}
          &nbsp;
          {newIngredient.unit &&
            newIngredient.unit !== "noUnit" &&
            newIngredient.unit !== "単位なし" &&
            `${newIngredient.unit}`}
          &nbsp;&nbsp;
          {ingredient.ingredient}
        </p>
      )}
    </div>
  );
}

function InstructionsNoEdit({
  mediaContext,
  language,
  recipeWidth,
  fontSize,
  headerSize,
  marginTop,
  preparation,
  instructions,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  preparation: string;
  instructions: { instruction: string; image: TYPE_FILE | undefined }[];
}) {
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
        style={{ marginBottom: headerSize, fontSize: headerSize }}
      >
        {language === "ja" ? "作り方" : "Instructions"}
      </h2>
      {preparation && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "fit-content",
            backgroundColor: "rgba(250, 246, 185, 0.91)",
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
          <p
            style={{
              width: "95%",
              height: "fit-content",
              resize: "none",
              border: "none",
              backgroundColor: "transparent",
              padding: "2%",
              fontSize,
              letterSpacing: "0.05vw",
              whiteSpace: "break-spaces",
              textAlign: "left",
            }}
          >
            {preparation}
          </p>
        </div>
      )}
      {instructions.length ? (
        instructions.map((inst, i) => (
          <InstructionNoEdit
            key={i}
            mediaContext={mediaContext}
            recipeWidth={recipeWidth}
            fontSize={fontSize}
            instruction={inst}
            i={i}
          />
        ))
      ) : (
        <p className={styles.no_content} style={{ fontSize }}>
          {language === "ja"
            ? "作り方はまだセットされていません"
            : "There're no instructions"}
        </p>
      )}
    </div>
  );
}

function InstructionNoEdit({
  mediaContext,
  recipeWidth,
  fontSize,
  instruction,
  i,
}: {
  mediaContext: TYPE_MEDIA;
  recipeWidth: string;
  fontSize: string;
  instruction: { instruction: string; image: TYPE_FILE | undefined };
  i: number;
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
        letterSpacing: "0.06vw",
      }}
    >
      <span
        style={{
          position: "relative",
          top: "-35px",
          textAlign: "center",
          width: mediaContext === "mobile" ? "8%" : "5%",
          aspectRatio: "1",
          borderRadius: "50%",
          fontSize,
          color: "white",
          backgroundColor: " #ce3a00e7 ",
        }}
      >
        {i + 1}
      </span>
      <p
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: instruction.image ? "55%" : "100%",
          height: "100px",
          letterSpacing: "0.03vw",
          fontSize,
          padding: instruction.image?.data ? "0 1%" : "0 0 0 3%",
        }}
      >
        {instruction.instruction}
      </p>
      <div
        style={{
          position: "relative",
          width: instruction.image?.data ? imageWidth : "0",
          height: imageHeight,
        }}
      >
        {instruction.image?.data && (
          <Image
            src={instruction.image.data}
            alt={`instruction ${i + 1} image`}
            width={parseInt(imageWidth)}
            height={parseInt(imageHeight)}
          ></Image>
        )}
      </div>
    </div>
  );
}

function AboutThisRecipeNoEdit({
  mediaContext,
  language,
  mainOrRecipe,
  fontSize,
  headerSize,
  marginTop,
  description,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  mainOrRecipe: "main" | "recipe";
  fontSize: string;
  headerSize: string;
  marginTop: string;
  description: string;
}) {
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
          backgroundColor: description ? "rgb(255, 247, 133)" : "transparent",
          width: mediaContext === "mobile" ? "90%" : "85%",
          aspectRatio: "1/0.28",
          fontSize,
          letterSpacing: mainOrRecipe === "main" ? "0.03vw" : "0.05vw",
          padding: "1.2% 1.5%",
          overflowY: "auto",
          scrollbarColor: "rgb(255, 247, 133) rgba(255, 209, 2, 1)",
        }}
      >
        <p
          className={description || styles.no_content}
          style={{
            width: "100%",
            height: "100%",
            fontSize,
            letterSpacing: "0.05vw",
            padding: "1.2% 1.5%",
          }}
        >
          {description ||
            (language === "ja"
              ? "レシピの説明はまだセットされていません"
              : "There's no description")}
        </p>
      </div>
    </div>
  );
}

function MemoriesNoEdit({
  mediaContext,
  language,
  recipeWidth,
  fontSize,
  headerSize,
  marginTop,
  images,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  recipeWidth: string;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  images: [] | TYPE_FILE[];
}) {
  //design
  const MAX_SLIDE = images.length - 1;

  const width =
    mediaContext === "mobile"
      ? getSize(recipeWidth, 0.9, "300px")
      : mediaContext === "tablet"
      ? getSize(recipeWidth, 0.65, "400px")
      : getSize(recipeWidth, 0.55, "400px");
  const height = parseInt(width) * 0.55 + "px";

  const [timeourId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [curImage, setCurImage] = useState(0);

  useEffect(() => {
    if (!images.length) return;
    if (timeourId) clearInterval(timeourId);

    const id = setTimeout(() => {
      const nextSlide = getNextSlideIndex(curImage, MAX_SLIDE);
      setCurImage(nextSlide);
    }, SLIDE_TRANSITION_SEC * 1000);

    setTimeoutId(id);
  }, [curImage]);

  function handleClickDot(i: number) {
    setCurImage(i);
  }

  return (
    <div
      style={{
        position: "relative",
        marginTop,
        width:
          mediaContext === "mobile"
            ? "90%"
            : mediaContext === "tablet"
            ? "65%"
            : "55%",
        height: images.length
          ? `calc(${headerSize} * 2 + ${height})`
          : `calc(${height} * 0.8)`,
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
          height: images.length
            ? height
            : `calc(${height} * 0.8 - ${headerSize} * 2)`,
          overflow: "hidden",
        }}
      >
        {images.length !== 0 &&
          images.map((img, i) => (
            <MemoryImgNoEdit
              key={i}
              language={language}
              width={width}
              height={height}
              i={i}
              image={img}
              translateX={calcTransitionXSlider(i, curImage)}
            />
          ))}
        {images.length ? (
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
            {images.map((_, i) => (
              <button
                key={i}
                style={{
                  opacity: "0.6",
                  width: mediaContext === "mobile" ? "3.5%" : "3%",
                  aspectRatio: "1",
                  backgroundColor:
                    curImage === i ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.3)",
                  borderRadius: "50%",
                  border: "none",
                }}
                type="button"
                onClick={() => handleClickDot(i)}
              ></button>
            ))}
          </div>
        ) : (
          <p className={styles.no_content} style={{ fontSize, height: "100%" }}>
            {language === "ja"
              ? "写真はまだセットされていません"
              : "There're no memory images"}
          </p>
        )}
      </div>
    </div>
  );
}

function MemoryImgNoEdit({
  language,
  width,
  height,
  i,
  image,
  translateX,
}: {
  language: TYPE_LANGUAGE;
  width: string;
  height: string;
  i: number;
  image: TYPE_FILE;
  translateX: string;
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
      {image?.data && (
        <Image
          src={image.data}
          alt={`${language === "ja" ? "思い出写真" : "memory image"} ${i + 1}`}
          width={parseInt(width)}
          height={parseInt(height)}
        ></Image>
      )}
    </div>
  );
}

function CommentsNoEdit({
  mediaContext,
  language,
  fontSize,
  headerSize,
  marginTop,
  comments,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  fontSize: string;
  headerSize: string;
  marginTop: string;
  comments: string;
}) {
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
        style={{ marginBottom: headerSize, fontSize: headerSize }}
      >
        {language === "ja" ? "コメント" : "Comments"}
      </h2>
      <div
        style={{
          width: "100%",
          height: "70%",
          borderRadius: "1% / 3%",
          backgroundColor: comments ? "rgb(255, 253, 222)" : "transparent",
        }}
      >
        <p
          className={comments || styles.no_content}
          style={{
            width: "100%",
            height: "100%",
            fontSize,
            letterSpacing: comments ? "0.05vw" : "0.03vw",
            padding: comments ? "3%" : "0",
            overflowY: "auto",
            textAlign: comments ? "left" : "center",
          }}
        >
          {comments ||
            (language === "ja"
              ? "コメントはまだセットされていません"
              : "There're no comments")}
        </p>
      </div>
    </div>
  );
}
