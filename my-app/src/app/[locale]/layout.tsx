import { WEBSITE_URL } from "../lib/config/settings";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;

  return {
    title: "withCooking",
    description:
      "Application where users can use many useful tools for cooking!",
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
