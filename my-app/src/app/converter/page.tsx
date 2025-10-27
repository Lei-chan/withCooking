"use client";
//react
import { useContext, useEffect, useRef, useState } from "react";
//css
import styles from "./page.module.css";
//type
import { TYPE_MEDIA } from "../lib/config/type";
//mehods to convert
import {
  convertIngUnits,
  convertLengthUnits,
  convertTempUnits,
} from "../lib/helpers/converter";
//context
import { MediaContext } from "../lib/providers";

export default function Converter() {
  const mediaContext = useContext(MediaContext);

  const fontSize =
    mediaContext === "mobile"
      ? "4.5vw"
      : mediaContext === "tablet"
      ? "2.5vw"
      : mediaContext === "desktop"
      ? "1.7vw"
      : "1.3vw";

  const smallHeaderStyle = {
    color: "#795200ff",
    letterSpacing: "0.07vw",
    wordSpacing: "0.3vw",
    fontSize: `calc(${fontSize} * 1.1)`,
    margin: mediaContext === "mobile" ? "5% 0 3% 0" : "3% 0 2% 0",
  };

  const outputFontSize = `calc(${fontSize} * 1.1)`;

  const boxStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "antiquewhite",
    gap: "1%",
    borderRadius: "3px",
    width:
      mediaContext === "mobile"
        ? "90%"
        : mediaContext === "tablet"
        ? "80%"
        : "70%",
    minHeight:
      mediaContext === "mobile" || mediaContext === "tablet" ? "23%" : "20%",
    maxHeight: "fit-content",
    fontSize,
  };

  const converterInnerStyle = {
    width:
      mediaContext === "mobile"
        ? "90%"
        : mediaContext === "tablet"
        ? "85%"
        : mediaContext === "desktop"
        ? "75%"
        : "70%",
    display: "flex",
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "left",
    height: "fit-content",
    gap: "3%",
    marginTop: "3%",
    marginBottom: mediaContext === "mobile" ? "0" : "2%",
  };

  const inputSelectStyle = {
    minWidth: mediaContext === "mobile" ? "35%" : "25%",
    maxWidth: "fit-content",
    textAlign: "center",
    letterSpacing: "0.07vw",
    borderRadius: "2%/7%",
    borderColor: "rgba(0, 0, 0, 0.404)",
    aspectRatio: "1/0.21",
    fontSize,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100%",
        backgroundColor: "#6ddbb6",
        padding: "2% 0",
      }}
    >
      <h1
        style={{
          color: "#21038bff",
          fontSize: `calc(${fontSize} * 1.4)`,
          letterSpacing: "0.1vw",
        }}
      >
        Converter
      </h1>
      <h3 style={smallHeaderStyle}>Ingredient units</h3>
      <ConverterIng
        mediaContext={mediaContext}
        boxStyle={boxStyle}
        converterInnerStyle={converterInnerStyle}
        inputSelectStyle={inputSelectStyle}
        outputFontSize={outputFontSize}
      />
      <h3 style={smallHeaderStyle}>Tempareture units</h3>
      <ConverterTemp
        mediaContext={mediaContext}
        boxStyle={boxStyle}
        converterInnerStyle={converterInnerStyle}
        inputSelectStyle={inputSelectStyle}
        outputFontSize={outputFontSize}
      />
      <h3 style={smallHeaderStyle}>Length units</h3>
      <ConverterLength
        mediaContext={mediaContext}
        boxStyle={boxStyle}
        converterInnerStyle={converterInnerStyle}
        inputSelectStyle={inputSelectStyle}
        outputFontSize={outputFontSize}
      />
    </div>
  );
}

