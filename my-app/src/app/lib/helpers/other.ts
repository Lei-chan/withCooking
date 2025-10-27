import { MESSAGE_TIMEOUT, PASSWORD_REGEX } from "../config/settings";

export function wait(second: number = MESSAGE_TIMEOUT) {
  return new Promise((resolve) => {
    setTimeout(resolve, second * 1000);
  });
}

export const getData = async (path: string, option: object) => {
  try {
    const res = await fetch(path, option);
    const data = await res.json();

    if (!res.ok) {
      const err: any = new Error(data.error);
      err.statusCode = res.status;
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export function getSize(width: string, ratio: number, defaultRatio: string) {
  return width.includes("px") ? `${parseInt(width) * ratio}px` : defaultRatio;
}

export const validatePassword = (input: string) => {
  const passwordRegex = PASSWORD_REGEX;

  return passwordRegex.test(input);
};
