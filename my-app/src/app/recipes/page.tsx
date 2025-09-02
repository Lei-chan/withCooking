import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";

const OverlayCreate = function () {
  return (
    <div className={clsx(styles.overlay__create_recipe)}>
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
};

const OverlayEdit = function () {
  return (
    <div className={(styles.overlay__edit_recipe, styles.hidden)}>
      <form className={styles.form__create_recipe}>
        <h2>Let's edit the recipe!</h2>
        <div className={styles.container__input_line}>
          <span className={styles.main_img}>Main Image</span>
          <p className={styles.cur_info}>Current Image: kkkk.png</p>
          <input id={styles.input__main_image} type="file" accept="image/*" />
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.title}>Recipe Title</span>
          <input
            id={styles.input__title}
            type="text"
            placeholder="Your Recipe Title"
            defaultValue="My favorite Focaccia"
          />
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.author}>Author</span>
          <input
            id={styles.input__author}
            type="text"
            placeholder="This recipe's author"
            defaultValue="Lei-chan"
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
            defaultValue="4"
          />
          <select id={styles.select__servings_unit} defaultValue="people">
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
          Type a main temperature the recipe uses and select the unit (e.g. Oven
          temperature)
        </p>
        <div className={styles.container__input_line}>
          <span className={styles.temperature}>Temperature (optional)</span>
          <input
            className={styles.input__temperature}
            id="input__temperature1"
            type="number"
            placeholder="Temp 1"
            defaultValue="180"
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
          <select id={styles.select__temperature_unit} defaultValue="℃">
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
            defaultValue="tomatoes"
          />
          <input
            className={styles.input__ingredient_amount}
            id="input__ingredient1_amount"
            type="text"
            placeholder="Amount"
            defaultValue="3"
          />
          <select
            className={styles.select__ingredient_unit}
            id="select__ingredient1_unit"
            defaultValue="noUnit"
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
            defaultValue="flour"
          />
          <input
            className={styles.input__ingredient_amount}
            id="input__ingredient2_amount"
            type="text"
            placeholder="Amount"
            defaultValue="1"
          />
          <select
            className={styles.select__ingredient_unit}
            id="select__ingredient2_unit"
            defaultValue="kg"
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
            defaultValue="olive oil"
          />
          <input
            className={styles.input__ingredient_amount}
            id="input__ingredient3_amount"
            type="text"
            placeholder="Amount"
            defaultValue="a little bit"
          />
          <select
            className={styles.select__ingredient_unit}
            id="select__ingredient3_unit"
            defaultValue="noUnit"
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
        <div className={styles.container__input_line}>
          <span className={styles.ingredient}>Ingredient 3</span>
          <input
            className={styles.input__ingredient}
            id="input__ingredient3"
            type="text"
            placeholder="Ingredient 3"
            defaultValue="olive oil"
          />
          <input
            className={styles.input__ingredient_amount}
            id="input__ingredient3_amount"
            type="text"
            placeholder="Amount"
            defaultValue="a little bit"
          />
          <select
            className={styles.select__ingredient_unit}
            id="select__ingredient3_unit"
            defaultValue="noUnit"
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
          <textarea
            id="textarea__step1"
            placeholder="Description"
            defaultValue="Put something in a small bowl."
          ></textarea>
          <div className={styles.container__cur_img_choose_img}>
            <p className={styles.cur_info}>Current Image: kkkkkkk.png</p>
            <input id="input__step1_img" type="file" accept="image/*" />
          </div>
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.step}>Step 2</span>
          <textarea id="textarea__step2" placeholder="Description"></textarea>
          <div className={styles.container__cur_img_choose_img}>
            <p className={styles.cur_info}>Current Image: kkkkkkk.png</p>
            <input id="input__step2_img" type="file" accept="image/*" />
          </div>
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.step}>Step 3</span>
          <textarea id="textarea__step1" placeholder="Description"></textarea>
          <div className={styles.container__cur_img_choose_img}>
            <p className={styles.cur_info}>Current Image: kkkkkkk.png</p>
            <input id="input__step1_img" type="file" accept="image/*" />
          </div>
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.step}>Step 4</span>
          <textarea id="textarea__step4" placeholder="Description"></textarea>
          <div className={styles.container__cur_img_choose_img}>
            <p className={styles.cur_info}>Current Image: kkkkkkk.png</p>
            <input id="input__step4_img" type="file" accept="image/*" />
          </div>
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
            defaultValue="This recipe is"
          ></textarea>
        </div>
        <div className={styles.container__input_line}>
          <span className={styles.memory_imgs}>
            Memories of the recipe (optional)
          </span>
          <div className={styles.container__cur_img_choose_img}>
            <p className={styles.cur_info}>
              Current Image: kkkkkkk.png, kkkkkkk.jpeg, jjjjjjjj.jpg
            </p>
            <input
              id={styles.input__memory_imgs}
              type="file"
              accept="image/*"
              multiple
            />
          </div>
        </div>
        <div
          className={clsx(
            styles.container__input_line,
            styles.container__input_line_comments
          )}
        >
          <span className={styles.comments}>Comments (optional)</span>
          <textarea
            id={styles.textarea__comments}
            placeholder="Comments"
            defaultValue=" I will change the ingredients later!"
          ></textarea>
        </div>
        <button className={styles.btn__upload} type="submit">
          Upload
        </button>
      </form>
      <div className={styles.container__recipe_preview}>
        <h2>~ Preview ~</h2>
        <section className={styles.section__recipe}>
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
                  />
                  <span className={styles.servings_unit}>people</span>
                </div>
                <div className={styles.container__units}>
                  <p>Ingredients Unit</p>
                  <select id={styles.input__ingredients_unit}>
                    <option value="metric">Metric</option>
                    <option value="us">US</option>
                    <option value="japan">Japan</option>
                    <option value="australia">Australia</option>
                    <option value="metriccup">Metric cup (1cup = 250ml)</option>
                  </select>
                  <p>Temperature</p>
                  <span className={styles.temperature}>180</span>
                  <select id={styles.input__temperature_units}>
                    <option value="℃">℃</option>
                    <option value="℉">℉</option>
                  </select>
                </div>
              </div>
              <button className={styles.btn__favorite}></button>
            </div>
            <div className={styles.container__ingredients}>
              <h3>~ Ingredients ~</h3>
              <div className={styles.ingredients}>
                <div className={styles.ingredient_line}>
                  <input type="checkbox" />
                  <span>100 g flour</span>
                </div>
                <div className={styles.ingredient_line}>
                  <input type="checkbox" />
                  <span>100 g flourrrrrrrrrrrrrrrrrrrrr</span>
                </div>
                <div className={styles.ingredient_line}>
                  <input type="checkbox" />
                  <span>1000 g water</span>
                </div>
                <div className={styles.ingredient_line}>
                  <input type="checkbox" />
                  <span>1000 g water</span>
                </div>
                <div className={styles.ingredient_line}>
                  <input type="checkbox" />
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
                  <img src="/grey-img.png" alt="step1 image"></img>
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
              <div className={styles.step}>
                <h3>Step 3</h3>
                <div className={styles.container__step_step_img}>
                  <p>
                    Leave 3 large eggs in room temperature. Then beat them in a
                    bowl. Add salt and pepper to it.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <h3>Step 4</h3>
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
                <img src="/grey-img.png" alt="memory image 1"></img>
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
          </div>
        </section>
      </div>
    </div>
  );
};

