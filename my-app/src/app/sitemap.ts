import type { MetadataRoute } from "next";
import { WEBSITE_URL } from "./lib/config/settings";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${WEBSITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja`,
          en: `${WEBSITE_URL}/en`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/ja`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja`,
          en: `${WEBSITE_URL}/en`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/en/main`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/main`,
          en: `${WEBSITE_URL}/en/main`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/ja/main`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/main`,
          en: `${WEBSITE_URL}/en/main`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/en/account`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/account`,
          en: `${WEBSITE_URL}/en/account`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/ja/account`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/account`,
          en: `${WEBSITE_URL}/en/account`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/en/converter`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/converter`,
          en: `${WEBSITE_URL}/en/converter`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/ja/converter`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/converter`,
          en: `${WEBSITE_URL}/en/converter`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/en/feedback`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/feedback`,
          en: `${WEBSITE_URL}/en/feedback`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/ja/feedback`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/feedback`,
          en: `${WEBSITE_URL}/en/feedback`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/en/how-to-use`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/how-to-use`,
          en: `${WEBSITE_URL}/en/how-to-use`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/ja/how-to-use`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/how-to-use`,
          en: `${WEBSITE_URL}/en/how-to-use`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/en/news`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/news`,
          en: `${WEBSITE_URL}/en/news`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/ja/news`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/news`,
          en: `${WEBSITE_URL}/en/news`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/en/recipes`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/recipes`,
          en: `${WEBSITE_URL}/en/recipes`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/ja/recipes`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/recipes`,
          en: `${WEBSITE_URL}/en/recipes`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/en/recipes/create`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/recipes/create`,
          en: `${WEBSITE_URL}/en/recipes/create`,
        },
      },
    },
    {
      url: `${WEBSITE_URL}/ja/recipes/create`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
      alternates: {
        languages: {
          ja: `${WEBSITE_URL}/ja/recipes/create`,
          en: `${WEBSITE_URL}/en/recipes/create`,
        },
      },
    },
  ];
}
