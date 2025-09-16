"use client";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

export default function CreateRecipe() {
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
      <div
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
        }}
      >
        <div style={{ position: "relative", width: "500px", height: "300px" }}>
          <Image
            src={"/grey-img.png"}
            alt="main image"
            width={500}
            height={300}
          ></Image>
          <div
            style={{
              position: "relative",
              width: "50%",
              height: "13%",
              top: "-57%",
              left: "30%",
            }}
          >
            <button
              style={{
                position: "absolute",
                background: "transparent",
                backgroundImage: "url(/upload.png)",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                width: "100%",
                height: "100%",
                left: "0",
                color: "rgba(255, 168, 7, 1)",
                fontWeight: "bold",
                fontSize: "1.5vw",
                letterSpacing: "0.05vw",
                border: "none",
              }}
            >
              Upload image
            </button>
            <input
              style={{
                position: "absolute",
                opacity: "0",
                width: "100%",
                height: "100%",
                left: "0",
                cursor: "pointer",
              }}
              type="file"
              accept="image/*"
            />
          </div>
        </div>
        <div
          style={{
            position: "relative",
            top: "-30px",
            width: "65%",
            minHeight: "60px",
          }}
        >
          <div
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              backgroundImage:
                "linear-gradient(150deg, rgb(255, 230, 0) 10%,rgb(255, 102, 0))",
              width: "100%",
              height: "60px",
              letterSpacing: "0.1vw",
              padding: "1% 3.5%",
              transform: "skewX(-17deg)",
            }}
          >
            <input
              style={{
                width: "100%",
                height: "100%",
                background: "none",
                border: "none",
                letterSpacing: "0.07vw",
                fontSize: "2vw",
                textAlign: "center",
              }}
              placeholder="Click here to set title"
            ></input>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            top: "-2%",
            width: "90%",
            height: "fit-content",
            gap: "3%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "start",
              minWidth: "80%",
              width: "fitontent",
              maxWidth: "91%",
              height: "95%",
              whiteSpace: "nowrap",
              padding: "3%",
              backgroundColor: "rgb(255, 217, 0)",
              borderRadius: "1% / 7%",
              gap: "8%",
            }}
          >
            <div className={styles.container__author_servings}>
              <p>Author</p>
              <input
                style={{
                  width: "20%",
                  height: "10%",
                  border: "none",
                  fontSize: "1.2vw",
                  textAlign: "center",
                }}
                placeholder="Author"
              ></input>
              {/* {<span style={{ paddingRight: "5%" }}>{}</span>} */}
              <p>Servings</p>
              <input
                style={{ width: "8%", fontSize: "1.2vw", border: "none" }}
                type="number"
                min="1"
                max="500"
                // value={}
                // onChange={}
              />
              <select
                style={{ width: "20%", fontSize: "1.2vw", border: "none" }}
              >
                <option value="people">people</option>
                <option value="slices">slices</option>
                <option value="pieces">pieces</option>
                <option value="cups">cups</option>
                <option value="bowls">bowls</option>
                <option value="notApplicable">Not applicable</option>
              </select>
              <input
                style={{
                  width: "20%",
                  textAlign: "center",
                  fontSize: "1.2vw",
                  border: "none",
                }}
                placeholder="custom unit"
              />
              {/* {<span className={styles.servings_unit}>{}</span>} */}
            </div>
            <div className={styles.container__ingredients_unit}>
              <p>Ingredients Unit</p>
              <select
                id={styles.input__ingredients_unit}
                // value={}
                // onChange={}
              >
                <option value="metric">Metric</option>
                <option value="us">US</option>
                <option value="japan">Japan</option>
                <option value="australia">Australia</option>
                <option value="metricCup">Metric cup (1cup = 250ml)</option>
              </select>
            </div>
            <div className={styles.container__temperature_unit}>
              <p>Temperature</p>
              <span className={styles.temperature}>
                {/* {recipe.temperatures.temperatures.join("/")} */}
              </span>
              <select
                id={styles.input__temperature_units}
                // value={}
                // onChange={}
              >
                <option value="℃">℃</option>
                <option value="℉">℉</option>
              </select>
            </div>
          </div>
          <button
            style={{
              background: "none",
              backgroundImage: 'url("/star-off.png")',
              width: "5%",
              aspectRatio: "1",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100%",
              border: "none",
            }}
            // onClick={}
          ></button>
        </div>
        <div
          style={{
            position: "relative",
            top: "3%",
            width: "90%",
            height: "fit-content",
            backgroundColor: "rgb(255, 247, 177)",
            padding: "2%",
            borderRadius: "3px",
          }}
        >
          <h3 style={{ fontSize: "1.5vw", letterSpacing: "0.05vw" }}>
            ~ Ingredients ~
          </h3>
          <div
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              justifyItems: "left",
              marginTop: "2%",
              fontSize: "1.3vw",
              wordSpacing: "0.1vw",
              gap: "5%",
              paddingLeft: "7%",
            }}
          >
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

        <div
          style={{
            position: "relative",
            top: "8%",
            width: "80%",
            height: "fit-content",
          }}
        >
          <h2 style={{ marginBottom: "3.5%", fontSize: "1.6vw" }}>
            ~ Instructions ~
          </h2>
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
        <div className={styles.container__recipe_description}>
          <h2>~ About this recipe ~</h2>
          <p></p>
        </div>
        <div className={styles.container__slider}>
          <h2>~ Memories of the recipe ~</h2>
          <div className={styles.slider__imgs}>
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
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: "1.7%",
                bottom: "5%",
              }}
            >
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

        <div className={styles.container__comments}>
          <h2>~ Comments ~</h2>
          <div className={styles.comments_wrapper}>
            <div
              className={styles.comments}
              contentEditable="true"
              defaultValue="Use this space for free :)"
            >
              {}
            </div>
          </div>
        </div>

        <div className={styles.container__nutrition_facts}>
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
            {/* <p style={{ color: "red", width: "95%", marginTop: "2%" }}>
                ※ Couldn't find the information of aaaa, and aaa, so that is
                excluded here.
              </p> */}
          </div>
        </div>
        <button type="submit">Upload</button>
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
