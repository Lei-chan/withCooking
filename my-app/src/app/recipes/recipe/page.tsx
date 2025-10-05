"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import clsx from "clsx";
import React, { useEffect, useState, useContext } from "react";
import { AccessTokenContext } from "@/app/context";
import {
  wait,
  getData,
  uploadRecipe,
  getFileData,
  getTemperatures,
  // getUnit,
  getRegion,
  convertIngUnits,
  convertTempUnits,
  getReadableIngUnit,
  calcTransitionXSlider,
  updateIngsForServings,
  updateConvertion,
} from "@/app/helper";
import {
  MAX_SERVINGS,
  NUMBER_OF_TEMPERATURES,
  TYPE_FILE,
  TYPE_INGREDIENT,
  TYPE_INGREDIENTS,
  TYPE_RECIPE,
} from "@/app/config";
import { nanoid } from "nanoid";
import fracty from "fracty";

export default function Recipe() {
  const userContext = useContext(AccessTokenContext);
  //don't modify recipe value unless the recipe is changed
  const [recipe, setRecipe] = useState<TYPE_RECIPE>();
  //use curRecipe to modify the recipe value
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE>();
  const [favorite, setFavorite] = useState<boolean>();
  const [edit, setEdit] = useState(false);
  const [servingsValue, setServingsValue] = useState<number>();
  const [ingredientsUnit, setIngredientsUnit] = useState<
    "metric" | "us" | "japan" | "australia" | "metricCup"
  >();
  const [mainImage, setMainImage] = useState<TYPE_FILE | undefined>();
  const [instructionImages, setInstructionImages] = useState<
    (TYPE_FILE | undefined)[]
  >([undefined]);
  const [memoryImages, setMemoryImages] = useState<TYPE_FILE[]>([]);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = window.location.hash.slice(1);
    (async () => await getRecipe(id))();
  }, []);

  async function getRecipe(id: string) {
    try {
      const data = await getData(`/api/recipes?id=${id}`, { method: "GET" });

      //recipe is stored inside _doc of data.data
      //images are stored in data.data
      const recipe = data.data._doc;

      setStateInitNoImages(recipe);
      setMainImage(data.data.mainImage);
      setInstructionImages(
        data.data.instructions.map(
          (inst: { instruction: string; image: TYPE_FILE | undefined }) =>
            inst.image
        )
      );
      setMemoryImages(data.data.memoryImages);
    } catch (err: any) {
      setError(err.message);
      console.error(
        "Error while loading recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  function setStateInitNoImages(recipe: TYPE_RECIPE) {
    setRecipe(recipe);
    setCurRecipe(recipe);
    setFavorite(recipe.favorite);
    setServingsValue(recipe.servings.servings);
    setIngredientsUnit(recipe.region);
  }

  function handleToggleEdit() {
    setEdit(!edit);
  }

  //only when edit is false
  function handleChangeServings(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = +e.currentTarget.value;
    setServingsValue(newValue);

    if (edit || !recipe) return;
    setCurRecipe((prev: any) => {
      const newRecipe = { ...recipe };
      newRecipe.ingredients = updateIngsForServings(newValue, recipe);
      //update convertion for updated ing amount
      return updateConvertion(newRecipe);
    });
  }

  function handleChangeIngredientsUnit(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const value = e.currentTarget.value;
    if (
      value !== "metric" &&
      value !== "us" &&
      value !== "japan" &&
      value !== "australia" &&
      value !== "metricCup"
    )
      return;

    setIngredientsUnit(value);
  }

  function handleChangeMainImage(image: TYPE_FILE) {
    setMainImage(image);
  }

  function handleDeleteMainImage() {
    setMainImage(undefined);
  }

  function handleAddInstrucionImage() {
    setInstructionImages((prev) => [...prev, undefined]);
  }

  function handleDeleteInstructionImage(index: number) {
    setInstructionImages((prev) => {
      const newImages = [...prev];
      newImages[index] = undefined;
      return newImages;
    });
  }

  function handleChangeInstructionImage(image: TYPE_FILE, index: number) {
    setInstructionImages((prev) => {
      const newImages = [...prev];
      newImages[index] = image;
      return newImages;
    });
  }

  function handleDeleteInstruciton(index: number) {
    setInstructionImages((prev) => prev.toSpliced(index, 1));
  }

  function handleChangeMemoryImages(imagesArr: TYPE_FILE[]) {
    setMemoryImages((prev) => [...prev, ...imagesArr]);
  }

  function handleDeleteMemoryImage(index: number) {
    setMemoryImages((prev) => prev.toSpliced(index, 1));
  }

  async function handleClickFavorite() {
    try {
      setError("");
      setMessage("Updating favorite status...");
      setFavorite(!favorite);

      if (!recipe) return;

      const newRecipe = { ...recipe };
      newRecipe.favorite = !favorite;
      newRecipe.mainImage = mainImage;
      newRecipe.instructions = recipe.instructions.map((inst, i) => {
        return {
          instruction: inst.instruction,
          image: instructionImages[i],
        };
      });
      newRecipe.memoryImages = memoryImages;

      await uploadRecipe(newRecipe, userContext);
      setMessage("Favorite status updated successfully!");
      await wait();
      setMessage("");
    } catch (err: any) {
      setMessage("");
      setError(`Server error while uploading recipe 🙇‍♂️ ${err.message}`);
      console.error(
        "Error while uploading recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      setError("");
      setIsPending(true);

      const formData = new FormData(e.currentTarget);
      const dataArr = [...formData];

      ///ingredients
      const numberOfIngredients = dataArr.filter(
        (arr) => arr[0].includes("ingredient") && arr[0].includes("Name")
      ).length;

      const ingredients = new Array(numberOfIngredients)
        .fill("")
        .map((_, i) => {
          const amount = +(formData.get(`ingredient${i + 1}Amount`) || 0);
          const unit = formData.get(`ingredient${i + 1}Unit`);

          if (
            unit !== "noUnit" &&
            unit !== "other" &&
            unit !== "g" &&
            unit !== "kg" &&
            unit !== "oz" &&
            unit !== "lb" &&
            unit !== "ml" &&
            unit !== "L" &&
            unit !== "USCup" &&
            unit !== "JapaneseCup" &&
            unit !== "ImperialCup" &&
            unit !== "riceCup" &&
            unit !== "tsp" &&
            unit !== "Tbsp" &&
            unit !== "AustralianTbsp"
          )
            return {
              ingredient:
                String(formData.get(`ingredient${i + 1}CustomUnit`))?.trim() ||
                "",
              amount,
              unit: "g",
              customUnit:
                String(formData.get(`ingredient${i + 1}CustomUnit`))?.trim() ||
                "",
              id: undefined,
              convertion: undefined,
            };

          return {
            ingredient:
              String(formData.get(`ingredient${i + 1}Name`))?.trim() || "",
            amount,
            unit,
            customUnit:
              String(formData.get(`ingredient${i + 1}CustomUnit`))?.trim() ||
              "",
            id: undefined,
            convertion: convertIngUnits(amount, unit),
          };
        });

      const instructions = new Array(instructionImages.length)
        .fill("")
        .map((_, i) => {
          return {
            instruction: String(formData.get(`instruction${i + 1}`)) || "",
            image: instructionImages[i],
          };
        });

      const newRecipe = {
        favorite: favorite === true ? true : false,
        mainImage,
        title: String(formData.get("title"))?.trim() || "",
        author: String(formData.get("author")).trim() || "",
        region: getRegion(ingredients),
        servings: {
          servings: +(formData.get("servings") || 0),
          unit: String(formData.get("servingsUnit")) || "people",
          customUnit: String(formData.get("servingsCustomUnit")).trim() || "",
        },
        temperatures: {
          temperatures: [
            +(formData.get("temperature1") || 0),
            +(formData.get("temperature2") || 0),
            +(formData.get("temperature3") || 0),
            +(formData.get("temperature4") || 0),
          ],
          unit:
            formData.get("temperatureUnit") === "℉" ? "℉" : ("℃" as "℉" | "℃"),
        },
        ingredients,
        instructions,
        description: String(formData.get("description"))?.trim() || "",
        memoryImages,
        comments: String(formData.get("comments"))?.trim() || "",
        createdAt: new Date().toISOString(),
      };

      const recipeData = await uploadRecipe(newRecipe, userContext);
      setStateInitNoImages(recipeData);

      setIsPending(false);
      setMessage("Recipe uploaded successfully :)");
      await wait();
      setMessage("");
      setEdit(false);
    } catch (err: any) {
      setIsPending(false);
      setError(`Server error while uploading recipe 🙇‍♂️ ${err.message}`);
      console.error(
        "Error while uploading recipe",
        err.message,
        err.statusCode || 500
      );
    }
  }

  return !isPending ? (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backgroundImage:
          "linear-gradient(rgba(255, 253, 117, 1), rgba(225, 255, 117, 1))",
        width: "100%",
        height: "100%",
        padding: "2% 0",
      }}
    >
      {(error || message) && (
        <p
          style={{
            backgroundColor: error ? "orangered" : "rgba(112, 231, 0, 1)",
            color: "white",
            padding: "0.7% 1%",
            borderRadius: "5px",
            fontSize: "1.4vw",
            letterSpacing: "0.07vw",
            marginBottom: "1%",
          }}
        >
          {error || message}
        </p>
      )}
      {!edit ? (
        <button
          className={clsx(styles.btn__img, styles.btn__edit)}
          style={{
            color: "blueviolet",
            backgroundImage: "url(/pencile.svg)",
            width: "8%",
            right: "10%",
          }}
          type="button"
          onClick={handleToggleEdit}
        >
          Edit
        </button>
      ) : (
        <button
          className={clsx(styles.btn__img, styles.btn__edit)}
          style={{
            color: "blueviolet",
            backgroundImage: "url(/recipes.svg)",
            width: "12%",
            right: "7%",
          }}
          onClick={handleToggleEdit}
        >
          Recipe
        </button>
      )}
      {!recipe ||
      !curRecipe ||
      servingsValue === undefined ||
      !ingredientsUnit ||
      favorite === undefined ? (
        <form
          className={styles.loading}
          style={{
            backgroundImage:
              "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
            width: "50%",
            height: "600px",
            boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
            borderRadius: "10px",
          }}
        ></form>
      ) : (
        <form
          style={{
            position: "relative",
            textAlign: "center",
            backgroundImage:
              "linear-gradient(rgb(253, 255, 219), rgb(255, 254, 179))",
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "3% 0",
            color: "rgb(60, 0, 116)",
            boxShadow: "rgba(0, 0, 0, 0.32) 5px 5px 10px",
            borderRadius: "10px",
          }}
          onSubmit={handleSubmit}
        >
          <ImageTitle
            edit={edit}
            image={mainImage}
            title={curRecipe.title}
            onChangeImage={handleChangeMainImage}
            deleteImage={handleDeleteMainImage}
          />
          <BriefExplanation
            edit={edit}
            curRecipe={curRecipe}
            servingsValue={servingsValue}
            ingredientsUnit={ingredientsUnit}
            favorite={favorite}
            onChangeServings={handleChangeServings}
            onChangeIngredientsUnit={handleChangeIngredientsUnit}
            onClickFavorite={handleClickFavorite}
          />
          <Ingredients
            edit={edit}
            servingsValue={servingsValue}
            ingredients={curRecipe.ingredients}
            ingredientsUnit={ingredientsUnit}
          />
          <Instructions
            edit={edit}
            instructions={curRecipe.instructions}
            images={instructionImages}
            addImage={handleAddInstrucionImage}
            deleteImage={handleDeleteInstructionImage}
            onChangeImage={handleChangeInstructionImage}
            deleteInstruction={handleDeleteInstruciton}
          />
          <AboutThisRecipe edit={edit} curRecipe={curRecipe} />
          <Memories
            edit={edit}
            images={memoryImages}
            onChangeImages={handleChangeMemoryImages}
            deleteImage={handleDeleteMemoryImage}
          />
          <Comments edit={edit} curRecipe={curRecipe} />

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
          {edit && (
            <button className={styles.btn__upload_recipe} type="submit">
              Upload
            </button>
          )}
        </form>
      )}
    </div>
  ) : (
    <Loading />
  );
}

