"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import {
  recipes,
  getImageURL,
  convertIngUnits,
  convertTempUnits,
  getReadableIngUnit,
  calcTransitionXSlider,
  updateIngsForServings,
  updateConvertion,
} from "@/app/helper";
import {
  NUMBER_OF_TEMPERATURES,
  TYPE_INGREDIENT,
  TYPE_INGREDIENTS,
  TYPE_RECIPE,
} from "@/app/config";
import { nanoid } from "nanoid";
import fracty from "fracty";

export default function Recipe() {
  //recipe[0] for dev
  const [curRecipe, setCurRecipe] = useState<TYPE_RECIPE>();
  const [favorite, setFavorite] = useState<boolean>();
  const [edit, setEdit] = useState(false);
  //Use when edit is
  const [servingsValue, setServingsValue] = useState<number>();
  const [ingredientsUnit, setIngredientsUnit] = useState<
    "metric" | "us" | "japan" | "australia" | "metricCup"
  >();

  useEffect(() => {
    const id = window.location.hash.slice(1);
    console.log(id);
    const recipe = recipes.find((recipe) => recipe.id === id);
    if (!recipe) return console.error("No recipe found!");

    setCurRecipe(recipe);
    setFavorite(recipe.favorite);
    setServingsValue(recipe.servings.servings);
    setIngredientsUnit(recipe.region);
  }, []);

  function handleToggleEdit() {
    setEdit(!edit);
  }

  function handleClickFavorite() {
    setFavorite(!favorite);
  }

  // const updateIngsForServings = (servings: number, recipe: TYPE_RECIPE) => {
  //     const newIngs = recipe.ingredients.map(
  //       (ing: {
  //         ingredient: string;
  //         amount: number | string;
  //         unit: string;
  //         id: number;
  //       }) => {
  //         ///calclate ing for one serivng first then multiply it by new servings
  //         const newAmount =
  //           typeof ing.amount === "string"
  //             ? `${(1 / recipe.servings.servings) * servings} ${ing.amount}`
  //             : +((ing.amount / recipe.servings.servings) * servings).toFixed(
  //                 1
  //               );

  //         const newIng = { ...ing };
  //         newIng.amount = newAmount;
  //         return newIng;
  //       }
  //     );

  //     return newIngs; //array of updated ingredients for new servings
  //   };

  //only when edit is false
  function handleChangeServings(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = +e.currentTarget.value;
    setServingsValue(newValue);

    if (edit) return;
    setCurRecipe((prev: any) => {
      const newRecipe = { ...prev };
      newRecipe.ingredients = updateIngsForServings(newValue, recipes[0]);
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!edit || !curRecipe) return;

    const formData = new FormData(e.currentTarget);

    const data = {
      ...Object.fromEntries(formData),
      memoryImages: formData.getAll("memoryImages"),
    } as any;

    const dataArr = Object.entries(data);

    ///ingredients
    const numberOfIngredients = dataArr.filter(
      (arr) => arr[0].includes("ingredient") && arr[0].includes("Name")
    ).length;

    const ingredients = new Array(numberOfIngredients).fill("").map((_, i) => {
      const nameArr = dataArr.find((arr) =>
        arr[0].includes(`ingredient${i + 1}Name`)
      );
      const amountArr = dataArr.find((arr) =>
        arr[0].includes(`ingredient${i + 1}Amount`)
      );
      const unitArr = dataArr.find((arr) =>
        arr[0].includes(`ingredient${i + 1}Unit`)
      );
      const customUnitArr = dataArr.find((arr) =>
        arr[0].includes(`ingredient${i + 1}CustomUnit`)
      );
      if (!nameArr || !amountArr || !unitArr || !customUnitArr) return;
      if (
        typeof nameArr[1] !== "string" ||
        typeof customUnitArr[1] !== "string"
      )
        return;
      if (
        unitArr[1] !== "other" &&
        unitArr[1] !== "g" &&
        unitArr[1] !== "kg" &&
        unitArr[1] !== "oz" &&
        unitArr[1] !== "lb" &&
        unitArr[1] !== "ml" &&
        unitArr[1] !== "L" &&
        unitArr[1] !== "USCup" &&
        unitArr[1] !== "JapaneseCup" &&
        unitArr[1] !== "ImperialCup" &&
        unitArr[1] !== "riceCup" &&
        unitArr[1] !== "tsp" &&
        unitArr[1] !== "Tbsp" &&
        unitArr[1] !== "AustralianTbsp"
      )
        return;

      const amount = !amountArr[1] ? 0 : +amountArr[1];

      return {
        ingredient: nameArr[1].trim(),
        amount,
        unit: unitArr[1],
        cusomUnit: customUnitArr[1].trim(),
        id: "",
        convertion: convertIngUnits(amount, unitArr[1]),
      };
    });

    ///instructions
    const numberOfInstructions = dataArr.filter(
      (arr) => arr[0].includes("instruction") && arr[0].includes("Image")
    ).length;

    const instructions = new Array(numberOfInstructions)
      .fill("")
      .map((_, i) => {
        const instruction = dataArr.find(
          (arr) =>
            arr[0].includes(`instruction${i + 1}`) && !arr[0].includes("Image")
        );
        const image = dataArr.find(
          (arr) =>
            arr[0].includes(`instruction${i + 1}`) && arr[0].includes("Image")
        );
        if (!instruction || !image) return;
        if (typeof instruction[1] !== "string") return;

        return {
          instruction: instruction[1].trim(),
          image: getImageURL(image[1]),
        };
      });

    const editedRecipe = {
      id: curRecipe.id,
      favorite,
      mainImage: getImageURL(data.mainImage),
      title: data.title.trim(),
      author: data.author.trim(),
      servings: {
        servings: +data.servings,
        unit: data.servingsUnit,
        customUnit: data.servingsCustomUnit.trim(),
      },
      temperatures: {
        temperatures: [
          +data.temperature1 || "",
          +data.temperature2 || "",
          +data.temperature3 || "",
        ],
        unit: data.temperatureUnit,
      },
      ingredients,
      instructions,
      description: data.description.trim(),
      memoryImages: Array.from(data.memoryImages).map((file) =>
        getImageURL(file)
      ),
      comments: data.comments.trim(),
    };
    console.log(editedRecipe);

    //redirect to loading page
    redirect("/loading", RedirectType.replace);
  }
  return (
    curRecipe &&
    favorite !== undefined &&
    servingsValue &&
    ingredientsUnit && (
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
          <ImageTitle edit={edit} curRecipe={curRecipe} />
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
            ingredients={curRecipe.ingredients}
            ingredientsUnit={ingredientsUnit}
          />
          <Instructions edit={edit} curRecipe={curRecipe} />
          <AboutThisRecipe edit={edit} curRecipe={curRecipe} />
          <Memories edit={edit} curRecipe={curRecipe} />
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
      </div>
    )
  );
}

function ImageTitle({
  edit,
  curRecipe,
}: {
  edit: boolean;
  curRecipe: TYPE_RECIPE;
}) {
  const [image, setImage] = useState(curRecipe.mainImage);
  const [title, setTitle] = useState(curRecipe.title);

  function handleChangeImage(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;

    setImage(URL.createObjectURL(files[0]));
  }

  function handleDeleteImage() {
    setImage("");
  }

  function handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setTitle(value);
  }

  return (
    <div
      style={{
        position: "relative",
        width: "500px",
        height: "300px",
      }}
    >
      {!image ? (
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
              onClick={handleDeleteImage}
            ></button>
          )}
          <Image src={image} alt="main image" width={500} height={300}></Image>
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
            value={title}
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
            {title}
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
  //use when edit is true
  // const [servings, setServings] = useState(curRecipe.servings.servings);
  const [servingsUnit, setServingsUnit] = useState(curRecipe.servings.unit);
  const [servingsCustomUnit, setServingsCustomUnit] = useState(
    curRecipe.servings.customUnit
  );
  // const [region, setRegion] = useState(curRecipe.region);
  const [temperatures, setTemperatures] = useState<[] | number[]>(
    curRecipe.temperatures.temperatures
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    i: number
  ) {
    const target = e.currentTarget;
    const value = target.value;

    if (target.name === "author") setAuthour(value);
    if (target.name === "servingsUnit") setServingsUnit(value);
    if (target.name === "servingsCustomUnit") setServingsCustomUnit(value);
    // if (target.name === "region") setRegion(value);

    ///////local temp in inputtemp was no delay!!!! This provokes rendering when each letter is changed and can't keep typing smoothly
    if (target.name === `temperature${i + 1}`) {
      setTemperatures((prev) => {
        const newTemperatures = [...prev];
        return newTemperatures.fill(+value, i, i + 1);
      });
    }

    if (target.name === "temperatureUnit") {
      (value === "℉" || value === "℃") && handleChangeTempUnit(value);
    }
  }

  function handleChangeTempUnit(value: "℉" | "℃") {
    setTemperatureUnit(value);

    if (!temperatures.length) return;

    //set converted temperatures
    setTemperatures((prev: number[]) => {
      const newTemps = prev.map((temp) =>
        convertTempUnits(temp, value === "℃" ? "℉" : "℃")
      );
      return newTemps;
    });
  }

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
            max="500"
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
            Array(NUMBER_OF_TEMPERATURES)
              .fill("")
              .map((_, i) => (
                <InputTemp
                  key={nanoid()}
                  temperature={temperatures[i]}
                  i={i}
                  onChangeTemperature={handleChangeInput}
                />
              ))
          ) : (
            <span>{temperatures.join(" / ")}</span>
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
  temperature,
  i,
  onChangeTemperature,
}: {
  temperature: number;
  i: number;
  onChangeTemperature: (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number
  ) => void;
}) {
  // const [temp, setTemp] = useState(temperature);

  // function handleChangeTemp(e: React.ChangeEvent<HTMLInputElement>) {
  //   const value = +e.currentTarget.value;
  //   setTemp(value);
  // }

  return (
    <input
      className={styles.input__brief_explanation}
      style={{ width: "14%", fontSize: "1.1vw" }}
      type="number"
      name={`temperature${i + 1}`}
      placeholder={`Temp ${i + 1}`}
      value={temperature}
      onChange={(e) => onChangeTemperature(e, i)}
    ></input>
  );
}

