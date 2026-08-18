import type { MetadataRoute } from "next"
import { getProducts } from "@/lib/services/products.service"

// No dynamic APIs are used here, so Next statically generates this route
// at build time by default. `revalidate` opts it into ISR so newly added
// products show up without a full redeploy.
export const revalidate = 3600

const baseUrl = "https://mstanshop.com"

const staticRoutes = [
  "",
  "/products",
  "/faq",
  "/legal/mentions-legales",
  "/legal/cgv",
  "/legal/confidentialite",
  "/legal/retours",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }))

  // Public /products endpoint only returns active products; paginate
  // through all pages to include every product URL.
  const productEntries: MetadataRoute.Sitemap = []
  let page = 1
  let hasMore = true
  while (hasMore) {
    const { items, hasMore: more } = await getProducts({ page, limit: 100 })
    productEntries.push(
      ...items.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(),
      }))
    )
    hasMore = more
    page += 1
  }

  return [...staticEntries, ...productEntries]
}