function ImageTitle({
  edit,
  image,
  title,
  onChangeImage,
  deleteImage,
}: {
  edit: boolean;
  image: TYPE_FILE | undefined;
  title: string;
  onChangeImage: (image: TYPE_FILE) => void;
  deleteImage: () => void;
}) {
  const [recipeTitle, setRecipeTitle] = useState(title);

  async function handleChangeImage(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const files = e.currentTarget.files;
      if (!files) return;

      onChangeImage(await getFileData(files[0]));
    } catch (err: any) {
      console.error(err.message);
    }
  }

  function handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setRecipeTitle(value);
  }

  return (
    <div
      style={{
        position: "relative",
        width: "500px",
        height: "300px",
      }}
    >
      {!image?.data ? (
        <div
          className={styles.grey_background}
          style={{ width: "500px", height: "300px" }}
        >
          {edit && (
            <div
              style={{
                position: "relative",
                width: "50%",
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
                  fontSize: "1.5vw",
                  letterSpacing: "0.05vw",
                }}
                type="button"
              >
                Upload image
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
          )}
        </div>
      ) : (
        <>
          {edit && (
            <button
              className={clsx(styles.btn__img, styles.btn__trash_img)}
              style={{
                right: "-8%",
                width: "7%",
                height: "9%",
              }}
              type="button"
              onClick={deleteImage}
            ></button>
          )}
          <Image
            src={image.data}
            alt="main image"
            width={500}
            height={300}
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
          minHeight: "60px",
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
        {edit ? (
          <input
            style={{
              width: "100%",
              height: "100%",
              background: "none",
              border: "none",
              letterSpacing: "0.07vw",
              fontSize: "2.1vw",
              textAlign: "center",
            }}
            name="title"
            placeholder="Click here to set title"
            value={recipeTitle}
            onChange={handleChangeTitle}
          ></input>
        ) : (
          <p
            style={{
              width: "100%",
              height: "100%",
              fontSize: "2.1vw",
              letterSpacing: "0.1vw",
              textAlign: "center",
            }}
          >
            {recipeTitle}
          </p>
        )}
      </div>
    </div>
  );
}

function BriefExplanation({
  edit,
  curRecipe,
  servingsValue,
  ingredientsUnit,
  favorite,
  onChangeServings,
  onChangeIngredientsUnit,
  onClickFavorite,
}: {
  edit: boolean;
  curRecipe: TYPE_RECIPE;
  servingsValue: number;
  ingredientsUnit: string;
  favorite: boolean;
  onChangeServings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIngredientsUnit: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickFavorite: () => void;
}) {
  const [mouseOver, setMouseOver] = useState([false, false, false, false]);
  const [author, setAuthour] = useState(curRecipe.author);
  const [servingsUnit, setServingsUnit] = useState(curRecipe.servings.unit);
  const [servingsCustomUnit, setServingsCustomUnit] = useState(
    curRecipe.servings.customUnit
  );
  const [tempKeys, setTempKeys] = useState(
    Array(NUMBER_OF_TEMPERATURES)
      .fill("")
      .map((_) => {
        return { id: nanoid() };
      })
  );
  const [temperaturs, setTemperatures] = useState(
    curRecipe.temperatures.temperatures.join(" / ")
  );
  const [temperatureUnit, setTemperatureUnit] = useState<"℉" | "℃">(
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    i: number
  ) {
    const target = e.currentTarget;
    const value = target.value;

    if (target.name === "author") setAuthour(value);
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
    const newTemps = getTemperatures(
      curRecipe.temperatures.temperatures,
      curRecipe.temperatures.unit,
      temperatureUnit
    );
    setTemperatures(newTemps);
  }, [temperatureUnit]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
        height: "fit-content",
        gap: "3%",
        margin: "50px 0 28px 0",
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
          height: "100px",
          whiteSpace: "nowrap",
          padding: "3%",
          backgroundColor: "rgb(255, 217, 0)",
          borderRadius: "1% / 7%",
          gap: "20%",
          boxShadow: "rgba(0, 0, 0, 0.27) 3px 3px 5px",
        }}
      >
        <div className={styles.container__author_servings}>
          <div
            className={styles.icons__brief_explanation}
            data-icon="0"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: edit ? "530%" : "380%",
                height: edit ? "340%" : "220%",
                top: edit ? "-350%" : "-230%",
                left: edit ? "-460%" : "-280%",
                paddingLeft: "10%",
                opacity: !mouseOver[0] ? 0 : 1,
              }}
            >
              <p className={styles.p__fukidashi}>
                {edit
                  ? "Name of the person who will make the recipe"
                  : "Author of the recipe"}
              </p>
            </div>
            <Image
              src={"/person.svg"}
              alt="person icon"
              width={13}
              height={13}
            ></Image>
          </div>
          {edit ? (
            <input
              className={styles.input__brief_explanation}
              style={{ width: "19%" }}
              name="author"
              placeholder="Author"
              value={author}
              onChange={(e) => handleChangeInput(e, 0)}
            ></input>
          ) : (
            <span style={{ width: "19%" }}>{author}</span>
          )}
          <div
            className={styles.icons__brief_explanation}
            data-icon="1"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: edit ? "700%" : "500%",
                height: edit ? "420%" : "280%",
                top: edit ? "-450%" : "-280%",
                left: edit ? "-545%" : "-380%",
                padding: "0 0 10% 10%",
                opacity: !mouseOver[1] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ padding: "0 3% 48% 3%" }}
              >
                {edit
                  ? "Number of servings. If there isn't a unit you want to use in the selector, please select other and fill custom unit."
                  : "Number of servings of the recipe"}
              </p>
            </div>
            <Image
              src={"/servings.svg"}
              alt="servings icon"
              width={14}
              height={15}
            ></Image>
          </div>
          <input
            className={styles.input__brief_explanation}
            style={{ width: "17%" }}
            type="number"
            min="1"
            max={MAX_SERVINGS}
            name="servings"
            placeholder="Servings"
            value={servingsValue}
            onChange={onChangeServings}
          />
          {edit ? (
            <>
              <select
                className={styles.input__brief_explanation}
                style={{ width: "22%" }}
                name="servingsUnit"
                value={servingsUnit}
                onChange={(e) => handleChangeInput(e, 0)}
              >
                <option value="people">people</option>
                <option value="slices">slices</option>
                <option value="pieces">pieces</option>
                <option value="cups">cups</option>
                <option value="bowls">bowls</option>
                <option value="other">other</option>
              </select>
              <input
                className={styles.input__brief_explanation}
                style={{ width: "20%" }}
                name="servingsCustomUnit"
                placeholder="Custom unit"
                value={servingsCustomUnit}
                onChange={(e) => handleChangeInput(e, 0)}
              />
            </>
          ) : (
            <span style={{ width: "20%" }}>
              {servingsUnit !== "other" ? servingsUnit : servingsCustomUnit}
            </span>
          )}
        </div>
        <div className={styles.container__units}>
          {!edit && (
            <>
              <div
                className={styles.icons__brief_explanation}
                data-icon="2"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <div
                  className={styles.container__fukidashi}
                  style={{
                    width: "400%",
                    height: "250%",
                    top: "-260%",
                    left: "-300%",
                    paddingLeft: "10%",
                    opacity: !mouseOver[2] ? 0 : 1,
                  }}
                >
                  <p className={styles.p__fukidashi}>Unit system you prefer</p>
                </div>
                <Image
                  src={"/scale.svg"}
                  alt="ingredient units icon"
                  width={14}
                  height={16}
                ></Image>
              </div>
              <select
                className={styles.input__brief_explanation}
                style={{ width: "25%" }}
                name="region"
                value={ingredientsUnit}
                onChange={onChangeIngredientsUnit}
              >
                <option value="metric">Metric</option>
                <option value="us">US</option>
                <option value="japan">Japan</option>
                <option value="australia">Australia</option>
                <option value="metricCup">Metric cup (1cup = 250ml)</option>
              </select>
            </>
          )}

          <div
            className={styles.icons__brief_explanation}
            data-icon="3"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: edit ? "520%" : "490%",
                height: edit ? "360%" : "300%",
                top: edit ? "-380%" : "-300%",
                left: edit ? "-390%" : "-370%",
                paddingTop: "20%",
                opacity: !mouseOver[3] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ padding: "0 5% 57% 5%" }}
              >
                {edit
                  ? "Temperatures you use in the recipe (e.g. oven temperatures)"
                  : "Temperatures used in the recipe"}
              </p>
            </div>
            <Image
              src={"/temperature.svg"}
              alt="ingredient units icon"
              width={17}
              height={17}
            ></Image>
          </div>
          {edit ? (
            tempKeys.map((keyObj, i) => (
              <InputTemp
                key={keyObj.id}
                edit={edit}
                temperature={curRecipe.temperatures.temperatures[i]}
                temperatureUnit={temperatureUnit}
                i={i}
              />
            ))
          ) : (
            <span>{temperaturs}</span>
          )}
          <select
            className={styles.input__brief_explanation}
            style={{ width: "8%" }}
            name="temperatureUnit"
            value={temperatureUnit}
            onChange={(e) => handleChangeInput(e, 0)}
          >
            <option value="℃">℃</option>
            <option value="℉">℉</option>
          </select>
        </div>
      </div>
      <button
        style={{
          background: "none",
          backgroundImage: !favorite
            ? 'url("/star-off.png")'
            : 'url("/star-on.png")',
          width: "4.5%",
          aspectRatio: "1",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100%",
          border: "none",
        }}
        type="button"
        onClick={onClickFavorite}
      ></button>
    </div>
  );
}

