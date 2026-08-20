export const OAUTH_REDIRECT_STORAGE_KEY = "mstan_oauth_redirect"

/** Kicks off the backend's Google OAuth2 flow via a full browser redirect (not fetch/AJAX) —
 *  the backend owns the entire exchange and eventually redirects back to `/oauth2/redirect`
 *  with `token`/`refresh` query params. */
export function startGoogleOAuth(redirectTo?: string | null) {
  if (redirectTo) {
    sessionStorage.setItem(OAUTH_REDIRECT_STORAGE_KEY, redirectTo)
  }
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? ""
  window.location.href = `${apiOrigin}/oauth2/authorization/google`
}