function ConverterIng({
  mediaContext,
  boxStyle,
  converterInnerStyle,
  inputSelectStyle,
  outputFontSize,
}: {
  mediaContext: TYPE_MEDIA;
  boxStyle: object;
  converterInnerStyle: object;
  inputSelectStyle: object;
  outputFontSize: string;
}) {
  //prettier-ignore
  type AllowedUnitsIng = "g"| "kg"| "oz"| "lb"| "ml"| "L"| "USCup"| "JapaneseCup"| "ImperialCup"| "riceCup"| "tsp"| "Tbsp"| "AustralianTbsp";

  //prettier-ignore
  const allowedUnitsIng: AllowedUnitsIng[] = [ "g", "kg", "oz", "lb", "ml", "L", "USCup", "JapaneseCup", "ImperialCup", "riceCup", "tsp", "Tbsp", "AustralianTbsp"];

  const isAllowedUnitIng = (value: string): value is AllowedUnitsIng =>
    allowedUnitsIng.includes(value as AllowedUnitsIng);

  const selectRefIng = useRef<HTMLSelectElement>(null);
  const [valueIng, setValueIng] = useState<number>();
  const [unitIngFrom, setUnitIngFrom] = useState<AllowedUnitsIng>("g");
  const [unitIngTo, setUnitIngTo] = useState<AllowedUnitsIng>("kg");
  const [isMass, setIsMass] = useState(true);

  const calcIsMass = (value: string) => {
    const massUnits = ["g", "kg", "oz", "lb"];

    return massUnits.includes(value) ? true : false;
  };

  function handleInputChangeIng(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.currentTarget.value;
    setValueIng(value);
  }

  function handleSelectChangeIngFrom(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;
    setIsMass(calcIsMass(value));

    if (!isAllowedUnitIng(value)) return;
    setUnitIngFrom(value);
  }

  function handleSelectChangeIngTo(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;

    if (!isAllowedUnitIng(value)) return;
    setUnitIngTo(value);
  }

  const findResultIng = () => {
    const resultsObj = valueIng && convertIngUnits(valueIng, unitIngFrom);

    if (!resultsObj || typeof resultsObj[unitIngTo] === "string") return;
    const result = resultsObj[unitIngTo]?.amount;

    return result ? result : "";
  };

  //Manually reassign setUnitIngTo
  //1. When the select ele 'From' is changed and unitIngTo was same unit as that
  //2. When the select ele 'From' unit is changed to a mass or a not-mass unit
  // Above cases the select element 'To' options are changed by the app, but state unitIngTo isn't reassigned because it's not something triggerd by change event
  useEffect(() => {
    const value = selectRefIng.current?.value;
    if (!value || !isAllowedUnitIng(value)) return;

    if (
      unitIngFrom === unitIngTo ||
      (isMass && !calcIsMass(unitIngTo)) ||
      (!isMass && calcIsMass(unitIngTo))
    )
      setUnitIngTo(value);
  }, [unitIngFrom]);

  return (
    <div style={boxStyle}>
      {mediaContext !== "mobile" ? (
        <div style={converterInnerStyle}>
          <label htmlFor="input__ingredient_amount">From</label>
          <input
            style={inputSelectStyle}
            type="number"
            placeholder="Amount"
            onChange={handleInputChangeIng}
          />
          <select
            style={inputSelectStyle}
            value={unitIngFrom}
            onChange={handleSelectChangeIngFrom}
          >
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="oz">oz</option>
            <option value="lb">lb</option>
            <option value="ml">ml</option>
            <option value="L">L</option>
            <option value="USCup">cup (US)</option>
            <option value="JapaneseCup">cup (Japan)</option>
            <option value="ImperialCup">cup (1cup = 250ml)</option>
            <option value="riceCup">rice cup</option>
            <option value="tsp">tsp</option>
            <option value="Tbsp">Tbsp</option>
            <option value="AustralianTbsp">Tbsp (Australia)</option>
          </select>
          <label
            className={styles.label__to}
            htmlFor="select__ingredient_unit_to"
          >
            To
          </label>
          <select
            style={inputSelectStyle}
            ref={selectRefIng}
            value={unitIngTo}
            onChange={handleSelectChangeIngTo}
          >
            {isMass && unitIngFrom !== "g" && <option value="g">g</option>}
            {isMass && unitIngFrom !== "kg" && <option value="kg">kg</option>}
            {isMass && unitIngFrom !== "oz" && <option value="oz">oz</option>}
            {isMass && unitIngFrom !== "lb" && <option value="lb">lb</option>}
            {!isMass && unitIngFrom !== "ml" && <option value="ml">ml</option>}
            {!isMass && unitIngFrom !== "L" && <option value="L">L</option>}
            {!isMass && unitIngFrom !== "USCup" && (
              <option value="USCup">cup (US)</option>
            )}
            {!isMass && unitIngFrom !== "JapaneseCup" && (
              <option value="JapaneseCup">cup (Japan)</option>
            )}
            {!isMass && unitIngFrom !== "ImperialCup" && (
              <option value="ImperialCup">cup (1cup = 250ml)</option>
            )}
            {!isMass && unitIngFrom !== "riceCup" && (
              <option value="riceCup">rice cup</option>
            )}
            {!isMass && unitIngFrom !== "tsp" && (
              <option value="tsp">tsp</option>
            )}
            {!isMass && unitIngFrom !== "Tbsp" && (
              <option value="Tbsp">Tbsp</option>
            )}
            {!isMass && unitIngFrom !== "AustralianTbsp" && (
              <option value="AustralianTbsp">Tbsp (Australia)</option>
            )}
          </select>
        </div>
      ) : (
        <>
          <div style={converterInnerStyle}>
            <label htmlFor="input__ingredient_amount">From</label>
            <input
              style={inputSelectStyle}
              type="number"
              placeholder="Amount"
              onChange={handleInputChangeIng}
            />
            <select
              style={inputSelectStyle}
              value={unitIngFrom}
              onChange={handleSelectChangeIngFrom}
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="oz">oz</option>
              <option value="lb">lb</option>
              <option value="ml">ml</option>
              <option value="L">L</option>
              <option value="USCup">cup (US)</option>
              <option value="JapaneseCup">cup (Japan)</option>
              <option value="ImperialCup">cup (1cup = 250ml)</option>
              <option value="riceCup">rice cup</option>
              <option value="tsp">tsp</option>
              <option value="Tbsp">Tbsp</option>
              <option value="AustralianTbsp">Tbsp (Australia)</option>
            </select>
          </div>
          <div style={converterInnerStyle}>
            <label
              className={styles.label__to}
              htmlFor="select__ingredient_unit_to"
            >
              To
            </label>
            <select
              style={inputSelectStyle}
              ref={selectRefIng}
              value={unitIngTo}
              onChange={handleSelectChangeIngTo}
            >
              {isMass && unitIngFrom !== "g" && <option value="g">g</option>}
              {isMass && unitIngFrom !== "kg" && <option value="kg">kg</option>}
              {isMass && unitIngFrom !== "oz" && <option value="oz">oz</option>}
              {isMass && unitIngFrom !== "lb" && <option value="lb">lb</option>}
              {!isMass && unitIngFrom !== "ml" && (
                <option value="ml">ml</option>
              )}
              {!isMass && unitIngFrom !== "L" && <option value="L">L</option>}
              {!isMass && unitIngFrom !== "USCup" && (
                <option value="USCup">cup (US)</option>
              )}
              {!isMass && unitIngFrom !== "JapaneseCup" && (
                <option value="JapaneseCup">cup (Japan)</option>
              )}
              {!isMass && unitIngFrom !== "ImperialCup" && (
                <option value="ImperialCup">cup (1cup = 250ml)</option>
              )}
              {!isMass && unitIngFrom !== "riceCup" && (
                <option value="riceCup">rice cup</option>
              )}
              {!isMass && unitIngFrom !== "tsp" && (
                <option value="tsp">tsp</option>
              )}
              {!isMass && unitIngFrom !== "Tbsp" && (
                <option value="Tbsp">Tbsp</option>
              )}
              {!isMass && unitIngFrom !== "AustralianTbsp" && (
                <option value="AustralianTbsp">Tbsp (Australia)</option>
              )}
            </select>
          </div>
        </>
      )}
      <div
        className={styles.container__output}
        style={{ fontSize: outputFontSize }}
      >
        <p className={styles.output}>{findResultIng()}</p>
        <span className={styles.unit}>
          {(() => {
            if (unitIngTo.includes("Cup"))
              return unitIngTo.replace("Cup", " cup");
            if (unitIngTo.includes("nTbsp"))
              return unitIngTo.replace("nTbsp", "n Tbsp");
            return unitIngTo;
          })()}
        </span>
      </div>
    </div>
  );
}

