import { Metadata } from "next";
import { WEBSITE_URL } from "../lib/config/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title =
    locale === "en" ? "withCooking" : "withCooking(ウィズクッキング)";
  const description =
    locale === "en"
      ? "Website where users can use many useful tools for cooking!"
      : "クッキングに便利なツールがたくさん詰まっているウェブサイトです！";
  const metadataBase = new URL(WEBSITE_URL);

  return {
    title,
    description,
    metadataBase,
    keywords: [
      "withCooking",
      "withcooking",
      "ウィズクッキング",
      "ウィズ・クッキング",
      "cooking",
      "recipe",
      "recipe management",
      "クッキング",
      "レシピ",
      "レシピ管理",
      "料理",
    ],
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        ja: "/ja",
      },
    },
    openGraph: {
      siteName: title,
      url: metadataBase,
      //for later
      // images: [
      //   {
      //     url: image,
      //     alt: 'withCooking',
      //     width: 1200,
      //     height: 630,
      //   },
      // ],
      locale: locale === "ja" ? "ja_JP" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      // images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
