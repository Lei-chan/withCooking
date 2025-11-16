const news = [
  {
    date: "2025-11-16T08:13:30.680Z",
    title: {
      en: "withCooking is now released!",
      ja: "withCooking(ウィズ・クッキング)がリリースされました！",
    },
    content: {
      en: "withCooking is now released! You can use lots of useful cooking features here -- all for free! I hope you'll find your way of using the website and enjoy it :)",
      ja: "withCooking(ウィズ・クッキング)がリリースされました！ここではクッキングに便利な機能をたくさん提供しています！無料で使用できますのでいろいろ試して、自分に合う使い方で楽しんでください😊",
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
