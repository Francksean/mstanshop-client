import { CategoryCard } from "./CategoryCard"
import type { Category } from "@/types"

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:pb-0 md:grid-cols-5">
      {categories.map((category) => (
        <div key={category.slug} className="w-32 shrink-0 snap-start sm:w-auto sm:shrink">
          <CategoryCard category={category} />
        </div>
      ))}
    </div>
  )
}
