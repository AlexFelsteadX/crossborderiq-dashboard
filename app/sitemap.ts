import type { MetadataRoute } from "next"

const BASE_URL = "https://www.cbiq.ai"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const routes = [
    "", // home
    "/workforce-intelligence",
    "/vendor-intelligence",
    "/reports",
    "/pricing",
    "/faqs",
    "/contribute",
    "/contact",
    "/privacy",
    "/terms",
    "/refund",
  ]

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }))
}
