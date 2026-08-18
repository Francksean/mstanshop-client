import type { MetadataRoute } from "next"

const baseUrl = "https://mstanshop.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/cart", "/checkout"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
