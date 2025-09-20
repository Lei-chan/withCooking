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
  getReadableIngUnit,
  calcTransitionXSlider,
} from "@/app/helper";
import { NUMBER_OF_TEMPERATURES, TYPE_RECIPE } from "@/app/config";
import { nanoid } from "nanoid";

export default function Recipe() {
  const recipe = recipes[0]; //for dev

  const [favorite, setFavorite] = useState(recipe.favorite);
  const [edit, setEdit] = useState(false);

  function handleClickFavorite() {
    setFavorite(!favorite);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!edit) return;

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
        unitArr[1] !== "" &&
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
      id: recipe.id,
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
    <div
      style={{
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
        <ImageTitle edit={edit} recipe={recipe} />
        <BriefExplanation
          edit={edit}
          recipe={recipe}
          favorite={favorite}
          onClickFavorite={handleClickFavorite}
        />
        <Ingredients edit={edit} recipe={recipe} />
        <Instructions edit={edit} recipe={recipe} />
        <AboutThisRecipe edit={edit} recipe={recipe} />
        <Memories edit={edit} recipe={recipe} />
        <Comments edit={edit} recipe={recipe} />

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
  );
}

function ImageTitle({ edit, recipe }: { edit: boolean; recipe: TYPE_RECIPE }) {
  const [image, setImage] = useState(recipe.mainImage);
  const [title, setTitle] = useState(recipe.title);

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
          top: "-25%",
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
  recipe,
  favorite,
  onClickFavorite,
}: {
  edit: boolean;
  recipe: TYPE_RECIPE;
  favorite: boolean;
  onClickFavorite: () => void;
}) {
  const [mouseOver, setMouseOver] = useState([false, false, false, false]);
  const [author, setAuthour] = useState(recipe.author);
  const [servings, setServings] = useState(recipe.servings.servings);
  const [servingsUnit, setServingsUnit] = useState(recipe.servings.unit);
  const [servingsCustomUnit, setServingsCustomUnit] = useState(
    recipe.servings.customUnit
  );
  const [region, setRegion] = useState(recipe.region);
  const [temperatureUnit, setTemperatureUnit] = useState(
    recipe.temperatures.unit
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
    if (target.name === "servingsUnit") setServingsUnit(value);
    if (target.name === "servingsCustomUnit") setServingsCustomUnit(value);
    if (target.name === "region") setRegion(value);
    if (target.name === "temperatureUnit") setTemperatureUnit(value);
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
                width: "500%",
                height: "300%",
                top: "-330%",
                left: "-360%",
                opacity: !mouseOver[0] ? 0 : 1,
              }}
            >
              <p className={styles.p__fukidashi}>
                Name of the person who will make the recipe
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
              onChange={handleChangeInput}
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
                width: "700%",
                height: "420%",
                top: "-450%",
                left: "-545%",
                opacity: !mouseOver[1] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ padding: "0 3% 48% 3%" }}
              >
                Number of servings. If there isn't a unit you want to use in the
                selector, please select other and fill custom unit.
              </p>
            </div>
            <Image
              src={"/servings.svg"}
              alt="servings icon"
              width={14}
              height={15}
            ></Image>
          </div>
          {edit ? (
            <input
              className={styles.input__brief_explanation}
              style={{ width: "17%" }}
              type="number"
              min="1"
              max="500"
              name="servings"
              placeholder="Servings"
              value={servings}
              onChange={handleChangeInput}
            />
          ) : (
            <span style={{ width: "17%" }}>{servings}</span>
          )}
          <select
            className={styles.input__brief_explanation}
            style={{ width: "22%" }}
            name="servingsUnit"
            value={servingsUnit}
            onChange={handleChangeInput}
          >
            <option value="people">people</option>
            <option value="slices">slices</option>
            <option value="pieces">pieces</option>
            <option value="cups">cups</option>
            <option value="bowls">bowls</option>
            <option value="other">other</option>
          </select>
          {edit ? (
            <input
              className={styles.input__brief_explanation}
              style={{ width: "20%" }}
              name="servingsCustomUnit"
              placeholder="Custom unit"
              value={servingsCustomUnit}
              onChange={handleChangeInput}
            />
          ) : (
            <span style={{ width: "20%" }}>{servingsCustomUnit}</span>
          )}
        </div>
        <div className={styles.container__units}>
          <div
            className={styles.icons__brief_explanation}
            data-icon="2"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: "500%",
                height: "330%",
                top: "-350%",
                left: "-360%",
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
            value={region}
            onChange={handleChangeInput}
          >
            <option value="metric">Metric</option>
            <option value="us">US</option>
            <option value="japan">Japan</option>
            <option value="australia">Australia</option>
            <option value="metricCup">Metric cup (1cup = 250ml)</option>
          </select>

          <div
            className={styles.icons__brief_explanation}
            data-icon="3"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <div
              className={styles.container__fukidashi}
              style={{
                width: "520%",
                height: "360%",
                top: "-380%",
                left: "-390%",
                opacity: !mouseOver[3] ? 0 : 1,
              }}
            >
              <p
                className={styles.p__fukidashi}
                style={{ padding: "0 5% 57% 5%" }}
              >
                Temperatures you use in the recipe (e.g. oven temperatures)
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
                  temperature={recipe.temperatures.temperatures[i]}
                  i={i}
                />
              ))
          ) : (
            <span>{recipe.temperatures.temperatures.join(" / ")}</span>
          )}
          <select
            className={styles.input__brief_explanation}
            style={{ width: "8%" }}
            name="temperatureUnit"
            value={temperatureUnit}
            onChange={handleChangeInput}
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

