"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { relative } from "path";
import {
  calcTransitionXSlider,
  convertIngUnits,
  getImageURL,
  getRegion,
  recipes,
} from "@/app/helper";

/////get rid of grey image and replace it with grey background
export default function CreateRecipe() {
  const [favorite, setFavorite] = useState(false);

  function handleClickFavorite() {
    setFavorite(!favorite);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

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

    const newRecipe = {
      id: nanoid(),
      favorite,
      mainImage: getImageURL(data.mainImage),
      title: data.title.trim(),
      author: data.author.trim(),
      region: getRegion(ingredients),
      servings: {
        servings: +data.servings,
        unit: data.servingsUnit,
        customUnit: data.servingsCustomUnit.trim(),
      },
      temperatures: {
        temperatures: [
          +data.temperature1,
          +data.temperature2,
          +data.temperature3,
          +data.temperature4,
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
    console.log(newRecipe);

    //redirect to loading page
    // redirect("/loading", RedirectType.replace);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backgroundImage:
          "linear-gradient(rgba(255, 241, 117, 1), rgba(255, 190, 117, 1))",
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
        <ImageTitle />
        <BriefExplanation
          favorite={favorite}
          onClickFavorite={handleClickFavorite}
        />
        <Ingredients />
        <Instructions />
        <AboutThisRecipe />
        <Memories />
        <Comments />

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
        <button className={styles.btn__upload_recipe} type="submit">
          Upload
        </button>
      </form>
    </div>
  );
}

function ImageTitle() {
  const [image, setImage] = useState("");

  function handleChangeImage(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;

    setImage(URL.createObjectURL(files[0]));
  }

  function handleDeleteImage() {
    setImage("");
  }

  return (
    <div
      style={{
        position: "relative",
        width: "500px",
        height: "300px",
      }}
    >
      <button
        className={clsx(styles.btn__img, styles.btn__trash_img)}
        style={{
          right: "-8%",
          width: "7%",
          height: "9%",
          opacity: image ? 1 : 0,
        }}
        type="button"
        onClick={handleDeleteImage}
      ></button>
      {!image ? (
        <div
          className={styles.grey_background}
          style={{ width: "500px", height: "300px" }}
        >
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
        </div>
      ) : (
        <Image src={image} alt="main image" width={500} height={300}></Image>
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
          letterSpacing: "0.1vw",
          padding: "1% 3.5%",
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
            fontSize: "2.1vw",
            textAlign: "center",
          }}
          name="title"
          placeholder="Click here to set title"
        ></input>
      </div>
    </div>
  );
}

function BriefExplanation({
  favorite,
  onClickFavorite,
}: {
  favorite: boolean;
  onClickFavorite: () => void;
}) {
  const [mouseOver, setMouseOver] = useState([false, false, false]);

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
          <input
            className={styles.input__brief_explanation}
            style={{ width: "19%" }}
            name="author"
            placeholder="Author"
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
          <input
            className={styles.input__brief_explanation}
            style={{ width: "17%" }}
            type="number"
            min="1"
            max="500"
            name="servings"
            placeholder="Servings"
          />
          <select
            className={styles.input__brief_explanation}
            style={{ width: "22%" }}
            name="servingsUnit"
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
          />
        </div>
        <div className={styles.container__units}>
          {/* <div
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
            name="IngredientsUnit"
          >
            <option value="metric">Metric</option>
            <option value="us">US</option>
            <option value="japan">Japan</option>
            <option value="australia">Australia</option>
            <option value="metricCup">Metric cup (1cup = 250ml)</option>
          </select> */}

          <div
            className={styles.icons__brief_explanation}
            data-icon="2"
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
                opacity: !mouseOver[2] ? 0 : 1,
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
          {Array(4)
            .fill("")
            .map((_, i) => (
              <InputTemp key={nanoid()} i={i} />
            ))}
          <select
            className={styles.input__brief_explanation}
            style={{ width: "8%" }}
            name="temperatureUnit"
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

function InputTemp({ i }: { i: number }) {
  return (
    <input
      className={styles.input__brief_explanation}
      style={{ width: "14%", fontSize: "1.1vw" }}
      type="number"
      name={`temperature${i + 1}`}
      placeholder={`Temp ${i + 1}`}
    ></input>
  );
}

function Ingredients() {
  // const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
  const [numberOfLines, setNumberOfLines] = useState(1);
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
          // gridTemplateColumns: "1fr 1fr",
          gridTemplateColumns: "1fr",
          justifyItems: "left",
          marginTop: "2%",
          fontSize: "1.3vw",
          wordSpacing: "0.1vw",
          columnGap: "5%",
          rowGap: "15px",
          // paddingLeft: "7%",
        }}
      >
        {lines.map((line, i) => (
          <IngLine key={line.id} i={i} onClickDelete={handleClickDelete} />
        ))}
        <div className={styles.ingredients_line}>
          <ButtonPlus onClickBtn={handleClickPlus} />
        </div>

        {/* {recipe.ingredients.map((ing: any) => {
                const newIng = ing.convertion[ingredientsUnit]
                  ? ing.convertion[ingredientsUnit]
                  : ing;

                return (
                  <div key={nanoid()} style={{width: '100%',
  height: 'fit-content',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'left',}}>
                    <input type="checkbox" />
                    <span>
                      {" "}
                      {typeof newIng.amount === "string" ||
                      newIng.unit === "g" ||
                      newIng.unit === "kg" ||
                      newIng.unit === "oz" ||
                      newIng.unit === "lb" ||
                      newIng.unit === "ml" ||
                      newIng.unit === "L"
                        ? newIng.amount
                        : fracty(newIng.amount)}{" "}
                      {newIng.unit} of {ing.ingredient}
                    </span>
                  </div>
                );
              })} */}
      </div>
    </div>
  );
}

function IngLine({
  i,
  onClickDelete,
}: {
  i: number;
  onClickDelete: (i: number) => void;
}) {
  const [line, setLine] = useState({
    name: "",
    amount: 0,
    unit: "",
    customUnit: "",
  });

  function handleChangeInput(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.currentTarget;

    setLine((prev) => {
      const newLine = { ...prev };
      if (target.name.includes("Name")) newLine.name = target.value;
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
      <input
        className={styles.input__brief_explanation}
        style={{ width: "30%" }}
        name={`ingredient${i + 1}Name`}
        placeholder={`Name ${i + 1}`}
        value={line.name}
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
        value={line.unit || "g"}
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

function Instructions() {
  const [numberOfInstructions, setNumberOfInstructions] = useState(1);
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
        <Instruction key={inst.id} i={i} onClickDelete={handleClickDelete} />
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

      {/* {recipe.instructions.map((step: any, i: number) => (
              <div key={nanoid()} style={{width: '100%',
    height: 'fit-content',
    border: 'thin solid rgb(255, 174, 0)',
    padding: '3%',
    fontSize: '1.2vw',
    letterSpacing: '0.05vw'}}>
                <div styles={{ textAlign: 'left',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '3%',}}>
                  <p style={{whiteSpace: 'nowrap'}}>
                    <span style={{ fontSize: '1.4vw',
  borderRadius: '50%',
  padding: '0 2%',
  color: 'aliceblue',
  backgroundColor:'rgb(0, 132, 255)',}}>{i + 1}</span> {step.instruction}
                  </p>
                  {step.image && (
                    <Image
                      src={step.image || "/grey-img.png"}
                      alt={`step ${i + 1} image`}
                      width={100}
                      height={80}
                    ></Image>
                  )}
                </div>
              </div>
            ))} */}
    </div>
  );
}

function Instruction({
  i,
  onClickDelete,
}: {
  i: number;
  onClickDelete: (i: number) => void;
}) {
  const [img, setImg] = useState<string>();

  function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;

    setImg(URL.createObjectURL(files[0]));
  }

  function handleDeleteImg() {
    setImg("");
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
      ></textarea>
      <div style={{ position: "relative", width: "140px", height: "100px" }}>
        {!img ? (
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
              src={img}
              alt={`instruction ${i + 1} image`}
              width={140}
              height={100}
            ></Image>
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
          </>
        )}
      </div>
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
    </div>
  );
}

function AboutThisRecipe() {
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
          // overflowY: "auto",
          width: "85%",
          height: "130px",
          fontSize: "1.2vw",
          letterSpacing: "0.05vw",
          padding: "1.2% 1.5%",
        }}
      >
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
        ></textarea>
      </div>
    </div>
  );
}