const OverlayLoading = function () {
  return (
    <div className={clsx(styles.overlay__upload, styles.hidden)}>
      <Image
        className={clsx(styles.img__uploading, styles.hidden)}
        src="/loading.png"
        alt="loading icon"
        width={150}
        height={150}
      ></Image>
      <p className={clsx(styles.message__upload, styles.hidden)}>
        Recipe uploaded successfully!
      </p>
    </div>
  );
};

export default function Recipes() {
  return (
    <div className={styles.page__recipes}>
      <div className={styles.container__search_btn}>
        <p className={styles.search_result}>0 recipes found</p>
        <form className={styles.container__search}>
          <input
            className={styles.input__search}
            type="search"
            placeholder="Search your recipe"
          />
          <button className={styles.btn__search} type="submit">
            Search
          </button>
        </form>
        <button className={styles.btn__create} type="button">
          Create
        </button>
      </div>
      <div className={styles.container__recipes}>
        <ul className={styles.container__recipes_column}>
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
        </ul>
      </div>
      <div className={clsx(styles.container__message, styles.hidden)}>
        <p>
          No recipes created yet.
          <br />
          Let't start by creating a recipe :)
        </p>
        {/* <p>No recipes found.<br/>Please try with a different keyword :)</p> */}
      </div>
      <button
        className={clsx(styles.btn__pagination, styles.btn__pagination_left)}
      >
        Page 1<br />
        &larr;
      </button>
      <button
        className={clsx(styles.btn__pagination, styles.btn__pagination_right)}
      >
        Page 3<br />
        &rarr;
      </button>
      <div className={clsx(styles.overlay__recipes, styles.hidden)}>
        <button className={styles.btn__x} type="button">
          &times;
        </button>
        <OverlayCreate />
        <OverlayEdit />
        <OverlayLoading />
      </div>
    </div>
  );
}
