import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// XAF stays fixed regardless of language (it's a CFA-franc storefront) — only
// the digit-grouping locale should follow the active UI language.
const priceFormatters = new Map<string, Intl.NumberFormat>();

function getPriceFormatter(locale: string): Intl.NumberFormat {
  let formatter = priceFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "XAF",
      maximumFractionDigits: 0,
    });
    priceFormatters.set(locale, formatter);
  }
  return formatter;
}

export function formatPrice(amount: number, locale: string = "fr"): string {
  return getPriceFormatter(locale).format(amount);
}

/**
 * Product/variant image URLs come back from the API as host-relative paths
 * (e.g. `/uploads/products/.../photo.jpg`) — prefix them with the API host
 * so `<img src>` resolves against the backend rather than this Next.js app.
 */
export function resolveMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}
