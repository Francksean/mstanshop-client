# API_ADDS.md — Backend gaps & requests

This file tracks every place where the frontend needed something the backend API
(`doc.txt`, the MSTAN Shop OpenAPI spec) does not currently provide: missing fields,
missing endpoints, or behavior the frontend had to fake/derive on its own.

It exists so the backend team has a single, append-only log of frontend needs instead
of these gaps living only as scattered code comments. See `CLAUDE.md` → "API contract
& the API_ADDS.md loop" for when and how to add entries here.

Each entry should be small and specific. Use this format:

```
## <short title>
- Date: YYYY-MM-DD
- Where: <file path(s) in the frontend that needed this>
- Need: <what field/endpoint/behavior is missing>
- Current workaround: <what the frontend does today, e.g. hardcoded default, derived value, client-side computation>
- Suggested fix: <ideal shape of the backend fix, if known — new field, new endpoint, etc.>
- Status: OPEN | ACKNOWLEDGED | RESOLVED
```

Mark an entry `RESOLVED` (don't delete it) once the backend ships the fix and the
frontend workaround has been removed — leave a one-line note on where it was removed.

---

## Product: no "featured" flag or endpoint
- Date: 2026-08-15
- Where: `src/lib/services/products.service.ts` (`getFeaturedProducts`)
- Need: A way to mark/query featured products for the homepage.
- Current workaround: Falls back to "most recent products" via `GET /api/products` with no filter, sorted by default order.
- Suggested fix: Either an `isFeatured` boolean field on `Product`/`ProductResponse`, or a dedicated `GET /api/products/featured` endpoint.
- Status: OPEN

## Product: no "related products" endpoint
- Date: 2026-08-15
- Where: `src/lib/services/products.service.ts` (`getRelatedProducts`)
- Need: A way to fetch products related to a given product.
- Current workaround: Fetches the product, then queries `GET /api/products?categoryId=...` and filters out the current product client-side.
- Suggested fix: A `GET /api/products/{id}/related` endpoint with real relevance logic (same category, similar price range, etc.).
- Status: OPEN

## Product: missing `description`/`materials`/`careInstructions` on list responses
- Date: 2026-08-15
- Where: `src/lib/services/products.service.ts` (`mapProductResponse`)
- Need: `ProductResponse` (list/search) only returns id/name/slug/price/stock/categoryName/thumbnailUrl/rating fields — no description, materials, or care instructions.
- Current workaround: These are defaulted to empty strings for list items; only the detail endpoint (`GET /api/products/{id}`, `ProductDetailResponse`) has `description`, and it still has no `materials`/`careInstructions` fields at all.
- Suggested fix: Add `materials` and `careInstructions` fields to `ProductDetailResponse` at minimum.
- Status: OPEN

## Order: no shipping method / shipping cost support
- Date: 2026-08-16
- Where: `src/components/custom/ShippingMethodForm.tsx`, `src/app/(shop)/checkout/page.tsx`, `src/components/custom/OrderSummaryCard.tsx`
- Need: The checkout flow now has a dedicated "Mode de livraison" step (pickup in-store, free vs. home delivery, +1 500 FCFA), but `CreateOrderPayload`/`CreateGuestOrderPayload` (`POST /orders`, `POST /guest/orders`) have no `shippingMethod` or `shippingCost` field, and `OrderResponse` doesn't return one either.
- Current workaround: The shipping method and its cost (`SHIPPING_COSTS` in `ShippingMethodForm.tsx`) are tracked entirely client-side and folded into the on-screen total (`OrderSummaryCard`). The chosen method is never sent to the backend, so the persisted order/subtotal/total on the server does not include the delivery fee, and admins have no record of which shipping method the customer picked.
- Suggested fix: Add a `shippingMethod` (`PICKUP` | `HOME_DELIVERY`) field — or equivalent — to the create-order request, have the backend compute/validate the shipping cost, and return it on `OrderResponse` so `totalAmount` is authoritative and the choice is visible to admins.
- Status: OPEN

## Catalog content (product/category names & descriptions) has no locale support
- Date: 2026-08-16
- Where: `src/lib/services/products.service.ts`, `src/lib/services/categories.service.ts`, `src/components/layout/Header.tsx` (`useCategories`), product/category display throughout the storefront
- Need: The storefront now supports FR/EN for its own UI chrome (next-intl, cookie-based, no URL prefix), but product names, descriptions, materials/care instructions, and category names are returned by the API in a single language and do not follow the visitor's chosen UI locale — an English-reading visitor still sees French product/category names.
- Current workaround: None — catalog content is always displayed in whatever language the backend stores it in, regardless of the active UI locale. Same limitation applies to backend error messages passed through as-is (`data?.message`/`data?.error` in `src/lib/api-error.ts`) when no matching `apiErrors` translation key exists for the error `code`.
- Suggested fix: Locale-aware fields on `Product`/`Category` responses (e.g. `name_fr`/`name_en`, or an `Accept-Language`-aware response), and consistent machine-readable `code`s on every error response so the frontend can always resolve a fully translated message instead of falling back to a raw backend string.
- Status: OPEN
