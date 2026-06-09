import type { MetadataRoute } from "next"

const BASE_URL = "https://www.cbiq.ai"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/premium-dashboard",
        "/vendor-premium-dashboard",
        "/benchmark",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/api/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