function InputTemp({
  edit,
  temperature,
  temperatureUnit,
  i,
}: {
  edit: boolean;
  temperature: number;
  temperatureUnit: "℉" | "℃";
  i: number;
}) {
  const [temp, setTemp] = useState<number>(temperature);

  function handleChangeTemp(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.currentTarget.value;
    setTemp(value);
  }

  ///when temperature unit changes and user is not editing, convert temp
  useEffect(() => {
    if (edit || !temp) return;

    setTemp(convertTempUnits(temp, temperatureUnit === "℃" ? "℉" : "℃"));
  }, [temperatureUnit]);

  return (
    <input
      className={styles.input__brief_explanation}
      style={{ width: "14%", fontSize: "1.1vw" }}
      type="number"
      name={`temperature${i + 1}`}
      placeholder={`Temp ${i + 1}`}
      value={temp}
      onChange={handleChangeTemp}
    ></input>
  );
}

function Ingredients({
  edit,
  servingsValue,
  ingredients,
  ingredientsUnit,
}: {
  edit: boolean;
  servingsValue: number;
  ingredients: TYPE_INGREDIENTS;
  ingredientsUnit: "metric" | "us" | "japan" | "australia" | "metricCup";
}) {
  const [numberOfLines, setNumberOfLines] = useState(ingredients.length);
  const [lines, setLines] = useState<any[]>(
    Array(numberOfLines)
      .fill("")
      .map(() => {
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
    ///when line is added
    if (lines.length < numberOfLines)
      setLines((prev) => [...prev, { id: nanoid() }]);

    ///when line is deleted
    if (lines.length > numberOfLines)
      setLines((prev) => {
        if (!deletedIndex && deletedIndex !== 0) return prev;

        return prev.toSpliced(deletedIndex, 1);
      });
  }, [numberOfLines]);

  return (
    <div
      style={{
        position: "relative",
        width: "90%",
        height: "fit-content",
        backgroundColor: "rgb(255, 247, 177)",
        padding: "2%",
        borderRadius: "3px",
        overflowX: !edit ? "auto" : "visible",
      }}
    >
      <h2 className={styles.header}>Ingredients</h2>
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: edit ? "1fr" : "1fr 1fr",
          justifyItems: "left",
          marginTop: "2%",
          fontSize: "1.3vw",
          wordSpacing: "0.1vw",
          columnGap: "5%",
          rowGap: edit ? "15px" : "0px",
          paddingLeft: "0",
        }}
      >
        {lines.map((line, i) => (
          <IngLine
            key={line.id}
            edit={edit}
            servingsValue={servingsValue}
            ingredient={
              ingredients[i] || {
                ingredient: "",
                amount: 0,
                unit: "g",
                customUnit: "",
                id: undefined,
                convertion: undefined,
              }
            }
            ingredientsUnit={ingredientsUnit}
            i={i}
            onClickDelete={handleClickDelete}
          />
        ))}
        {edit && (
          <div className={styles.ingredients_line}>
            <ButtonPlus onClickBtn={handleClickPlus} />
          </div>
        )}
      </div>
    </div>
  );
}

