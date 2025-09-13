import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

export default function CreateRecipe() {
  return (
    <div className={clsx(styles.overlay__create_recipe)}>
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
          <span className={styles.author}>Author</span>
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
  );
}
