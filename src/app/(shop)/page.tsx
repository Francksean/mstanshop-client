import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Hero } from "@/components/custom/Hero"
import { CategoryGrid } from "@/components/custom/CategoryGrid"
import { ProductGrid } from "@/components/custom/ProductGrid"
import { CategoryShowcaseSection } from "@/components/custom/CategoryShowcaseSection"
import { FaqSection } from "@/components/custom/FaqSection"
import { SectionDivider } from "@/components/custom/SectionDivider"
import { SectionReveal } from "@/components/custom/SectionReveal"
import { getFeaturedProducts, getProducts } from "@/lib/services/products.service"
import { getCategories } from "@/lib/services/categories.service"

const SHOWCASE_CATEGORY_COUNT = 3

export default async function LandingPage() {
  const t = await getTranslations("home")
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(4),
    getCategories(),
  ])

  const showcaseCategories = categories.filter((c) => c.id).slice(0, SHOWCASE_CATEGORY_COUNT)
  const showcaseResults = await Promise.all(
    showcaseCategories.map((category) => getProducts({ categoryIds: [category.id!], limit: 4 }))
  )
  const showcases = showcaseCategories
    .map((category, i) => ({ category, products: showcaseResults[i].items }))
    .filter((showcase) => showcase.products.length > 0)

  return (
    <div className="flex flex-col gap-10 pb-16 md:gap-20">
      <Hero />

      <SectionDivider />

      <SectionReveal className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <h2 className="mb-8 font-heading text-h1 text-ink">{t("exploreByCategory")}</h2>
        <CategoryGrid categories={categories} />
      </SectionReveal>

      <SectionDivider />

      <SectionReveal className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-heading text-h1 text-ink">{t("featuredSelection")}</h2>
          <Link
            href="/products"
            className="text-body font-medium text-sangria underline decoration-gold underline-offset-4"
          >
            {t("seeAll")}
          </Link>
        </div>
        <ProductGrid products={featuredProducts} columns="2-3" scrollOnMobile />
      </SectionReveal>

      {showcases.map(({ category, products }) => (
        <div key={category.id} className="flex flex-col gap-10 md:gap-20">
          <SectionDivider />
          <SectionReveal>
            <CategoryShowcaseSection category={category} products={products} />
          </SectionReveal>
        </div>
      ))}

      <SectionDivider />

      <SectionReveal>
        <FaqSection />
      </SectionReveal>
    </div>
  )
}
