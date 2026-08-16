@AGENTS.md

# CLAUDE.md — MSTAN Shop Client

This file orients Claude Code (and any other agent) working in this repository.
It is meant to grow with the project — see "Keeping this file evolutive" at the
bottom for how and when to update it.

## What this project is

`mstan_shop_client` is the Next.js frontend for MSTAN Shop, an e-commerce MVP.
It talks to a separate Spring Boot backend over a REST API described by the
OpenAPI spec at `doc.txt` (root of this repo). That spec is the single source of
truth for what the backend actually exposes — always check it before assuming an
endpoint or field exists.

- Framework: Next.js 16 (App Router), React 19, TypeScript
- Styling: Tailwind CSS v4
- State: Zustand (`src/stores`)
- Data fetching: hand-written service functions over `axios` (no React Query /
  SWR — see `src/hooks/*` for the thin hooks wrapping services)
- Forms: `react-hook-form` + `zod` + `@hookform/resolvers`
- UI primitives: `radix-ui` / shadcn-style components in `src/components/ui`

⚠️ Read `AGENTS.md` first — this Next.js version may differ from training data.
Check `node_modules/next/dist/docs/` for anything Next.js-API-related before
writing code that touches routing, config, middleware, etc.

## Repository layout

```
src/app/(admin)/     admin dashboard routes (protected by src/proxy.ts)
src/app/(auth)/      login / register
src/app/(shop)/      public storefront: products, cart, checkout, account, faq, legal
src/components/      ui/ (primitives), custom/, layout/, admin/
src/hooks/           thin hooks wrapping lib/services (+ admin/ subfolder)
src/lib/services/    one file per API resource; owns request/response mapping
src/lib/api-client.ts   shared axios instance (auth header injection, 401 handling, dev logging)
src/lib/api-error.ts    normalizes axios errors into a consistent app error shape
src/stores/          zustand stores (auth, cart, guest cart, ui)
src/types/           TypeScript types, incl. raw API response DTOs
src/proxy.ts          Next.js middleware-equivalent — see AGENTS.md, this is a
                       breaking-change area, don't assume it behaves like classic middleware.ts
doc.txt              OpenAPI spec for the backend — the API contract
API_ADDS.md          log of backend gaps discovered while building the frontend
```

## API contract & the API_ADDS.md loop

`doc.txt` is the OpenAPI spec for the real backend. Treat it as authoritative for
what currently exists — don't invent endpoints or fields that aren't in it.

**Whenever frontend work integrates an API endpoint, or hits a need the API
doesn't cover (a missing field, a missing endpoint, pagination/filter behavior
that doesn't exist, etc.), you MUST:**

1. Add an entry to `API_ADDS.md` at the repo root, following the format already
   documented in that file (date, where, need, current workaround, suggested
   fix, status).
2. Explicitly tell the user in your response that `API_ADDS.md` was updated and
   summarize what was added, so it doesn't get missed in a diff.

This applies even for small things — e.g. defaulting a missing field to `""`,
deriving a value client-side because there's no endpoint for it, or reusing an
existing endpoint in a way it wasn't quite designed for (see the existing
entries in `API_ADDS.md` and the comments in `src/lib/services/products.service.ts`
for the pattern). The goal is that the backend team can scan one file and see
every place the frontend had to compensate for a gap, without spelunking
through code comments across the repo.

When a backend fix ships and you remove the workaround, update the entry's
`Status` to `RESOLVED` instead of deleting it, and note where the workaround was
removed.

## Conventions

- **Services own API shape.** Each `src/lib/services/*.service.ts` file is
  responsible for calling `apiClient`, mapping the raw DTO (`*Request`/
  `*Response` types matching `doc.txt`) into the app-facing type used by
  components (see `src/types/product.ts` vs `ProductResponse`/
  `ProductDetailResponse`), and documenting non-obvious mapping decisions with a
  comment. Components and hooks should not call `apiClient` directly.
- **Hooks are thin.** `src/hooks/*` wrap services for use in components (loading
  state, refetching, etc.) — they shouldn't contain business/mapping logic that
  belongs in the service layer.
- **Admin vs shop split.** Admin-only services/hooks live under `services/admin/`
  and `hooks/admin/`; route protection for `/admin/*` is enforced in
  `src/proxy.ts` via the `mstan_role` cookie.
- **Pagination is 0-indexed on the backend, 1-indexed in app code.** See the
  `page - 1` / `data.page + 1` conversions in `products.service.ts` — keep this
  consistent in any new paginated service.
- **Auth token** lives in `useAuthStore` and is injected by the `apiClient`
  request interceptor; a 401 response triggers logout + redirect to `/login`
  automatically (`src/lib/api-client.ts`). Don't duplicate that logic per-call.

## Keeping this file evolutive

This file should track the project as it actually is, not go stale. Update it
when:

- A new top-level domain area is added (e.g. a new `src/app/(x)/` route group,
  a new service resource) — add it to the layout section above.
- A convention is established or changed (new state pattern, new data-fetching
  approach, a lint/type rule the team agreed on) — add or edit a bullet under
  "Conventions".
- The API contract changes in a way that affects how the frontend should work
  (new auth scheme, new pagination shape, etc.) — update the relevant
  convention and note it.
- Any instruction in this file turns out to be wrong or outdated — fix it
  immediately rather than leaving stale guidance; don't let this file silently
  drift from the codebase.

Keep entries short and factual — this file orients an agent quickly, it isn't
a design doc. Prefer editing existing bullets over appending near-duplicates.
Do not remove the `API_ADDS.md` instruction above without an explicit request
from the user — it's a standing process requirement, not a suggestion.