function Memories() {
  const [imgs, setImgs] = useState<string[]>([]);
  //default is upload slide
  const [curImg, setCurImg] = useState(0);

  function handleChangeImg(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;

    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setImgs((prev) => [...prev, ...urls]);
  }

  function handleClickDot(i: number) {
    setCurImg(i);
  }

  function handleDeleteImg(i: number) {
    setImgs((prev) => {
      const newImgs = [...prev];
      return newImgs.toSpliced(i, 1);
    });
    //if deleted img was the last img and not the only img, set curImg as one before the img, otherwise, one after the img
    setCurImg((prev) => (prev && imgs.length - 1 === prev ? prev - 1 : prev));
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
        {imgs.map((img, i) => (
          <MemoryImg
            key={nanoid()}
            i={i}
            img={img}
            translateX={calcTransitionXSlider(i, curImg)}
            onClickDelete={handleDeleteImg}
          />
        ))}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: calcTransitionXSlider(imgs.length, curImg),
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

        {/* {recipe.memoryImages.map((img: string, i: number) => (
                  <img
                    key={nanoid()}
                    src={img || "/grey-img.png"}
                    alt={`memory image${i + 1}`}
                    style={{
                      transform: calcTransitionXSlider(i),
                    }}
                  ></img>
                ))} */}
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
          {/* add one for upload slide */}
          {[...imgs, ""].map((_, i) => (
            <button
              key={nanoid()}
              style={{
                opacity: "0.6",
                width: "2.5%",
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
          {/* {recipe.memoryImages.map((_: any, i: number) => (
                    <button
                      key={nanoid()}
                      className={styles.btn__dot}
                      style={{ opacity: i === curSlide ? "0.6" : "0.3" }}
                      onClick={() => handleClickDots(i)}
                    ></button>
                  ))} */}
        </div>
      </div>
    </div>
  );
}

function MemoryImg({
  i,
  img,
  translateX,
  onClickDelete,
}: {
  i: number;
  img: string;
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
        src={img}
        alt={`memory image ${i + 1}`}
        width={400}
        height={200}
      ></Image>
    </div>
  );
}

function Comments() {
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
        ></textarea>
        {/* <div
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          textAlign: "left",
          fontSize: "1.3vw",
          letterSpacing: "0.05vw",
          padding: "3%",
        }}
        contentEditable="true"
        defaultValue="Use this space for free :)"
      >
        {}
      </div> */}
      </div>
    </div>
  );
}

{
  /* <div className={clsx(styles.overlay__create_recipe)}>
      <button className={styles.btn__x} type="button">
        &times;
      </button>
      <form className={styles.form__create_recipe}>
        <h2>Let's create a recipe!</h2>
        <div className={styles.container__input_line}>
          <span className={styles.main_img}>Main Image</span>
          <input id={styles.input__main_image} type="file" accept="image/*" />
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.title}>Recipe Title</span>
          <input
            id={styles.input__title}
            type="text"
            placeholder="Your Recipe Title"
          />
        </div>
        <div className={styles.container__input_line}>
          <span style={{paddingRight: '5%'}}>Author</span>
          <input
            id={styles.input__author}
            type="text"
            placeholder="This recipe's author"
          />
        </div>
        <p>Select a servings unit or type a custom unit</p>
        <div className={styles.container__input_line}>
          <span className={styles.servings}>Servings</span>
          <input
            id={styles.input__servings}
            type="number"
            min="1"
            max="500"
            placeholder="Servings"
          />
          <select id={styles.select__servings_unit}>
            <option value="people">people</option>
            <option value="slices">slices</option>
            <option value="pieces">pieces</option>
            <option value="cups">cups</option>
            <option value="bowls">bowls</option>
          </select>
          <input
            id={styles.input__servings_unit_other}
            placeholder="Other unit"
          />
        </div>
        <p>
          Type temperatures the recipe uses and select the unit (e.g. Oven
          temperature)
        </p>
        <div className={styles.container__input_line}>
          <span className={styles.temperature}>Temperature (optional)</span>
          <input
            className={styles.input__temperature}
            id="input__temperature1"
            type="number"
            placeholder="Temp 1"
          />
          <input
            className={styles.input__temperature}
            id="input__temperature2"
            type="number"
            placeholder="Temp 2"
          />
          <input
            className={styles.input__temperature}
            id="input__temperature3"
            type="number"
            placeholder="Temp 3"
          />
          <input
            className={styles.input__temperature}
            id="input__temperature4"
            type="number"
            placeholder="Temp 4"
          />
          <select id={styles.select__temperature_unit}>
            <option value="℉">℉</option>
            <option value="℃">℃</option>
          </select>
        </div>
        <p>Select a unit or type a custom unit</p>
        <div className={styles.container__input_line}>
          <span className={styles.ingredient}>Ingredient 1</span>
          <input
            className={styles.input__ingredient}
            id="input__ingredient1"
            type="text"
            placeholder="Ingredient 1"
          />
          <input
            className={styles.input__ingredient_amount}
            id="input__ingredient1_amount"
            type="text"
            placeholder="Amount"
          />
          <select
            className={styles.select__ingredient_unit}
            id="select__ingredient1_unit"
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
            <option value="noUnit">No unit</option>
          </select>
          <input
            className={styles.input__ingredient_other}
            id="input__ingredient1_other_unit"
            type="text"
            placeholder="Other unit"
          />
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.ingredient}>Ingredient 2</span>
          <input
            className={styles.input__ingredient}
            id="input__ingredient2"
            type="text"
            placeholder="Ingredient 2"
          />
          <input
            className={styles.input__ingredient_amount}
            id="input__ingredient2_amount"
            type="text"
            placeholder="Amount"
          />
          <select
            className={styles.select__ingredient_unit}
            id="select__ingredient2_unit"
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
            <option value="noUnit">No unit</option>
          </select>
          <input
            className={styles.input__ingredient_other}
            id="input__ingredient2_other_unit"
            type="text"
            placeholder="Other unit"
          />
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.ingredient}>Ingredient 3</span>
          <input
            className={styles.input__ingredient}
            id="input__ingredient3"
            type="text"
            placeholder="Ingredient 3"
          />
          <input
            className={styles.input__ingredient_amount}
            id="input__ingredient3_amount"
            type="text"
            placeholder="Amount"
          />
          <select
            className={styles.select__ingredient_unit}
            id="select__ingredient3_unit"
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
            <option value="noUnit">No unit</option>
          </select>
          <input
            className={styles.input__ingredient_other}
            id="input__ingredient3_other_unit"
            type="text"
            placeholder="Other unit"
          />
        </div>
        <div className={styles.container__btn_add}>
          <button className={styles.btn__add} type="button">
            +
          </button>
        </div>
        <p>Uploading images are optional</p>
        <div className={styles.container__input_line}>
          <span className={styles.step}>Step 1</span>
          <textarea id="textarea__step1" placeholder="Description"></textarea>
          <input id="input__step1_img" type="file" accept="image/*" />
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.step}>Step 1</span>
          <textarea id="textarea__step1" placeholder="Description"></textarea>
          <input id="input__step1_img" type="file" accept="image/*" />
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.step}>Step 1</span>
          <textarea id="textarea__step1" placeholder="Description"></textarea>
          <input id="input__step1_img" type="file" accept="image/*" />
        </div>
        <div className={styles.container__btn_add}>
          <button className={styles.btn__add} type="button">
            +
          </button>
        </div>
        <div
          className={clsx(
            styles.container__input_line,
            styles.container__input_line_recipe_description
          )}
        >
          <span className={styles.recipe_description}>
            About This Recipe (optional)
          </span>
          <textarea
            id="textarea__recipe_description"
            placeholder="Explanation of the recipe"
          ></textarea>
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.memory_imgs}>
            Memories of the recipe (optional)
          </span>
          <input
            id="input__memory_imgs"
            type="file"
            accept="image/*"
            multiple
          />
        </div>
        <div
          className={clsx(
            styles.container__input_line,
            styles.container__input_line_comments
          )}
        >
          <span className={styles.comments}>Comments (optional)</span>
          <textarea id="textarea__comments" placeholder="Comments"></textarea>
        </div>
        <button className={styles.btn__upload} type="submit">
          Upload
        </button>
      </form>
      <div className={styles.container__example}>
        <h2>~ Example ~</h2>
        <Image
          className={styles.img__example}
          src="/example.jpg"
          alt="example image"
          width={722}
          height={1866}
        ></Image>
      </div>
    </div>
  // );  */
}
