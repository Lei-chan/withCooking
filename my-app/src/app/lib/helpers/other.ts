import { MESSAGE_TIMEOUT, PASSWORD_REGEX } from "../config/settings";
import { TYPE_LANGUAGE } from "../config/type";

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
      err.name = data.name;
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

export const getFontSizeForLanguage = (
  language: TYPE_LANGUAGE,
  fontSizeEnglish: string
) =>
  language === "ja"
    ? parseFloat(fontSizeEnglish) * 0.9 + "vw"
    : fontSizeEnglish;

//error
export const generateErrorMessage = (
  language: TYPE_LANGUAGE,
  error: any,
  recipeOrUser: "recipe" | "user"
) => {
  if (error.statusCode === 404)
    return language === "ja"
      ? `${recipeOrUser === "recipe" ? "レシピ" : "ユーザー"}が見つかりません！`
      : `${
          recipeOrUser.slice(0, 1).toUpperCase() + recipeOrUser.slice(1)
        } not found!`;

  if (error.statusCode === 401 && error.name === "ValidationError")
    return language === "ja"
      ? "無効なパスワードが入力されました。もう一度お試しください。"
      : "Invalid password provided. Please try again";

  if (error.statusCode === 401 && error.name !== "ValidationError")
    return language === "ja"
      ? "認証に失敗しました。もう一度ログインをし直して下さい。ホームページに移動中…"
      : "Authentication failed. Please log in again. Redirecting to home page...";

  if (error.statusCode === 400 && error.name === "EmailDuplicationError")
    return language === "ja"
      ? "このメールアドレスはすでに使用されています"
      : "This email already exists";

  if (error.statusCode === 400 && error.name !== "EmailDuplicationError")
    return language === "ja"
      ? `以下の項目を要件に合うように直して、もう一度お試し下さい。 ${error.message}`
      : `Please fix the field below so it meets the requirements, and submit again. ${error.message}`;

  //otherwise
  return undefined;
};

export const authErrorRedirect = async (router: any, statusCode: number) => {
  if (statusCode !== 401) return;

  await wait();
  router.push("/");
};
