"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, SlidersHorizontal } from "lucide-react";
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
        const slugs = categorySlugParam.split(",");
        const ids = data
          .filter((c) => c.id && slugs.includes(c.slug))
          .map((c) => c.id!);
        if (ids.length) {
          setFilters((prev) => ({ ...prev, categoryIds: ids }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps the URL in sync with the active filters/sort so the catalog state is
  // shareable/bookmarkable. Skipped until categories load when a `?category=`
  // slug is present, so it doesn't briefly wipe that param before it's resolved.
  useEffect(() => {
    if (categorySlugParam && categories.length === 0) return;

    const params = new URLSearchParams();
    if (searchParam) params.set("search", searchParam);
    if (filters.categoryIds.length) {
      const slugs = filters.categoryIds
        .map((id) => categories.find((c) => c.id === id)?.slug)
        .filter(Boolean);
      if (slugs.length) params.set("category", slugs.join(","));
    }
    if (filters.minPrice !== MIN_PRICE) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== MAX_PRICE) params.set("maxPrice", String(filters.maxPrice));
    if (sort !== "newest") params.set("sort", sort);

    const qs = params.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, categories, categorySlugParam, searchParam]);

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

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          fetchPage(page + 1, "append");
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, page, fetchPage]);

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
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-8">
                  {isLoading && items.length > 0 && (
                    <Loader2 className="h-5 w-5 animate-spin text-ink/40" />
                  )}
                </div>
              )}
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
