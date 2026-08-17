"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FiltersPanel,
  type FiltersState,
} from "@/components/custom/FiltersPanel";
import { SearchBar } from "@/components/custom/SearchBar";
import { SortDropdown } from "@/components/custom/SortDropdown";
import { ProductGrid } from "@/components/custom/ProductGrid";
import { Pagination } from "@/components/custom/Pagination";
import { EmptyState } from "@/components/custom/EmptyState";
import { TrustBadges } from "@/components/custom/TrustBadges";
import { useProducts } from "@/hooks/useProducts";
import { getCategories } from "@/lib/services/categories.service";
import { MAX_PRICE, MIN_PRICE } from "@/lib/constants";
import type { Category, SortOption } from "@/types";

function CatalogContent() {
  const t = useTranslations("products");
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlugParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  const [searchText, setSearchText] = useState(searchParam ?? "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState<SortOption>("newest");
  const [filters, setFilters] = useState<FiltersState>({
    categoryIds: [],
    minPrice: MIN_PRICE,
    maxPrice: MAX_PRICE,
    colors: [],
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
      if (categorySlugParam) {
        const match = data.find((c) => c.slug === categorySlugParam);
        if (match?.id) {
          setFilters((prev) => ({ ...prev, categoryIds: [match.id!] }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queryFilters = useMemo(
    () => ({
      categoryIds: filters.categoryIds.length ? filters.categoryIds : undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      colors: filters.colors.length ? filters.colors : undefined,
      search: searchParam || undefined,
      sort,
    }),
    [filters, searchParam, sort],
  );

  const { items, page, total, hasMore, isLoading, fetchPage } =
    useProducts(queryFilters);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchText.trim()) params.set("search", searchText.trim());
    if (categorySlugParam) params.set("category", categorySlugParam);
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-fit md:hidden"
            onClick={() => setIsFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" /> {t("filtersButton")}
          </Button>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      <p className="mb-6 text-small text-ink/60">
        {t("resultsCount", { count: total })}
      </p>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
        <FiltersPanel
          filters={filters}
          onChange={setFilters}
          categories={categories}
          className="hidden md:flex md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:self-start md:overflow-y-auto"
        />

        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetContent
            side="bottom"
            className="max-h-[80vh] overflow-y-auto bg-background"
          >
            <SheetHeader>
              <SheetTitle className="text-h2">{t("filtersTitle")}</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">
              <FiltersPanel
                filters={filters}
                onChange={setFilters}
                categories={categories}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div>
          {!isLoading && items.length === 0 ? (
            <EmptyState
              title={t("noResultsTitle")}
              description={t("noResultsDescription")}
            />
          ) : (
            <>
              <ProductGrid
                products={items}
                isLoading={isLoading && items.length === 0}
              />
              <Pagination
                page={page}
                total={total}
                hasMore={hasMore}
                isLoading={isLoading}
                onPageChange={fetchPage}
              />
            </>
          )}
        </div>
      </div>

      <TrustBadges variant="inline" align="start" className="mt-16 border-t border-black/10 pt-10" />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogContent />
    </Suspense>
  );
}
