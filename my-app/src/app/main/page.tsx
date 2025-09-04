"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { create } from "domain";

const DropdownMenu = function ({
  isDropdownVisible,
  onClickDropdown,
}: {
  isDropdownVisible: Boolean;
  onClickDropdown: () => void;
}) {
  return (
    <div
      className={styles.container__dropdown}
      style={{ pointerEvents: !isDropdownVisible ? "none" : "all" }}
    >
      <button
        className={styles.btn__dropdown}
        type="button"
        onClick={onClickDropdown}
      ></button>
      <ul
        className={clsx(styles.dropdown_menu)}
        style={{ opacity: !isDropdownVisible ? 0 : 1 }}
      >
        <Link href="http://localhost:3000/recipes">
          <li>Recipes</li>
        </Link>
        <Link href="http://localhost:3000/converter">
          <li>Converter</li>
        </Link>
        <Link href="http://localhost:3000/account">
          <li>Account</li>
        </Link>
        <li>Logout</li>
        <Link href="http://localhost:3000/how-to-use">
          <li>How to use</li>
        </Link>
        <Link href="http://localhost:3000/news">
          <li>News</li>
        </Link>
        <Link href="">
          <li>Feedback</li>
        </Link>
      </ul>
    </div>
  );
};

const Search = function ({
  isSearchVisible,
  searchRef,
  onClickSearch,
}: {
  isSearchVisible: Boolean;
  searchRef: any;
  onClickSearch: () => void;
}) {
  return (
    <div
      className={styles.container__search_menu}
      style={{
        transform: !isSearchVisible ? "translateX(-100%)" : "translateX(0%)",
      }}
    >
      <button
        className={styles.btn__search_menu}
        type="button"
        onClick={onClickSearch}
      ></button>
      <div className={styles.search_menu} ref={searchRef}>
        <form className={styles.container__search}>
          <input
            id={styles.input__search}
            type="search"
            placeholder="Search your recipe"
          ></input>
          <button className={styles.btn__search} type="submit">
            Search
          </button>
        </form>
        <ul className={styles.search_results}>
          <li className={styles.recipe_preview}>
            <img
              className={styles.img__main}
              src="/grey-img.png"
              alt="main image"
            ></img>
            <p className={styles.title}>mujadara</p>
            <Image
              className={styles.img__favorite}
              src="/star-on.png"
              alt="favorite icon"
              width={512}
              height={512}
            ></Image>
          </li>
          <li className={styles.recipe_preview}>
            <img
              className={styles.img__main}
              src="/grey-img.png"
              alt="main image"
            ></img>
            <p className={styles.title}>mujadara</p>
          </li>
          <li className={styles.recipe_preview}>
            <img
              className={styles.img__main}
              src="/grey-img.png"
              alt="main image"
            ></img>
            <p className={styles.title}>My special Focaccia!!!!!</p>
          </li>
          <li className={styles.recipe_preview}>
            <img
              className={styles.img__main}
              src="/grey-img.png"
              alt="main image"
            ></img>
            <p className={styles.title}>My special Focaccia!!!!!!!!!!!</p>
            <Image
              className={styles.img__favorite}
              src="/star-on.png"
              alt="favorite icon"
              width={512}
              height={512}
            ></Image>
          </li>
          <li className={styles.recipe_preview}></li>
          <li className={styles.recipe_preview}></li>
        </ul>
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_left)}
          type="button"
        >
          Page 1<br />
          &larr;
        </button>
        <button
          className={clsx(styles.btn__pagination, styles.btn__pagination_right)}
          type="button"
        >
          Page 3<br />
          &rarr;{" "}
        </button>
      </div>
    </div>
  );
};