function InputTemp({ temperature, i }: { temperature: number; i: number }) {
  const [temp, setTemp] = useState(temperature);

  function handleChangeTemp(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.currentTarget.value;
    setTemp(value);
  }

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

function Ingredients({ edit, recipe }: { edit: boolean; recipe: TYPE_RECIPE }) {
  const [numberOfLines, setNumberOfLines] = useState(recipe.ingredients.length);
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
          rowGap: "15px",
          paddingLeft: edit ? "7%" : "0",
        }}
      >
        {lines.map((line, i) => (
          <IngLine
            key={line.id}
            edit={edit}
            ingredient={recipe.ingredients[i]}
            i={i}
            onClickDelete={handleClickDelete}
          />
        ))}
        <div className={styles.ingredients_line}>
          <ButtonPlus onClickBtn={handleClickPlus} />
        </div>
      </div>
    </div>
  );
}

function IngLine({
  edit,
  ingredient,
  i,
  onClickDelete,
}: {
  ingredient: {
    ingredient: string;
    amount: number;
    unit: string;
    customUnit: string;
  };
  edit: boolean;
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
        style={{ width: "3%", height: "80%", right: "-6%", top: "10%" }}
        type="button"
        onClick={() => onClickDelete(i)}
      ></button>
      <span style={{ fontSize: "1.5vw" }}>{i + 1}. </span>
      {edit ? (
        <input
          className={styles.input__brief_explanation}
          style={{ width: "30%" }}
          name={`ingredient${i + 1}Name`}
          placeholder={`Name ${i + 1}`}
          value={line.ingredient}
          onChange={handleChangeInput}
        ></input>
      ) : (
        <span>{line.ingredient}</span>
      )}
      {edit ? (
        <input
          className={styles.input__brief_explanation}
          style={{ width: "20%" }}
          type="number"
          name={`ingredient${i + 1}Amount`}
          placeholder="Amount"
          value={line.amount || ""}
          onChange={handleChangeInput}
        ></input>
      ) : (
        <span>{line.amount}</span>
      )}
      {edit ? (
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
      ) : (
        <span>{getReadableIngUnit(line.unit, line.customUnit)}</span>
      )}
      {edit && (
        <input
          className={styles.input__brief_explanation}
          style={{ width: "20%" }}
          type="text"
          name={`ingredient${i + 1}CustomUnit`}
          placeholder="Custom unit"
          value={line.customUnit}
          onChange={handleChangeInput}
        />
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
  recipe,
}: {
  edit: boolean;
  recipe: TYPE_RECIPE;
}) {
  const [numberOfInstructions, setNumberOfInstructions] = useState(
    recipe.instructions.length
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
          instruction={recipe.instructions[i]}
          i={i}
          onClickDelete={handleClickDelete}
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
        <ButtonPlus onClickBtn={handleClickPlus} />
      </div>
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
        <p>{instructionText}</p>
      )}
      <div style={{ position: "relative", width: "140px", height: "100px" }}>
        {!image ? (
          <div
            className={styles.grey_background}
            style={{ width: "100%", height: "100%" }}
          >
            {edit && (
              <>
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
              </>
            )}
          </div>
        ) : (
          <>
            <Image
              src={image}
              alt={`instruction ${i + 1} image`}
              width={140}
              height={100}
            ></Image>
            {edit && (
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
          </>
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
  recipe,
}: {
  edit: boolean;
  recipe: TYPE_RECIPE;
}) {
  const [description, setDescription] = useState(recipe.description);

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
          overflowY: "auto",
          width: "85%",
          height: "130px",
          fontSize: "1.2vw",
          letterSpacing: "0.05vw",
          padding: "1.2% 1.5%",
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
              fontSize: "1.2vw",
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

function Memories({ edit, recipe }: { edit: boolean; recipe: TYPE_RECIPE }) {
  const [images, setImages] = useState<string[]>(recipe.memoryImages);
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
        height: "250px",
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
            key={nanoid()}
            edit={edit}
            i={i}
            image={img}
            translateX={calcTransitionXSlider(i, curImage)}
            onClickDelete={handleDeleteImg}
          />
        ))}
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
            {edit && (
              <>
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
              </>
            )}
          </div>
        </div>
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

function Comments({ edit, recipe }: { edit: boolean; recipe: TYPE_RECIPE }) {
  const [comments, setComments] = useState(recipe.comments);

  function handleChangeComments(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    setComments(value);
  }

  return (
    <div style={{ marginTop: "30px", width: "70%", height: "200px" }}>
      <h2 className={styles.header}> Comments</h2>
      <div
        style={{
          width: "100%",
          height: "70%",
          borderRadius: "1% / 3%",
          backgroundColor: "rgb(255, 253, 222)",
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
            style={{
              width: "100%",
              height: "100%",
              fontSize: "1.3vw",
              letterSpacing: "0.05vw",
              padding: "3%",
              overflowY: "auto",
              textAlign: "left",
            }}
          >
            {comments}
          </p>
        )}
      </div>
    </div>
  );
}
