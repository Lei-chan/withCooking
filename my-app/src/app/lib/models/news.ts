const news = [
  {
    date: "2025-10-08T11:07:57.990Z",
    title: {
      en: "withCooking is now released!",
      ja: "withCooking(ウィズ・クッキング)がリリースされました！",
    },
    content: {
      en: "withCooking is now released!",
      ja: "withCooking(ウィズ・クッキング)がリリースされました！",
    },
  },
  {
    date: "2025-10-08T11:07:57.990Z",
    title: {
      en: "withCooking is now released!",
      ja: "withCooking(ウィズ・クッキング)がリリースされました！",
    },
    content: {
      en: "withCooking is now released!",
      ja: "withCooking(ウィズ・クッキング)がリリースされました！",
    },
  },
  {
    date: "2025-10-08T11:34:29.072Z",
    title: { en: "withCooking!", ja: "withCooking(ウィズ・クッキング)" },
    content: { en: "withCooking!", ja: "withCooking(ウィズ・クッキング)!" },
  },
  {
    date: "2025-10-25T11:34:29.072Z",
    title: { en: "withCooking!", ja: "withCooking(ウィズ・クッキング)!" },
    content: {
      en: "withCooking is now released!",
      ja: "withCooking(ウィズ・クッキング)がリリースされました！",
    },
  },
];

const newsWithNew = news.map((news) => {
  const daysPassed = Math.floor(
    (Date.now() - new Date(news.date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysPassed < 7 ? { ...news, new: true } : { ...news, new: false };
});

export default newsWithNew.toReversed();
