//component
import { ja } from "zod/locales";
import ButtonOpenAgreement from "../components/ButtonOpenAgreement/ButtonOpenAgreement";

const news = [
  {
    date: "2025-11-16T08:13:30.680Z",
    title: {
      en: "withCooking is now released!",
      ja: "withCooking(ウィズ・クッキング)がリリースされました！",
    },
    content: {
      en: (
        <p>
          withCooking is now released! You can use lots of useful cooking
          features here - all for free! I hope you&apos;ll find your way of
          using the website and enjoy it :)
        </p>
      ),
      ja: (
        <p>
          withCooking(ウィズ・クッキング)がリリースされました！ここではクッキングに便利な機能をたくさん提供しています！無料で使用できますのでいろいろ試して、自分に合う使い方で楽しんでください😊
        </p>
      ),
    },
  },
  {
    date: "2025-11-23T08:13:30.680Z",
    title: {
      en: "Our privacy policy has been updated",
      ja: "プライバシーポリシーが改訂されました",
    },
    content: {
      en: (
        <>
          <p>We updated our privacy policy. Please check it out.</p>
          <ButtonOpenAgreement language="en" />
        </>
      ),
      ja: (
        <>
          <p>
            withCooking(ウィズ・クッキング)のプライバシーポリシーが改訂されました。ご確認をお願いします。
          </p>
          <ButtonOpenAgreement language="ja" />
        </>
      ),
    },
  },
  {
    date: "2026-01-05T08:13:30.680Z",
    title: {
      ja: "レシピの上限を設定しました",
      en: "We have set the recipe limit",
    },
    content: {
      ja: (
        <p>
          withCookingのサーバー容量の関係で、ユーザーの皆さんが無料で作成できるレシピの上限を設定しました。はじめから作るレシピ・外部リンクから作るレシピ合わせて100レシピまで無料で作成いただけます。ご迷惑をおかけして申し訳ありませんが、ご理解の程よろしくお願いいたします。
        </p>
      ),
      en: (
        <p>
          Due to server capaxity limitations, We have set a limit on the number
          of recipes users can create for free. You can create up to 100 recipes
          for free, including both original recipes and those created from
          external links. We apologize for the inconvenience and appreciate your
          understanding.
        </p>
      ),
    },
  },
  {
    date: "2026-01-08T08:13:30.680Z",
    title: {
      ja: "リンクから作成するレシピに、コメントを付けらるようになりました！",
      en: "You can now add comments for recipes created from external links!",
    },
    content: {
      ja: (
        <p>
          リンクから作成するレシピに、コメントを付けらるようになりました！レシピで毎回変える箇所や、オリジナルのトッピングなどを入力すると便利です！
        </p>
      ),
      en: (
        <p>
          You can now add comments for recipes created from external links! It's
          useful to input the parts of the recipes you always change or your
          original toppings!
        </p>
      ),
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
