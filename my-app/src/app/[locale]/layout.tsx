import { Metadata } from "next";
import {
  APP_DESCRIPTION,
  APP_NAME,
  METADATA_BASE,
} from "../lib/config/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === "en" ? APP_NAME : "withCooking(ウィズクッキング)";
  const description =
    locale === "en"
      ? APP_DESCRIPTION
      : "クッキングに便利なツールがたくさん詰まっているウェブサイトです！";

  return {
    title,
    description,
    metadataBase: METADATA_BASE,
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
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ja: "/ja",
      },
    },
    openGraph: {
      siteName: title,
      url: `/${locale}`,
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
