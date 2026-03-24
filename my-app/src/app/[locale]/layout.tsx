import { WEBSITE_URL } from "../lib/config/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return {
    title: locale === "en" ? "withCooking" : "withCooking(ウィズクッキング)",
    description:
      locale === "en"
        ? "Website where users can use many useful tools for cooking!"
        : "クッキングに便利なツールがたくさん詰まっているウェブサイトです！",
    metadataBase: new URL(WEBSITE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ja: "/ja",
      },
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
