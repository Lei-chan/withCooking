"use client";
//react
import { useContext, useEffect, useMemo, useRef, useState } from "react";
//css
import styles from "./page.module.css";
//type
import { TYPE_LANGUAGE, TYPE_MEDIA } from "../lib/config/type";
//mehods to convert
import {
  convertIngUnits,
  convertLengthUnits,
  convertTempUnits,
} from "../lib/helpers/converter";
//context
import { LanguageContext, MediaContext } from "../lib/providers";
import { getTranslatedIngredientsUnit } from "../lib/helpers/recipes";
import { getFontSizeForLanguage } from "../lib/helpers/other";

export default function Converter() {
  const mediaContext = useContext(MediaContext);

  //language
  const languageContext = useContext(LanguageContext);

  const [language, setLanguage] = useState<TYPE_LANGUAGE>("en");

  useEffect(() => {
    if (!languageContext?.language) return;

    setLanguage(languageContext.language);
  }, [languageContext?.language]);

  //design
  const [fontSize, setFontSize] = useState("1.3vw");
  const [smallHeaderStyle, setSmallHeaderStyle] = useState<object>({
    color: "#795200ff",
    letterSpacing: "0.07vw",
    wordSpacing: "0.3vw",
  });
  const [outputFontSize, setOutputFontSize] = useState("1.5vw");
  const [boxStyle, setBoxStyle] = useState({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "antiquewhite",
    gap: "1%",
    borderRadius: "3px",
    width: "70%",
    minHeight: "20%",
    maxHeight: "fit-content",
    fontSize,
  });
  const [converterInnerStyle, setConvertedInnerStyle] = useState({
    width: "70%",
    display: "flex",
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "left",
    height: "fit-content",
    gap: "3%",
    marginTop: "3%",
    marginBottom: "2%",
  });
  const [inputSelectStyle, setInputSelectStyle] = useState({
    minWidth: "25%",
    maxWidth: "50%",
    textAlign: "center",
    letterSpacing: "0.07vw",
    borderRadius: "2%/7%",
    borderColor: "rgba(0, 0, 0, 0.404)",
    height: "fit-content",
    // aspectRatio: "1/0.21",
    fontSize,
  });

  useEffect(() => {
    if (!mediaContext) return;

    const fontSizeEn =
      mediaContext === "mobile"
        ? "4.5vw"
        : mediaContext === "tablet"
        ? "2.5vw"
        : mediaContext === "desktop"
        ? "1.7vw"
        : "1.3vw";

    const fontSizeFinal = getFontSizeForLanguage(language, fontSizeEn);

    setFontSize(fontSizeFinal);
    setSmallHeaderStyle({
      color: "#795200ff",
      letterSpacing: "0.07vw",
      wordSpacing: "0.3vw",
      fontSize: `calc(${fontSizeFinal} * 1.1)`,
      margin: mediaContext === "mobile" ? "5% 0 3% 0" : "3% 0 2% 0",
    });
    setOutputFontSize(`calc(${fontSizeFinal} * 1.1)`);
    setBoxStyle({
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
      fontSize: fontSizeFinal,
    });
    setConvertedInnerStyle({
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
    });
    setInputSelectStyle({
      minWidth: mediaContext === "mobile" ? "35%" : "25%",
      maxWidth: "50%",
      textAlign: "center",
      letterSpacing: "0.07vw",
      borderRadius: "2%/7%",
      borderColor: "rgba(0, 0, 0, 0.404)",
      height: "fit-content",
      fontSize: fontSizeFinal,
    });
  }, [language, mediaContext]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
        width: "100vw",
        minHeight: "100vh",
        maxHeight: "fit-content",
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
        {language === "ja" ? "単位変換" : "Converter"}
      </h1>
      <h3 style={smallHeaderStyle}>
        {language === "ja" ? "材料の単位" : "Ingredient units"}
      </h3>
      <ConverterIng
        mediaContext={mediaContext}
        language={language}
        boxStyle={boxStyle}
        converterInnerStyle={converterInnerStyle}
        inputSelectStyle={inputSelectStyle}
        outputFontSize={outputFontSize}
      />
      <h3 style={smallHeaderStyle}>
        {language === "ja" ? "温度の単位" : "Tempareture units"}
      </h3>
      <ConverterTemp
        mediaContext={mediaContext}
        language={language}
        boxStyle={boxStyle}
        converterInnerStyle={converterInnerStyle}
        inputSelectStyle={inputSelectStyle}
        outputFontSize={outputFontSize}
      />
      <h3 style={smallHeaderStyle}>
        {language === "ja" ? "長さの単位" : "Length units"}
      </h3>
      <ConverterLength
        mediaContext={mediaContext}
        language={language}
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
  language,
  boxStyle,
  converterInnerStyle,
  inputSelectStyle,
  outputFontSize,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  boxStyle: object;
  converterInnerStyle: object;
  inputSelectStyle: object;
  outputFontSize: string;
}) {
  //prettier-ignore
  type AllowedUnitsIng = "g"| "kg"| "oz"| "lb"| "ml"| "L"| "usCup"| "japaneseCup"| "imperialCup"| "riceCup"| "tsp"| "tbsp"| "australianTbsp";

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

    setUnitIngFrom(value as AllowedUnitsIng);
  }

  function handleSelectChangeIngTo(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.currentTarget.value;

    setUnitIngTo(value as AllowedUnitsIng);
  }

  const findResultIng = useMemo(() => {
    const resultsObj = valueIng && convertIngUnits(valueIng, unitIngFrom);

    if (!resultsObj) return;
    const result = resultsObj[unitIngTo]?.amount;

    return result ? result : "";
  }, [valueIng, unitIngFrom, unitIngTo]);

  //Manually reassign setUnitIngTo
  //1. When the select ele 'From' is changed and unitIngTo was same unit as that
  //2. When the select ele 'From' unit is changed to a mass or a not-mass unit
  // Above cases the select element 'To' options are changed by the app, but state unitIngTo isn't reassigned because it's not something triggerd by change event
  useEffect(() => {
    const value = selectRefIng.current?.value;
    if (!value) return;

    if (
      unitIngFrom === unitIngTo ||
      (isMass && !calcIsMass(unitIngTo)) ||
      (!isMass && calcIsMass(unitIngTo))
    )
      setUnitIngTo(value as AllowedUnitsIng);
  }, [unitIngFrom]);

  console.log(language);

  return (
    <div style={boxStyle}>
      {mediaContext !== "mobile" ? (
        <div style={converterInnerStyle}>
          <label htmlFor="input__ingredient_amount">From</label>
          <input
            style={inputSelectStyle}
            type="number"
            placeholder={language === "ja" ? "量" : "Amount"}
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
            <option value="usCup">
              {language === "ja"
                ? getTranslatedIngredientsUnit(language, "usCup")
                : "cup (US)"}
            </option>
            <option value="japaneseCup">
              {language === "ja"
                ? getTranslatedIngredientsUnit(language, "japaneseCup")
                : "cup (Japan)"}
            </option>
            <option value="imperialCup">
              {language === "ja"
                ? getTranslatedIngredientsUnit(language, "imperialCup")
                : "cup (1cup = 250ml)"}
            </option>
            <option value="riceCup">
              {getTranslatedIngredientsUnit(language, "riceCup")}
            </option>
            <option value="tsp">
              {getTranslatedIngredientsUnit(language, "tsp")}
            </option>
            <option value="tbsp">
              {getTranslatedIngredientsUnit(language, "tbsp")}
            </option>
            <option value="australianTbsp">
              {language === "ja"
                ? getTranslatedIngredientsUnit(language, "australianTbsp")
                : "tbsp (Australia)"}
            </option>
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
            {!isMass && unitIngFrom !== "usCup" && (
              <option value="usCup">
                {language === "ja"
                  ? getTranslatedIngredientsUnit(language, "usCup")
                  : "cup (US)"}
              </option>
            )}
            {!isMass && unitIngFrom !== "japaneseCup" && (
              <option value="japaneseCup">
                {language === "ja"
                  ? getTranslatedIngredientsUnit(language, "japaneseCup")
                  : "cup (Japan)"}
              </option>
            )}
            {!isMass && unitIngFrom !== "imperialCup" && (
              <option value="imperialCup">
                {" "}
                {language === "ja"
                  ? getTranslatedIngredientsUnit(language, "imperialCup")
                  : "cup (1cup = 250ml)"}
              </option>
            )}
            {!isMass && unitIngFrom !== "riceCup" && (
              <option value="riceCup">
                {" "}
                {getTranslatedIngredientsUnit(language, "riceCup")}
              </option>
            )}
            {!isMass && unitIngFrom !== "tsp" && (
              <option value="tsp">
                {" "}
                {getTranslatedIngredientsUnit(language, "tsp")}
              </option>
            )}
            {!isMass && unitIngFrom !== "tbsp" && (
              <option value="tbsp">
                {" "}
                {getTranslatedIngredientsUnit(language, "tbsp")}
              </option>
            )}
            {!isMass && unitIngFrom !== "australianTbsp" && (
              <option value="australianTbsp">
                {language === "ja"
                  ? getTranslatedIngredientsUnit(language, "australianTbsp")
                  : "tbsp (Australia)"}
              </option>
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
              placeholder={language === "ja" ? "量" : "Amount"}
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
              <option value="usCup">
                {language === "ja"
                  ? getTranslatedIngredientsUnit(language, "usCup")
                  : "cup (US)"}
              </option>
              <option value="japaneseCup">
                {language === "ja"
                  ? getTranslatedIngredientsUnit(language, "japaneseCup")
                  : "cup (Japan)"}
              </option>
              <option value="imperialCup">
                {language === "ja"
                  ? getTranslatedIngredientsUnit(language, "imperialCup")
                  : "cup (1cup = 250ml)"}
              </option>
              <option value="riceCup">
                {getTranslatedIngredientsUnit(language, "riceCup")}
              </option>
              <option value="tsp">
                {getTranslatedIngredientsUnit(language, "tsp")}
              </option>
              <option value="tbsp">
                {getTranslatedIngredientsUnit(language, "tbsp")}
              </option>
              <option value="australianTbsp">
                {language === "ja"
                  ? getTranslatedIngredientsUnit(language, "australianTbsp")
                  : "tbsp (Australia)"}
              </option>
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
              {!isMass && unitIngFrom !== "usCup" && (
                <option value="usCup">
                  {language === "ja"
                    ? getTranslatedIngredientsUnit(language, "usCup")
                    : "cup (US)"}
                </option>
              )}
              {!isMass && unitIngFrom !== "japaneseCup" && (
                <option value="japaneseCup">
                  {language === "ja"
                    ? getTranslatedIngredientsUnit(language, "japaneseCup")
                    : "cup (Japan)"}
                </option>
              )}
              {!isMass && unitIngFrom !== "imperialCup" && (
                <option value="imperialCup">
                  {" "}
                  {language === "ja"
                    ? getTranslatedIngredientsUnit(language, "imperialCup")
                    : "cup (1cup = 250ml)"}
                </option>
              )}
              {!isMass && unitIngFrom !== "riceCup" && (
                <option value="riceCup">
                  {" "}
                  {getTranslatedIngredientsUnit(language, "riceCup")}
                </option>
              )}
              {!isMass && unitIngFrom !== "tsp" && (
                <option value="tsp">
                  {" "}
                  {getTranslatedIngredientsUnit(language, "tsp")}
                </option>
              )}
              {!isMass && unitIngFrom !== "tbsp" && (
                <option value="tbsp">
                  {" "}
                  {getTranslatedIngredientsUnit(language, "tbsp")}
                </option>
              )}
              {!isMass && unitIngFrom !== "australianTbsp" && (
                <option value="australianTbsp">
                  {language === "ja"
                    ? getTranslatedIngredientsUnit(language, "australianTbsp")
                    : "tbsp (Australia)"}
                </option>
              )}
            </select>
          </div>
        </>
      )}
      <div
        className={styles.container__output}
        style={{ fontSize: outputFontSize }}
      >
        <p className={styles.output}>{findResultIng}</p>
        <span className={styles.unit}>
          {getTranslatedIngredientsUnit(language, unitIngTo)}
        </span>
      </div>
    </div>
  );
}

function ConverterTemp({
  mediaContext,
  language,
  boxStyle,
  converterInnerStyle,
  inputSelectStyle,
  outputFontSize,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
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
            placeholder={language === "ja" ? "温度" : "Temperature"}
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
              placeholder={language === "ja" ? "温度" : "Temperature"}
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
  language,
  boxStyle,
  converterInnerStyle,
  inputSelectStyle,
  outputFontSize,
}: {
  mediaContext: TYPE_MEDIA;
  language: TYPE_LANGUAGE;
  boxStyle: object;
  converterInnerStyle: object;
  inputSelectStyle: object;
  outputFontSize: string;
}) {
  //prettier-ignore
  type AllowedUnitsLength = "mm" | "cm" | "m" | "inch" | "foot" | "yard";

  //language
  const getTranslatedLengthUnit = (
    language: TYPE_LANGUAGE,
    unit: AllowedUnitsLength
  ) => {
    if (language === "ja") {
      if (unit === "inch") return "インチ";
      if (unit === "foot") return "フィート";
      if (unit === "yard") return "ヤード";
    }

    return unit;
  };

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
            placeholder={language === "ja" ? "長さ" : "Length"}
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
            <option value="inch">
              {getTranslatedLengthUnit(language, "inch")}
            </option>
            <option value="foot">
              {getTranslatedLengthUnit(language, "foot")}
            </option>
            <option value="yard">
              {getTranslatedLengthUnit(language, "yard")}
            </option>
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
            {unitLengthFrom !== "inch" && (
              <option value="inch">
                {getTranslatedLengthUnit(language, "inch")}
              </option>
            )}
            {unitLengthFrom !== "foot" && (
              <option value="foot">
                {getTranslatedLengthUnit(language, "foot")}
              </option>
            )}
            {unitLengthFrom !== "yard" && (
              <option value="yard">
                {getTranslatedLengthUnit(language, "yard")}
              </option>
            )}
          </select>
        </div>
      ) : (
        <>
          <div style={converterInnerStyle}>
            <label htmlFor="input__length_amount">From</label>
            <input
              style={inputSelectStyle}
              type="number"
              placeholder={language === "ja" ? "長さ" : "Length"}
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
              <option value="inch">
                {getTranslatedLengthUnit(language, "inch")}
              </option>
              <option value="foot">
                {getTranslatedLengthUnit(language, "foot")}
              </option>
              <option value="yard">
                {getTranslatedLengthUnit(language, "yard")}
              </option>
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
              {unitLengthFrom !== "inch" && (
                <option value="inch">
                  {getTranslatedLengthUnit(language, "inch")}
                </option>
              )}
              {unitLengthFrom !== "foot" && (
                <option value="foot">
                  {getTranslatedLengthUnit(language, "foot")}
                </option>
              )}
              {unitLengthFrom !== "yard" && (
                <option value="yard">
                  {getTranslatedLengthUnit(language, "yard")}
                </option>
              )}
            </select>
          </div>
        </>
      )}
      <div
        className={styles.container__output}
        style={{ fontSize: outputFontSize }}
      >
        <p className={styles.output}>{findResultLength()}</p>
        <span className={styles.unit}>
          {getTranslatedLengthUnit(language, unitLengthTo)}
        </span>
      </div>
    </div>
  );
}
