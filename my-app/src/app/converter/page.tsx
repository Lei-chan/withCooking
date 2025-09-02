import styles from "./page.module.css";

export default function Converter() {
  return (
    <div className={styles.page__converter}>
      <h1>Converter</h1>
      <h3>Ingredient units</h3>
      <div className={styles.container__converter_ingredients}>
        <div className={styles.container__converter}>
          <label htmlFor="input__ingredient_amount">From</label>
          <input
            className={styles.input__amount}
            id={styles.input__ingredient_amount}
            type="number"
            placeholder="Amount"
          />
          <select className={styles.select__ingredient_unit_from}>
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
          </select>
          <label
            className={styles.label__to}
            htmlFor="select__ingredient_unit_to"
          >
            To
          </label>
          <select className={styles.select__ingredient_unit_to}>
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
          </select>
        </div>
        <div className={styles.container__output}>
          <p className={styles.output}>10</p>
          <span className={styles.unit}>US cups</span>
        </div>
      </div>
      <h3>Length units</h3>
      <div className={styles.container__converter_length}>
        <div className={styles.container__converter}>
          <label htmlFor="input__length_amount">From</label>
          <input
            className={styles.input__amount}
            id={styles.input__length_amount}
            type="number"
            placeholder="Length"
          />
          <select className={styles.select__length_unit_from}>
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="m">m</option>
            <option value="inch">inch</option>
            <option value="foot">foot</option>
            <option value="yard">yard</option>
          </select>
          <label className={styles.label__to} htmlFor="select__length_unit_to">
            To
          </label>
          <select className={styles.select__length_unit_to}>
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="m">m</option>
            <option value="inch">inch</option>
            <option value="foot">foot</option>
            <option value="yard">yard</option>
          </select>
        </div>
        <div className={styles.container__output}>
          <p className={styles.output}>10</p>
          <span className={styles.unit}>yard</span>
        </div>
      </div>
      <h3>Tempareture units</h3>
      <div className={styles.container__converter_temperature}>
        <div className={styles.container__converter}>
          <label htmlFor="input__temperature_amount">From</label>
          <input
            className={styles.input__amount}
            id={styles.input__temperature_amount}
            type="number"
            placeholder="Temperature"
          />
          <select className={styles.select__temperature_unit_from}>
            <option value="℃">℃</option>
            <option value="℉">℉</option>
          </select>
          <label
            className={styles.label__to}
            htmlFor="select__temperature_unit_to"
          >
            To
          </label>
          <select className={styles.select__temperature_unit_to}>
            <option value="℃">℃</option>
            <option value="℉">℉</option>
          </select>
        </div>
        <div className={styles.container__output}>
          <p className={styles.output}>10</p>
          <span className={styles.unit}>℉</span>
        </div>
      </div>
    </div>
  );
}