const Recipe = function () {
  return (
    <div className={styles.container__recipe}>
      <img
        className={styles.img__main}
        src="/grey-img.png"
        alt="main image"
      ></img>
      <div className={styles.title_wrapper}>
        <h2 className={styles.title}>
          My Favorite Focaccia!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        </h2>
      </div>
      <div className={styles.container__description_favorite}>
        <div className={styles.container__description}>
          <div className={styles.container__author_servings}>
            <p>Author</p>
            <span className={styles.author}> Lei-chan</span>
            <p>Servings</p>
            <input
              id={styles.input__servings}
              type="number"
              min="1"
              max="500"
              value="4"
            ></input>
            <span className={styles.servings_unit}>people</span>
          </div>
          <div className={styles.container__ingredients_unit}>
            <p>Ingredients Unit</p>
            <select id={styles.input__ingredients_unit}>
              <option value="metric">Metric</option>
              <option value="us">US</option>
              <option value="japan">Japan</option>
              <option value="australia">Australia</option>
              <option value="metriccup">Metric cup (1cup = 250ml)</option>
            </select>
          </div>
          <div className={styles.container__temperature_unit}>
            <p>Temperature</p>
            <span className={styles.temperature}>180/200/400/200</span>
            <select id={styles.input__temperature_units}>
              <option value="c">C</option>
              <option value="f">F</option>
            </select>
          </div>
        </div>
        <button className={styles.btn__favorite}></button>
      </div>
      <div className={styles.container__ingredients}>
        <h3>~ Ingredients ~</h3>
        <div className={styles.ingredients}>
          <div className={styles.ingredient_line}>
            <input type="checkbox"></input>
            <span>100 g flour</span>
          </div>
          <div className={styles.ingredient_line}>
            <input type="checkbox"></input>
            <span>100 g flourrrrrrrrrrrrrrrrrrrrr</span>
          </div>
          <div className={styles.ingredient_line}>
            <input type="checkbox"></input>
            <span>1000 g water</span>
          </div>
          <div className={styles.ingredient_line}>
            <input type="checkbox"></input>
            <span>1000 g water</span>
          </div>
        </div>
      </div>

      <div className={styles.container__steps}>
        <h2>~ Steps ~</h2>
        <div className={styles.step}>
          <h3>Step 1</h3>
          <div className={styles.container__step_step_img}>
            <p>
              Mix the ingredients together in a learge bowl. Set aside for 5
              minutes.
            </p>
            <img src="/grey-img.png" alt="step 1 image"></img>
          </div>
        </div>
        <div className={styles.step}>
          <h3>Step 2</h3>
          <div className={styles.container__step_step_img}>
            <p>
              Leave 3 large eggs in room temperature. Then beat them in a bowl.
              Add salt and pepper to it.
            </p>
          </div>
        </div>
      </div>
      <div className={styles.container__recipe_description}>
        <h2>~ About this recipe ~</h2>
        <p>
          This is our family recipe. My parents used to make this recipe on
          weekends :) This is very nostalgic for me. I wanted to share it
          because I want you guys to taste my family flavores. I hope you guys
          enjoy the recipe as much as our family does!
        </p>
      </div>
      <div className={styles.container__slider}>
        <h2>~ Memories of the recipe ~</h2>
        <div className={styles.slider__imgs}>
          <img src="/grey-img.png" alt="memories images"></img>
        </div>
      </div>

      <div className={styles.container__comments}>
        <h2>~ Comments ~</h2>
        <div className={styles.comments_wrapper}>
          <div className={styles.comments} contentEditable="true">
            You can use this space for leaving comments for the recipe or places
            you want to edit later :)
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
              value="1"
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
        </div>
      </div>
    </div>
  );
};

