import { TYPE_INGREDIENT_UNIT } from "../config/type";

export const convertTempUnits = function (
  value: number,
  optionFrom: "℉" | "F" | "f" | "℃" | "C" | "c"
) {
  let result;

  if (optionFrom === "℉" || optionFrom.toLowerCase() === "f")
    result = (value - 32) * (5 / 9);

  if (optionFrom === "℃" || optionFrom.toLowerCase() === "c")
    result = value * (9 / 5) + 32;

  return result ? +result.toFixed(1) : 0;
};

export const convertIngUnits = function (
  amount: number,
  unitFrom: TYPE_INGREDIENT_UNIT | string
) {
  ///for main page toFixed(1)
  let metric;
  let us;
  let japan;
  let australia;
  let metricCup;

  ///For converter page toFixed(3)
  let g;
  let kg;
  let oz;
  let lb;
  let ml;
  let L;
  let usCup;
  let japaneseCup;
  let imperialCup;
  let riceCup;
  let tsp;
  let tbsp;
  let australianTbsp;

  if (unitFrom === "g") {
    metric = { amount, unit: unitFrom };
    us = { amount: +(amount / 28.3495).toFixed(1), unit: "oz" };
    japan = metric;
    metricCup = metric;
    australia = metric;
    g = metric;
    oz = { amount: +(amount / 28.3495).toFixed(3), unit: "oz" };
  }

  if (unitFrom === "kg") {
    metric = { amount, unit: unitFrom };
    us = { amount: +(amount * 2.20462).toFixed(1), unit: "lb" };
    japan = metric;
    metricCup = metric;
    australia = metric;
    g = { amount: +(amount * 1000).toFixed(3), unit: "g" };
    oz = { amount: +(amount * 35.274).toFixed(3), unit: "oz" };
  }

  if (unitFrom === "oz") {
    metric = { amount: +(amount * 28.3495).toFixed(1), unit: "g" };
    us = { amount, unit: unitFrom };
    japan = metric;
    metricCup = metric;
    australia = metric;
    g = { amount: +(amount * 28.3495).toFixed(3), unit: "g" };
    oz = us;
  }

  if (unitFrom === "lb") {
    metric = { amount: +(amount / 35.274).toFixed(1), unit: "kg" };
    us = { amount, unit: unitFrom };
    japan = metric;
    metricCup = metric;
    australia = metric;
    g = { amount: +(amount * 453.592).toFixed(3), unit: "g" };
    oz = { amount: +(amount * 16).toFixed(3), unit: "oz" };
  }

  if (unitFrom === "ml") {
    metric = { amount, unit: unitFrom };
    us = { amount: +(amount / 240).toFixed(1), unit: "usCup" };
    japan = { amount: +(amount / 200).toFixed(1), unit: "japaneseCup" };
    metricCup = { amount: +(amount / 250).toFixed(1), unit: "imperialCup" };
    australia = metricCup;
    ml = { amount, unit: unitFrom };
  }

  if (unitFrom === "L") {
    metric = { amount, unit: unitFrom };
    us = { amount: +(amount * 4.167).toFixed(1), unit: "usCup" };
    japan = { amount: +(amount * 5).toFixed(1), unit: "japaneseCup" };
    metricCup = { amount: +(amount * 4).toFixed(1), unit: "imperialCup" };
    australia = metricCup;
    ml = { amount: +(amount * 1000).toFixed(3), unit: "ml" };
  }

  if (unitFrom === "usCup") {
    metric = { amount: +(amount * 240).toFixed(1), unit: "ml" };
    us = { amount, unit: "usCup" };
    japan = { amount: +(amount * 1.2).toFixed(1), unit: "japaneseCup" };
    metricCup = { amount: +(amount * 0.96).toFixed(1), unit: "imperialCup" };
    australia = metricCup;
    ml = { amount: +(amount * 240).toFixed(3), unit: "ml" };
  }

  if (unitFrom === "japaneseCup") {
    metric = { amount: +(amount * 200).toFixed(1), unit: "ml" };
    us = { amount: +(amount * 0.833).toFixed(1), unit: "usCup" };
    japan = { amount, unit: "japaneseCup" };
    metricCup = { amount: +(amount * 0.8).toFixed(1), unit: "imperialCup" };
    australia = metricCup;
    ml = { amount: +(amount * 200).toFixed(3), unit: "ml" };
  }

  if (unitFrom === "imperialCup") {
    metric = { amount: +(amount * 250).toFixed(1), unit: "ml" };
    us = { amount: +(amount * 1.041).toFixed(1), unit: "usCup" };
    japan = { amount: +(amount * 1.25).toFixed(1), unit: "japaneseCup" };
    metricCup = { amount, unit: "imperialCup" };
    australia = metricCup;
    ml = { amount: +(amount * 250).toFixed(3), unit: "ml" };
  }

  if (unitFrom === "riceCup") {
    metric = { amount: +(amount * 180).toFixed(1), unit: "ml" };
    us = { amount: +(amount * 0.75).toFixed(1), unit: "usCup" };
    japan = { amount: +(amount * 0.9).toFixed(1), unit: "japaneseCup" };
    metricCup = { amount: +(amount * 0.72).toFixed(1), unit: "imperialCup" };
    australia = metricCup;
    ml = { amount: +(amount * 180).toFixed(3), unit: "ml" };
  }

  if (unitFrom === "tsp") {
    metric = { amount: +(amount * 5).toFixed(1), unit: "ml" };
    us = { amount, unit: unitFrom };
    japan = us;
    metricCup = us;
    australia = us;
    ml = { amount: +(amount * 5).toFixed(3), unit: "ml" };
  }

  if (unitFrom === "tbsp") {
    metric = { amount: +(amount * 15).toFixed(1), unit: "ml" };
    us = { amount, unit: unitFrom };
    japan = us;
    metricCup = us;
    australia = { amount: +(amount * 0.75).toFixed(1), unit: "australianTbsp" };
    ml = { amount: +(amount * 15).toFixed(3), unit: "ml" };
  }

  if (unitFrom === "australianTbsp") {
    metric = { amount: +(amount * 20).toFixed(1), unit: "ml" };
    us = { amount: +(amount * 1.3333).toFixed(1), unit: "tbsp" };
    japan = us;
    metricCup = us;
    australia = { amount, unit: "australianTbsp" };
    ml = { amount: +(amount * 20).toFixed(3), unit: "ml" };
  }

  kg = g && { amount: +(g.amount / 1000).toFixed(3), unit: "kg" };
  lb = oz && { amount: +(oz.amount / 16).toFixed(3), unit: "lb" };
  L = ml && { amount: +(ml.amount / 1000).toFixed(3), unit: "L" };
  usCup = ml && { amount: +(ml.amount / 240).toFixed(3), unit: "usCup" };
  japaneseCup = ml && {
    amount: +(ml.amount / 200).toFixed(3),
    unit: "japaneseCup",
  };
  imperialCup = ml && {
    amount: +(ml.amount / 250).toFixed(3),
    unit: "imperialCup",
  };
  riceCup = ml && { amount: +(ml.amount / 180).toFixed(3), unit: "riceCup" };
  tsp = ml && { amount: +(ml.amount / 5).toFixed(3), unit: "tsp" };
  tbsp = ml && { amount: +(ml.amount / 15).toFixed(3), unit: "tbsp" };
  australianTbsp = ml && {
    amount: +(ml.amount / 20).toFixed(3),
    unit: "australianTbsp",
  };

  return {
    original: { amount, unit: unitFrom },
    metric: metric || undefined,
    us: us || undefined,
    japan: japan || undefined,
    australia: australia || undefined,
    metricCup: metricCup || undefined,
    g: g || undefined,
    kg: kg || undefined,
    oz: oz || undefined,
    lb: lb || undefined,
    ml: ml || undefined,
    L: L || undefined,
    usCup: usCup || undefined,
    japaneseCup: japaneseCup || undefined,
    imperialCup: imperialCup || undefined,
    riceCup: riceCup || undefined,
    tsp: tsp || undefined,
    tbsp: tbsp || undefined,
    australianTbsp: australianTbsp || undefined,
  };
};