function ConverterTemp({
  mediaContext,
  boxStyle,
  converterInnerStyle,
  inputSelectStyle,
  outputFontSize,
}: {
  mediaContext: TYPE_MEDIA;
  boxStyle: object;
  converterInnerStyle: object;
  inputSelectStyle: object;
  outputFontSize: string;
}) {
  const [valueTemp, setValueTemp] = useState<number>();
  const [unitTempFrom, setUnitTempFrom] = useState<"℉" | "℃">("℉");

  function handleInputChangeTemp(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.currentTarget.value;
    setValueTemp(value);
  }

  function handleSelectChangeTempFrom(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;
    (value === "℉" || value === "℃") && setUnitTempFrom(value);
  }

  return (
    <div style={boxStyle}>
      {mediaContext !== "mobile" ? (
        <div style={converterInnerStyle}>
          <label htmlFor="input__temperature_amount">From</label>
          <input
            style={inputSelectStyle}
            type="number"
            placeholder="Temperature"
            onChange={handleInputChangeTemp}
          />
          <select
            style={inputSelectStyle}
            value={unitTempFrom}
            onChange={handleSelectChangeTempFrom}
          >
            <option value="℃">℃</option>
            <option value="℉">℉</option>
          </select>
          <label
            className={styles.label__to}
            htmlFor="select__temperature_unit_to"
          >
            To
          </label>
          <select style={inputSelectStyle}>
            {unitTempFrom !== "℃" && <option value="℃">℃</option>}
            {unitTempFrom !== "℉" && <option value="℉">℉</option>}
          </select>
        </div>
      ) : (
        <>
          <div style={converterInnerStyle}>
            <label htmlFor="input__temperature_amount">From</label>
            <input
              style={inputSelectStyle}
              type="number"
              placeholder="Temperature"
              onChange={handleInputChangeTemp}
            />
            <select
              style={inputSelectStyle}
              value={unitTempFrom}
              onChange={handleSelectChangeTempFrom}
            >
              <option value="℃">℃</option>
              <option value="℉">℉</option>
            </select>
          </div>
          <div style={converterInnerStyle}>
            <label
              className={styles.label__to}
              htmlFor="select__temperature_unit_to"
            >
              To
            </label>
            <select style={inputSelectStyle}>
              {unitTempFrom !== "℃" && <option value="℃">℃</option>}
              {unitTempFrom !== "℉" && <option value="℉">℉</option>}
            </select>
          </div>{" "}
        </>
      )}
      <div
        className={styles.container__output}
        style={{ fontSize: outputFontSize }}
      >
        <p className={styles.output}>
          {(valueTemp && convertTempUnits(valueTemp, unitTempFrom)) || ""}
        </p>
        <span className={styles.unit}>{unitTempFrom === "℃" ? "℉" : "℃"}</span>
      </div>
    </div>
  );
}