function IngLine({
  edit,
  servingsValue,
  ingredient,
  ingredientsUnit,
  i,
  onClickDelete,
}: {
  edit: boolean;
  servingsValue: number;
  ingredient: TYPE_INGREDIENT;
  ingredientsUnit: "metric" | "us" | "japan" | "australia" | "metricCup";
  i: number;
  onClickDelete: (i: number) => void;
}) {
  const [line, setLine] = useState({
    ingredient: ingredient?.ingredient,
    amount: ingredient?.amount,
    unit: ingredient?.unit,
    customUnit: ingredient?.customUnit,
  });
  const [newIngredient, setNewIngredient] = useState<{
    amount: number;
    unit: string;
  }>({
    amount: ingredient.amount,
    unit: getReadableIngUnit(ingredient.unit, ingredient.customUnit),
  });

  function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.currentTarget;

    setLine((prev) => {
      const newLine = { ...prev };
      if (target.name.includes("Name")) newLine.ingredient = target.value;
      if (target.name.includes("Amount")) newLine.amount = +target.value;
      if (target.name.includes("Unit")) newLine.unit = target.value;
      if (target.name.includes("CustomUnit")) newLine.customUnit = target.value;
      return newLine;
    });
  }

  useEffect(() => {
    //Not applicable converted ingredients unit => ingrediet otherwise converted ingredient
    const newIngredient =
      edit || !ingredient?.convertion || !ingredient.convertion[ingredientsUnit]
        ? {
            amount: ingredient.amount,
            unit: getReadableIngUnit(ingredient.unit, ingredient.customUnit),
          }
        : ingredient.convertion[ingredientsUnit];

    setNewIngredient(newIngredient);
  }, [ingredient, servingsValue, ingredientsUnit]);

  return (
    <div
      className={styles.ingredients_line}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: edit ? "2%" : "4%",
        whiteSpace: "nowrap",
      }}
    >
      {edit ? (
        <>
          <button
            className={clsx(styles.btn__img, styles.btn__trash_img)}
            style={{ width: "3%", height: "80%", right: "-6%", top: "10%" }}
            type="button"
            onClick={() => onClickDelete(i)}
          ></button>
          <span style={{ fontSize: "1.5vw" }}>{i + 1}. </span>
          <input
            className={styles.input__brief_explanation}
            style={{ width: "30%" }}
            name={`ingredient${i + 1}Name`}
            placeholder={`Name ${i + 1}`}
            value={line.ingredient}
            onChange={handleChangeInput}
          ></input>
          <input
            className={styles.input__brief_explanation}
            style={{ width: "20%" }}
            type="number"
            name={`ingredient${i + 1}Amount`}
            placeholder="Amount"
            value={line.amount || ""}
            onChange={handleChangeInput}
          ></input>
          <select
            className={styles.input__brief_explanation}
            style={{ width: "20%" }}
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
            <option value="cupUS">cup (US)</option>
            <option value="cupJapan">cup (Japan)</option>
            <option value="cupImperial">cup (1cup = 250ml)</option>
            <option value="riceCup">rice cup</option>
            <option value="tsp">tsp</option>
            <option value="Tbsp">Tbsp</option>
            <option value="TbspAustralia">Tbsp (Australia)</option>
            <option value="other">Other</option>
            <option value="noUnit">No unit</option>
          </select>
          <input
            className={styles.input__brief_explanation}
            style={{ width: "20%" }}
            type="text"
            name={`ingredient${i + 1}CustomUnit`}
            placeholder="Custom unit"
            value={line.customUnit}
            onChange={handleChangeInput}
          />
        </>
      ) : (
        <>
          <input
            style={{ width: "1.3vw", marginLeft: "2%" }}
            type="checkbox"
          ></input>
          {newIngredient.amount !== 0 && (
            <span>
              {newIngredient.unit === "g" ||
              newIngredient.unit === "kg" ||
              newIngredient.unit === "oz" ||
              newIngredient.unit === "lb" ||
              newIngredient.unit === "ml" ||
              newIngredient.unit === "L"
                ? newIngredient.amount
                : fracty(newIngredient.amount)}
            </span>
          )}
          {newIngredient.unit && <span>{`${newIngredient.unit} of`}</span>}
          <span>{ingredient.ingredient}</span>
        </>
      )}
    </div>
  );
}