const Timers = function () {
  const MAX_TIMERS = 10;
  const [numberOfTimers, setNumberOfTimers] = useState(1);
  const defaultArr = Array(numberOfTimers).fill("");
  const [titleTimers, setTitleTimers] = useState(
    [...defaultArr].map((_, i) => `Timer ${i + 1}`)
  );
  const [originalTimes, setOriginalTimes] = useState(defaultArr);
  const [PausedTimes, setPausedTimes] = useState(defaultArr);
  const [setIntervalIds, setSetIntervalIds] = useState(defaultArr);

  const handleDeleteTimers = function (e: React.MouseEvent<HTMLButtonElement>) {
    if (!numberOfTimers) return;

    setNumberOfTimers(numberOfTimers - 1);
    const index = +e.currentTarget.closest("form").dataset.timer;
    console.log(index);
    setTitleTimers((prev) => {
      const newTitleTimers = [...prev];
      newTitleTimers.splice(index, 1);
      return newTitleTimers;
    });
  };

  const handleIncreaseTimers = function () {
    if (numberOfTimers === MAX_TIMERS) return;

    setNumberOfTimers((prev) => prev + 1);
    setTitleTimers((prev) => {
      const newTitleTimers = [...prev, `Timer ${prev.length + 1}`];
      return newTitleTimers;
    });
  };

  //save change after 0.3 sec
  let id: any;
  const handleChangeTitle = function (e: React.ChangeEvent<HTMLInputElement>) {
    if (id) clearTimeout(id);

    id = setTimeout(() => {
      const target = e.target as HTMLElement;
      const index = +target.closest("form")?.dataset.timer;
      if (!index) return;

      setTitleTimers((prev) => {
        const newTitleTimers = [...prev];
        newTitleTimers[index] = e.target.value;
        return newTitleTimers;
      });
    }, 500);
  };

  const createMarkupTimers = function () {
    const arr = new Array(numberOfTimers).fill("");

    const markupTimersArr = arr.map((_, i) => (
      <form className={styles.timer} data-timer={i}>
        <button
          className={clsx(styles.btn__x, styles.btn__x_timer)}
          type="button"
          onClick={handleDeleteTimers}
        >
          &times;
        </button>
        <input
          key={(Math.random() + Math.random()) * Math.random()}
          className={styles.input__timer_title}
          type="text"
          placeholder="Set title for timer"
          defaultValue={titleTimers[i]}
          onChange={handleChangeTitle}
        />
        <div className={styles.container__input_time}>
          <input
            className={clsx(styles.input__time, styles.input__timer_hours)}
            type="number"
            placeholder="h"
            min="0"
            max="23"
          />
          <input
            className={clsx(styles.input__time, styles.input__timer_minutes)}
            type="number"
            placeholder="min"
            min="0"
            max="59"
          />
          <input
            className={clsx(styles.input__time, styles.input__timer_seconds)}
            type="number"
            placeholder="sec"
            min="0"
            max="59"
          />
        </div>
        <div className={styles.container__btns}>
          <button className={styles.btn__start} type="button">
            Start
          </button>
          <button className={styles.btn__pause} type="button">
            Pause
          </button>
          <button className={styles.btn__reset} type="reset">
            Reset
          </button>
        </div>
      </form>
    ));

    return (
      <>
        {markupTimersArr}
        {numberOfTimers === 10 ? (
          ""
        ) : (
          <div className={styles.container__btn_add}>
            <button className={styles.btn__add} onClick={handleIncreaseTimers}>
              +<br />
              Add
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <section className={styles.section__timers}>
      <h2>Timers</h2>
      <div className={styles.container__timers}>{createMarkupTimers()}</div>
    </section>
  );
};

const Note = function () {
  return (
    <section className={styles.section__note} contentEditable="true">
      You can use this space for taking a note for cooking :)
    </section>
  );
};

export default function MAIN() {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchRef = useRef(null);

  const handleToggleDropdown = function () {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleToggleSearch = function () {
    setIsSearchVisible(!isSearchVisible);
  };

  const handleCloseDropdownSearch = function (
    e: React.MouseEvent<HTMLDivElement>
  ) {
    const target = e.target as HTMLElement;

    if (
      target.closest("ul") ||
      target.closest("div") === searchRef.current ||
      (!isDropdownVisible && !isSearchVisible)
    )
      return;

    setIsDropdownVisible(false);
    setIsSearchVisible(false);
  };

  return (
    <div
      className={clsx(styles.page__main)}
      onClick={handleCloseDropdownSearch}
    >
      <div className={styles.container__cooking}>
        <DropdownMenu
          isDropdownVisible={isDropdownVisible}
          onClickDropdown={handleToggleDropdown}
        />

        <section className={styles.section__recipe}>
          <Search
            isSearchVisible={isSearchVisible}
            onClickSearch={handleToggleSearch}
            searchRef={searchRef}
          />
          <Recipe />
        </section>

        <section className={styles.section__timers_note}>
          <Timers />
          <Note />
        </section>
      </div>
    </div>
  );
}
