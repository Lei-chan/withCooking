import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";

export default function MAIN() {
  return (
    <div className={clsx(styles.page__main)}>
      <div className={styles.container__cooking}>
        <div className={styles.container__dropdown}>
          <button className={styles.btn__dropdown} type="button"></button>
          <ul className={clsx(styles.dropdown_menu, styles.hidden)}>
            <li>Recipes</li>
            <li>Converter</li>
            <li>Account</li>
            <li>Logout</li>
            <li>How to use</li>
            <li>News</li>
            <Link href="">
              <li>Feedback</li>
            </Link>
          </ul>
        </div>

        <section className={styles.section__recipe}>
          <div className={styles.container__search_menu}>
            <button className={styles.btn__search_menu} type="button"></button>
            <div className={styles.search_menu}>
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
                className={clsx(
                  styles.btn__pagination,
                  styles.btn__pagination_left
                )}
                type="button"
              >
                Page 1<br />
                &larr;
              </button>
              <button
                className={clsx(
                  styles.btn__pagination,
                  styles.btn__pagination_right
                )}
                type="button"
              >
                Page 3<br />
                &rarr;{" "}
              </button>
            </div>
          </div>
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
                    Mix the ingredients together in a learge bowl. Set aside for
                    5 minutes.
                  </p>
                  <img src="/grey-img.png" alt="step 1 image"></img>
                </div>
              </div>
              <div className={styles.step}>
                <h3>Step 2</h3>
                <div className={styles.container__step_step_img}>
                  <p>
                    Leave 3 large eggs in room temperature. Then beat them in a
                    bowl. Add salt and pepper to it.
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.container__recipe_description}>
              <h2>~ About this recipe ~</h2>
              <p>
                This is our family recipe. My parents used to make this recipe
                on weekends :) This is very nostalgic for me. I wanted to share
                it because I want you guys to taste my family flavores. I hope
                you guys enjoy the recipe as much as our family does!
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
                  You can use this space for leaving comments for the recipe or
                  places you want to edit later :)
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
        </section>

        <section className={styles.section__timers_note}>
          <section className={styles.section__timers}>
            <h2>Timers</h2>
            <div className={styles.container__timers}>
              <form className={styles.timer} data-timer="0">
                <button
                  className={clsx(styles.btn__x, styles.btn__x_timer)}
                  type="button"
                >
                  &times;
                </button>
                <input
                  className={styles.input__timer_title}
                  type="text"
                  placeholder="Set title for timer"
                  value="Timer 1"
                ></input>
                <p>
                  <input
                    className={clsx(
                      styles.input__time,
                      styles.input__timer_hours
                    )}
                    type="number"
                    placeholder="h"
                    min="0"
                    max="23"
                  ></input>{" "}
                  :{" "}
                  <input
                    className={clsx(
                      styles.input__time,
                      styles.input__timer_minutes
                    )}
                    type="number"
                    placeholder="min"
                    min="0"
                    max="59"
                  ></input>{" "}
                  :{" "}
                  <input
                    className={clsx(
                      styles.input__time,
                      styles.input__timer_seconds
                    )}
                    type="number"
                    placeholder="sec"
                    min="0"
                    max="59"
                  ></input>
                </p>
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
              <div className={styles.container__btn_add}>
                <button className={styles.btn__add}>
                  +<br />
                  Add
                </button>
              </div>
            </div>
          </section>

          <section className={styles.section__note} contentEditable="true">
            You can use this space for taking a note for cooking :)
          </section>
        </section>
      </div>
    </div>
  );
}