function ButtonPlus({ onClickBtn }: { onClickBtn: () => void }) {
  return (
    <button
      style={{
        fontWeight: "bold",
        fontSize: "1.2vw",
        width: "25px",
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

function Instructions({
  edit,
  instructions,
  images,
  addImage,
  deleteImage,
  onChangeImage,
  deleteInstruction,
}: {
  edit: boolean;
  instructions: { instruction: string; image: TYPE_FILE | undefined }[];
  images: (TYPE_FILE | undefined)[];
  addImage: () => void;
  deleteImage: (index: number) => void;
  onChangeImage: (image: TYPE_FILE, index: number) => void;
  deleteInstruction: (index: number) => void;
}) {
  //Store key so whenever user delete instruction, other instructions' info will remain the same
  const [recipeInstructions, setRecipeInstructions] = useState(
    Array(images.length)
      .fill("")
      .map(() => {
        return { id: nanoid() };
      })
  );
  const [deletedIndex, setDeletedIndex] = useState<number>();

  function handleClickDelete(i: number) {
    setDeletedIndex(i);
    deleteInstruction(i);
  }

  //manually add or splice key info to remain other instructions info
  useEffect(() => {
    //when user adds instruction
    if (recipeInstructions.length < images.length)
      setRecipeInstructions((prev) => [...prev, { id: nanoid() }]);

    //when user deletes instruction
    if (recipeInstructions.length > images.length)
      setRecipeInstructions((prev) => {
        if (!deletedIndex && deletedIndex !== 0) return prev;

        const newInstructions = [...prev];
        return newInstructions.toSpliced(deletedIndex, 1);
      });
  }, [images.length]);

  return (
    <div
      style={{
        position: "relative",
        top: "30px",
        width: "80%",
        height: "fit-content",
      }}
    >
      <h2 className={styles.header} style={{ marginBottom: "20px" }}>
        Instructions
      </h2>
      {recipeInstructions.map((inst, i) => (
        <Instruction
          key={inst.id}
          i={i}
          edit={edit}
          instruction={instructions[i]}
          image={images[i]}
          onClickDeleteImage={deleteImage}
          onClickDelete={handleClickDelete}
          onChangeImage={onChangeImage}
        />
      ))}
      {edit && (
        <div
          style={{
            width: "100%",
            height: "fit-content",
            backgroundColor: "rgba(255, 255, 236, 0.91)",
            paddingBottom: "2%",
          }}
        >
          <ButtonPlus onClickBtn={addImage} />
        </div>
      )}
    </div>
  );
}

function Instruction({
  edit,
  i,
  instruction,
  image,
  onClickDeleteImage,
  onClickDelete,
  onChangeImage,
}: {
  edit: boolean;
  i: number;
  instruction: { instruction: string; image: TYPE_FILE | undefined };
  image: TYPE_FILE | undefined;
  onClickDeleteImage: (i: number) => void;
  onClickDelete: (i: number) => void;
  onChangeImage: (image: TYPE_FILE, i: number) => void;
}) {
  const [instructionText, setInstructionText] = useState(
    instruction.instruction
  );
  async function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const files = e.currentTarget.files;
      if (!files) return;

      onChangeImage(await getFileData(files[0]), i);
    } catch (err: any) {
      console.error(err.message);
    }
  }

  function handleChangeInstruction(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    setInstructionText(value);
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        textAlign: "left",
        alignItems: "center",
        gap: "5%",
        width: "100%",
        height: "fit-content",
        backgroundColor: "rgba(255, 255, 236, 0.91)",
        padding: "4% 3%",
        fontSize: "1.2vw",
        letterSpacing: "0.05vw",
      }}
    >
      <span
        style={{
          position: "relative",
          top: "-35px",
          textAlign: "center",
          width: "25px",
          aspectRatio: "1",
          fontSize: "1.4vw",
          borderRadius: "50%",
          color: "white",
          backgroundColor: " #ce3a00e7 ",
        }}
      >
        {i + 1}
      </span>
      {edit ? (
        <textarea
          style={{
            width: "55%",
            height: "100px",
            fontSize: "1.2vw",
            letterSpacing: "0.03vw",
            padding: "0.3% 1%",
            resize: "none",
          }}
          name={`instruction${i + 1}`}
          placeholder={`Instruction ${i + 1}`}
          value={instructionText}
          onChange={handleChangeInstruction}
        ></textarea>
      ) : (
        <p
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: image ? "55%" : "100%",
            height: "100px",
            fontSize: "1.2vw",
            letterSpacing: "0.03vw",
            padding: image ? "0 1%" : "0 0 0 3%",
          }}
        >
          {instructionText}
        </p>
      )}
      <div
        style={{
          position: "relative",
          width: image || edit ? "140px" : "0",
          height: "100px",
        }}
      >
        {edit && !image?.data && (
          <div
            className={styles.grey_background}
            style={{ width: "100%", height: "100%" }}
          >
            <button
              className={clsx(styles.btn__img, styles.btn__upload_img)}
              style={{
                width: "20%",
                height: "30%",
                top: "30%",
                left: "40%",
              }}
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
        )}
        {image?.data && (
          <Image
            src={image.data}
            alt={`instruction ${i + 1} image`}
            width={140}
            height={100}
          ></Image>
        )}
        {edit && image?.data && (
          <button
            className={clsx(styles.btn__img, styles.btn__trash_img)}
            style={{
              right: "0",
              top: "101%",
              width: "18%",
              height: "18%",
            }}
            type="button"
            onClick={() => onClickDeleteImage(i)}
          ></button>
        )}
      </div>
      {edit && (
        <button
          className={clsx(styles.btn__img, styles.btn__trash_img)}
          style={{
            right: "-20%",
            top: "44%",
            width: "18%",
            height: "18%",
          }}
          type="button"
          onClick={() => onClickDelete(i)}
        ></button>
      )}
    </div>
  );
}

