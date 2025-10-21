const news = [
  {
    date: "2025-10-08T11:07:57.990Z",
    title: "withCooking is now released!",
    content: "withCooking is now released!",
  },
  {
    date: "2025-10-08T11:07:57.990Z",
    title: "withCooking is now released!",
    content: "withCooking is now released!",
  },
  {
    date: "2025-10-08T11:34:29.072Z",
    title: "withCooking!",
    content: "withCooking!",
  },
  {
    date: "2025-10-25T11:34:29.072Z",
    title: "withCooking!",
    content:
      "withCooking is now released! Bugs are fixed. withCooking is now released! Bugs are fixed. withCooking is now released! Bugs are fixed. withCooking is now released! Bugs are fixed.",
  },
];

const newsWithNew = news.map((news) => {
  const daysPassed = Math.floor(
    (Date.now() - new Date(news.date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysPassed < 7 ? { ...news, new: true } : { ...news, new: false };
});

export default newsWithNew.toReversed();