function ConverterLength({
  mediaContext,
  boxStyle,
  converterInnerStyle,
  inputSelectStyle,
  outputFontSize,
}: {
  mediaContext: TYPE_MEDIA;
  boxStyle: object;
  converterInnerStyle: object;
  inputSelectStyle: object;
  outputFontSize: string;
}) {
  //prettier-ignore
  type AllowedUnitsLength = "mm" | "cm" | "m" | "inch" | "foot" | "yard";

  //prettier-ignore
  const allowedUnitsLength: AllowedUnitsLength[] = ["mm","cm","m","inch","foot","yard"];

  const isAllowedUnitLength = (value: string): value is AllowedUnitsLength =>
    allowedUnitsLength.includes(value as AllowedUnitsLength);

  const selectRefLength = useRef<HTMLSelectElement>(null);
  const [valueLength, setValueLength] = useState<number>();
  const [unitLengthFrom, setUnitLengthFrom] =
    useState<AllowedUnitsLength>("mm");
  const [unitLengthTo, setUnitLengthTo] = useState<AllowedUnitsLength>("cm");

  function handleInputChangeLength(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.currentTarget.value;
    setValueLength(value);
  }

  function handleSelectChangeLengthFrom(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const value = e.currentTarget.value;

    if (!isAllowedUnitLength(value)) return;
    setUnitLengthFrom(value);
  }

  function handleSelectChangeLengthTo(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;

    if (!isAllowedUnitLength(value)) return;
    setUnitLengthTo(value);
  }

  const findResultLength = () => {
    const resultObj =
      valueLength && convertLengthUnits(valueLength, unitLengthFrom);
    const result = resultObj && resultObj[unitLengthTo]?.length;
    return result ? result : "";
  };

  //Manually reassign setUnitLengthTo
  //When the select ele 'From' is changed and unitLengthTo was same unit as that, the select element 'To' options are changed by the app, but state unitLengthTo isn't reassigned because it's not somethLength triggerd by change event
  useEffect(() => {
    const value = selectRefLength.current?.value;
    if (!value || !isAllowedUnitLength(value)) return;

    if (unitLengthFrom === unitLengthTo) setUnitLengthTo(value);
  }, [unitLengthFrom]);

  return (
    <div style={boxStyle}>
      {mediaContext !== "mobile" ? (
        <div style={converterInnerStyle}>
          <label htmlFor="input__length_amount">From</label>
          <input
            style={inputSelectStyle}
            type="number"
            placeholder="Length"
            onChange={handleInputChangeLength}
          />
          <select
            style={inputSelectStyle}
            value={unitLengthFrom}
            onChange={handleSelectChangeLengthFrom}
          >
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
          <select
            style={inputSelectStyle}
            ref={selectRefLength}
            value={unitLengthTo}
            onChange={handleSelectChangeLengthTo}
          >
            {unitLengthFrom !== "mm" && <option value="mm">mm</option>}
            {unitLengthFrom !== "cm" && <option value="cm">cm</option>}
            {unitLengthFrom !== "m" && <option value="m">m</option>}
            {unitLengthFrom !== "inch" && <option value="inch">inch</option>}
            {unitLengthFrom !== "foot" && <option value="foot">foot</option>}
            {unitLengthFrom !== "yard" && <option value="yard">yard</option>}
          </select>
        </div>
      ) : (
        <>
          <div style={converterInnerStyle}>
            <label htmlFor="input__length_amount">From</label>
            <input
              style={inputSelectStyle}
              type="number"
              placeholder="Length"
              onChange={handleInputChangeLength}
            />
            <select
              style={inputSelectStyle}
              value={unitLengthFrom}
              onChange={handleSelectChangeLengthFrom}
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="m">m</option>
              <option value="inch">inch</option>
              <option value="foot">foot</option>
              <option value="yard">yard</option>
            </select>
          </div>
          <div style={converterInnerStyle}>
            <label
              className={styles.label__to}
              htmlFor="select__length_unit_to"
            >
              To
            </label>
            <select
              style={inputSelectStyle}
              ref={selectRefLength}
              value={unitLengthTo}
              onChange={handleSelectChangeLengthTo}
            >
              {unitLengthFrom !== "mm" && <option value="mm">mm</option>}
              {unitLengthFrom !== "cm" && <option value="cm">cm</option>}
              {unitLengthFrom !== "m" && <option value="m">m</option>}
              {unitLengthFrom !== "inch" && <option value="inch">inch</option>}
              {unitLengthFrom !== "foot" && <option value="foot">foot</option>}
              {unitLengthFrom !== "yard" && <option value="yard">yard</option>}
            </select>
          </div>
        </>
      )}
      <div
        className={styles.container__output}
        style={{ fontSize: outputFontSize }}
      >
        <p className={styles.output}>{findResultLength()}</p>
        <span className={styles.unit}>{unitLengthTo}</span>
      </div>
    </div>
  );
}