function AboutThisRecipe({
  edit,
  curRecipe,
}: {
  edit: boolean;
  curRecipe: TYPE_RECIPE;
}) {
  const [description, setDescription] = useState(curRecipe.description);

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
        marginTop: "70px",
      }}
    >
      <h2 className={styles.header}>About this recipe</h2>
      <div
        style={{
          backgroundColor:
            description || edit ? "rgb(255, 247, 133)" : "transparent",
          width: "85%",
          height: "130px",
          fontSize: "1.2vw",
          letterSpacing: "0.05vw",
          padding: "1.2% 1.5%",
          overflowY: edit ? "hidden" : "auto",
          scrollbarColor: "rgb(255, 247, 133) rgba(255, 209, 2, 1)",
        }}
      >
        {edit ? (
          <textarea
            style={{
              resize: "none",
              width: "100%",
              height: "100%",
              fontSize: "1.2vw",
              letterSpacing: "0.05vw",
              padding: "1.2% 1.5%",
              background: "none",
              border: "none",
            }}
            name="description"
            placeholder="Click here to set an explanation for the recipe"
            value={description}
            onChange={handleChangeDescription}
          ></textarea>
        ) : (
          <p
            className={description || styles.no_content}
            style={{
              width: "100%",
              height: "100%",
              fontSize: "1.3vw",
              letterSpacing: "0.05vw",
              padding: "1.2% 1.5%",
            }}
          >
            {description || "There's no description"}
          </p>
        )}
      </div>
    </div>
  );
}