function Ingredients({
  edit,
  ingredients,
  ingredientsUnit,
}: {
  edit: boolean;
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
    setLines((prev) => [...prev, { id: nanoid() }]);
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

        return [...prev].toSpliced(deletedIndex, 1);
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
            ingredient={
              ingredients[i] || {
                ingredient: "",
                amount: "",
                unit: "",
                customUnit: "",
                id: "",
                convertion: "",
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
  ingredient,
  ingredientsUnit,
  i,
  onClickDelete,
}: {
  edit: boolean;
  ingredient: TYPE_INGREDIENT;
  ingredientsUnit: "metric" | "us" | "japan" | "australia" | "metricCup";
  i: number;
  onClickDelete: (i: number) => void;
}) {
  const [line, setLine] = useState(ingredient);

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

  //amount is string or no applicable converted ingredients unit => ingrediet otherwise converted ingredient
  const getNewIng = () =>
    typeof ingredient.amount === "string" ||
    !ingredient.convertion[ingredientsUnit]
      ? ingredient
      : ingredient.convertion[ingredientsUnit];

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
          <span>
            {typeof getNewIng().amount === "string" ||
            getNewIng().unit === "g" ||
            getNewIng().unit === "kg" ||
            getNewIng().unit === "oz" ||
            getNewIng().unit === "lb" ||
            getNewIng().unit === "ml" ||
            getNewIng().unit === "L"
              ? getNewIng().amount
              : fracty(getNewIng().amount)}
          </span>
          <span>{`${getNewIng().unit} of`}</span>
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
  curRecipe,
}: {
  edit: boolean;
  curRecipe: TYPE_RECIPE;
}) {
  const [numberOfInstructions, setNumberOfInstructions] = useState(
    curRecipe.instructions.length
  );
  //Store key so whenever user delete instruction, other instructions' info will remain the same
  const [instructions, setInstructions] = useState(
    Array(numberOfInstructions)
      .fill("")
      .map(() => {
        return { id: nanoid() };
      })
  );
  const [deletedIndex, setDeletedIndex] = useState<number>();

  function handleClickPlus() {
    setNumberOfInstructions((prev) => prev + 1);
    setInstructions((prev) => [...prev, { id: nanoid() }]);
  }

  function handleClickDelete(i: number) {
    setDeletedIndex(i);
    setNumberOfInstructions((prev) => prev - 1);
  }

  //manually add or splice key info to remain other instructions info
  useEffect(() => {
    //when user adds instruction
    if (instructions.length < numberOfInstructions)
      setInstructions((prev) => [...prev, { id: nanoid() }]);

    //when user deletes instruction
    if (instructions.length > numberOfInstructions)
      setInstructions((prev) => {
        if (!deletedIndex && deletedIndex !== 0) return prev;

        const newInstructions = [...prev];
        return newInstructions.toSpliced(deletedIndex, 1);
      });
  }, [numberOfInstructions]);

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
      {instructions.map((inst, i) => (
        <Instruction
          key={inst.id}
          edit={edit}
          instruction={
            curRecipe.instructions[i] || {
              instruction: "",
              image: "",
            }
          }
          i={i}
          onClickDelete={handleClickDelete}
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
          <ButtonPlus onClickBtn={handleClickPlus} />
        </div>
      )}
    </div>
  );
}

function Instruction({
  edit,
  instruction,
  i,
  onClickDelete,
}: {
  edit: boolean;
  instruction: { instruction: string; image: string };
  i: number;
  onClickDelete: (i: number) => void;
}) {
  const [instructionText, setInstructionText] = useState(
    instruction.instruction
  );
  const [image, setImage] = useState<string>(instruction.image);

  function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;

    setImage(URL.createObjectURL(files[0]));
  }

  function handleDeleteImg() {
    setImage("");
  }

  function handleChangeInstruction(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    setInstructionText(value);
  }

  console.log(edit, !image);

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
            // backgroundColor: "blue",
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
        {edit && !image && (
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
        {image && (
          <Image
            src={image}
            alt={`instruction ${i + 1} image`}
            width={140}
            height={100}
          ></Image>
        )}
        {edit && image && (
          <button
            className={clsx(styles.btn__img, styles.btn__trash_img)}
            style={{
              right: "0",
              top: "101%",
              width: "18%",
              height: "18%",
            }}
            type="button"
            onClick={handleDeleteImg}
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
          backgroundColor: "rgb(255, 247, 133)",
          width: "85%",
          height: "130px",
          fontSize: "1.2vw",
          letterSpacing: "0.05vw",
          padding: "1.2% 1.5%",
          overflowY: "auto",
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
            style={{
              width: "100%",
              height: "100%",
              fontSize: "1.3vw",
              letterSpacing: "0.05vw",
              padding: "1.2% 1.5%",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function Memories({
  edit,
  curRecipe,
}: {
  edit: boolean;
  curRecipe: TYPE_RECIPE;
}) {
  const [images, setImages] = useState<string[]>(curRecipe.memoryImages);
  const [curImage, setCurImage] = useState(0);

  function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;

    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...urls]);
  }

  function handleClickDot(i: number) {
    setCurImage(i);
  }

  function handleDeleteImg(i: number) {
    setImages((prev) => {
      const newImgs = [...prev];
      return newImgs.toSpliced(i, 1);
    });
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
        {images.length ? (
          images.map((img, i) => (
            <MemoryImg
              key={nanoid()}
              edit={edit}
              i={i}
              image={img}
              translateX={calcTransitionXSlider(i, curImage)}
              onClickDelete={handleDeleteImg}
            />
          ))
        ) : (
          <></>
        )}
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
                    key={nanoid()}
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
                    key={nanoid()}
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
  image: string;
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
          src={image}
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
          backgroundColor: edit || comments ? "rgb(255, 253, 222)" : "none",
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
            {comments ? comments : "There're no comments"}
          </p>
        )}
      </div>
    </div>
  );
}