export const convertLengthUnits = function (
  length: number,
  unitFrom: "mm" | "cm" | "m" | "inch" | "foot" | "yard"
) {
  let mm;
  let cm;
  let m;
  let inch;
  let foot;
  let yard;

  if (unitFrom === "mm") {
    mm = { length, unit: unitFrom };
    inch = { length: +(length / 25.4).toFixed(3), unit: "inch" };
  }

  if (unitFrom === "cm") {
    mm = { length: length * 10, unit: "mm" };
    inch = { length: +(length / 2.54).toFixed(3), unit: "inch" };
  }

  if (unitFrom === "m") {
    mm = { length: length * 1000, unit: "mm" };
    inch = { length: +(length * 39.37).toFixed(3), unit: "inch" };
  }

  if (unitFrom === "inch") {
    mm = { length: +(length * 25.4).toFixed(3), unit: "mm" };
    inch = { length, unit: unitFrom };
  }

  if (unitFrom === "foot") {
    mm = { length: +(length * 304.8).toFixed(3), unit: "mm" };
    inch = { length: length * 12, unit: "inch" };
  }

  if (unitFrom === "yard") {
    mm = { length: +(length * 914.4).toFixed(3), unit: "mm" };
    inch = { length: length * 36, unit: "inch" };
  }

  cm = mm && { length: +(mm.length / 10).toFixed(3), unit: "cm" };
  m = cm && { length: +(cm.length / 100).toFixed(3), unit: "m" };
  foot = inch && { length: +(inch.length / 12).toFixed(3), unit: "foot" };
  yard = foot && { length: +(foot.length / 3).toFixed(3), unit: "yard" };

  return { mm, cm, m, inch, foot, yard };
};