function Memories({
  edit,
  images,
  onChangeImages,
  deleteImage,
}: {
  edit: boolean;
  images: [] | TYPE_FILE[];
  onChangeImages: (imagesArr: TYPE_FILE[]) => void;
  deleteImage: (i: number) => void;
}) {
  const [curImage, setCurImage] = useState(0);

  async function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const files = e.currentTarget.files;
      if (!files) return;

      const convertedFiles = await Promise.all(
        Array.from(files).map((image) => getFileData(image))
      );

      onChangeImages(convertedFiles);
    } catch (err: any) {
      console.error(err.message);
    }
  }

  function handleClickDot(i: number) {
    setCurImage(i);
  }

  function handleDeleteImg(i: number) {
    deleteImage(i);

    //if deleted img was the last img and not the only img, set curImg as one before the img, otherwise, one after the img
    setCurImage((prev) =>
      prev && images.length - 1 === prev ? prev - 1 : prev
    );
  }

  return (
    <div
      style={{
        marginTop: "40px",
        width: "60%",
        height: edit || images.length ? "250px" : "150px",
      }}
    >
      <h2 className={styles.header}>Memories of the recipe</h2>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "80%",
          overflow: "hidden",
        }}
      >
        {images.map((img, i) => (
          <MemoryImg
            key={i}
            edit={edit}
            i={i}
            image={img}
            translateX={calcTransitionXSlider(i, curImage)}
            onClickDelete={handleDeleteImg}
          />
        ))}
        {edit && (
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: calcTransitionXSlider(images.length, curImage),
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
                  width: "62%",
                  height: "18%",
                  top: "38%",
                  left: "25%",
                  fontSize: "1.5vw",
                  letterSpacing: "0.07vw",
                  color: "rgba(255, 168, 7, 1)",
                  fontWeight: "bold",
                }}
                type="button"
              >
                Upload images
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
        )}
        {edit || images.length ? (
          <div
            style={{
              position: "absolute",
              width: "70%",
              height: "5%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.7%",
              bottom: "5%",
            }}
          >
            {/* add one for upload slide for edit */}
            {edit
              ? [...images, ""].map((_, i) => (
                  <button
                    key={i}
                    style={{
                      opacity: "0.6",
                      width: "2.5%",
                      aspectRatio: "1",
                      backgroundColor:
                        curImage === i ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.3)",
                      borderRadius: "50%",
                      border: "none",
                    }}
                    type="button"
                    onClick={() => handleClickDot(i)}
                  ></button>
                ))
              : images.map((_, i) => (
                  <button
                    key={i}
                    style={{
                      opacity: "0.6",
                      width: "2.5%",
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
          <></>
        )}

        {!edit && !images.length && (
          <p className={styles.no_content}>There're no memory images</p>
        )}
      </div>
    </div>
  );
}

function MemoryImg({
  edit,
  i,
  image,
  translateX,
  onClickDelete,
}: {
  edit: boolean;
  i: number;
  image: TYPE_FILE;
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
      {edit && (
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
      )}
      {image && (
        <Image
          src={image.data}
          alt={`memory image ${i + 1}`}
          width={400}
          height={200}
        ></Image>
      )}
    </div>
  );
}

function Comments({
  edit,
  curRecipe,
}: {
  edit: boolean;
  curRecipe: TYPE_RECIPE;
}) {
  const [comments, setComments] = useState(curRecipe.comments);

  function handleChangeComments(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    setComments(value);
  }

  return (
    <div
      style={{
        marginTop: "30px",
        width: "70%",
        height: comments ? "200px" : "150px",
      }}
    >
      <h2 className={styles.header}> Comments</h2>
      <div
        style={{
          width: "100%",
          height: "70%",
          borderRadius: "1% / 3%",
          backgroundColor:
            edit || comments ? "rgb(255, 253, 222)" : "transparent",
        }}
      >
        {edit ? (
          <textarea
            style={{
              resize: "none",
              background: "none",
              border: "none",
              width: "100%",
              height: "100%",
              fontSize: "1.3vw",
              letterSpacing: "0.05vw",
              padding: "3%",
            }}
            name="comments"
            placeholder="Click here to set comments"
            value={comments}
            onChange={handleChangeComments}
          ></textarea>
        ) : (
          <p
            className={comments || styles.no_content}
            style={{
              width: "100%",
              height: "100%",
              fontSize: comments ? "1.3vw" : "1.4vw",
              letterSpacing: comments ? "0.05vw" : "0.03vw",
              padding: comments ? "3%" : "0",
              overflowY: "auto",
              textAlign: comments ? "left" : "center",
            }}
          >
            {comments || "There're no comments"}
          </p>
        )}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 174, 0, 1)",
        zIndex: "100",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "15%",
          width: "30%",
          height: "40%",
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: "1.8vw",
            letterSpacing: "0.08vw",
          }}
        >
          Updating your recipe...
        </p>
        <Image
          className={styles.img__uploading}
          src="/loading.png"
          alt="loading icon"
          width={150}
          height={150}
        ></Image>
      </div>
    </div>
  );
}
