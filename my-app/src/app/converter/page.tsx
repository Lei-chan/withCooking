"use client";
import styles from "./page.module.css";
import {
  convertIngUnits,
  convertLengthUnits,
  convertTempUnits,
} from "../helper";
import { useState } from "react";

export default function Converter() {
  const [valueIng, setValueIng] = useState<number>();
  const [unitIngFrom, setUnitIngFrom] = useState("g");
  const [unitIngTo, setUnitIngTo] = useState("kg");
  const [valueTemp, setValueTemp] = useState<number>();
  const [unitTempFrom, setUnitTempFrom] = useState("℉");
  const [valueLength, setValueLength] = useState<number>();
  const [unitLengthFrom, setUnitLengthFrom] = useState("mm");
  const [unitLengthTo, setUnitLengthTo] = useState("cm");

  function handleInputChangeIng(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.currentTarget.value;
    setValueIng(value);
  }

  function handleSelectChangeIngFrom(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;
    setUnitIngFrom(value);
  }

  function handleSelectChangeIngTo(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;
    setUnitIngTo(value);
  }

  const findResultIng = () => {
    const resultsObj = convertIngUnits(valueIng, unitIngFrom);
    const resultsArr = Object.entries(resultsObj);
    const result = resultsArr.find((result) => result[1].unit === unitIngTo);
    return result ? result.amount : "";
  };

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
            onChange={handleInputChangeIng}
          />
          <select
            className={styles.select__ingredient_unit_from}
            value={unitIngFrom}
            onChange={handleSelectChangeIngFrom}
          >
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="lb">lb</option>
            <option value="oz">oz</option>
            <option value="ml">ml</option>
            <option value="L">L</option>
            <option value="US cup">cup (US)</option>
            <option value="Japanese cup">cup (Japan)</option>
            <option value="Imperial cup">cup (1cup = 250ml)</option>
            <option value="rice cup">rice cup</option>
            <option value="tsp">tsp</option>
            <option value="Tbsp">Tbsp</option>
            <option value="Australian Tbsp">Tbsp (Australia)</option>
          </select>
          <label
            className={styles.label__to}
            htmlFor="select__ingredient_unit_to"
          >
            To
          </label>
          <select
            className={styles.select__ingredient_unit_to}
            value={unitIngTo}
            onChange={handleSelectChangeIngTo}
          >
            {unitIngFrom !== "g" && <option value="g">g</option>}
            {unitIngFrom !== "kg" && <option value="kg">kg</option>}
            {unitIngFrom !== "oz" && <option value="oz">oz</option>}
            {unitIngFrom !== "lb" && <option value="lb">lb</option>}
            {unitIngFrom !== "ml" && <option value="ml">ml</option>}
            {unitIngFrom !== "L" && <option value="L">L</option>}
            {unitIngFrom !== "US cup" && (
              <option value="US cup">cup (US)</option>
            )}
            {unitIngFrom !== "Japanese cup" && (
              <option value="Japanese cup">cup (Japan)</option>
            )}
            {unitIngFrom !== "Imperial cup" && (
              <option value="Imperial cup">cup (1cup = 250ml)</option>
            )}
            {unitIngFrom !== "rice cup" && (
              <option value="rice cup">rice cup</option>
            )}
            {unitIngFrom !== "tsp" && <option value="tsp">tsp</option>}
            {unitIngFrom !== "Tbsp" && <option value="Tbsp">Tbsp</option>}
            {unitIngFrom !== "Australian Tbsp" && (
              <option value="Australian Tbsp">Tbsp (Australia)</option>
            )}
          </select>
        </div>
        <div className={styles.container__output}>
          <p className={styles.output}>{findResultIng()}</p>
          <span className={styles.unit}>{unitIngTo}</span>
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
          <p className={styles.output}></p>
          <span className={styles.unit}>℉</span>
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
          <p className={styles.output}></p>
          <span className={styles.unit}>yard</span>
        </div>
      </div>
    </div>
  );
}
