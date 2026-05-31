# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server on http://localhost:5173
npm run build    # production build → dist/
npm run lint     # ESLint across src/
npm run preview  # serve the dist/ build locally
```

There are no tests. CI runs lint + build on every push.

To bump the app version, change `"version"` in `package.json` — it flows automatically to the footer via Vite's `define.__APP_VERSION__` and to the SW cache name (update `CACHE_NAME` in `public/sw.js` manually to match).

## Architecture

### Auth flow (PKCE OAuth2)
`SetupScreen` saves Client ID/Secret → `ConnectScreen` calls `buildAuthURL()` which generates a PKCE verifier/challenge and opens Xero login → Xero redirects back with `?code=&state=` → `OAuthInterceptor` in `App.jsx` detects these query params, clears the URL, and navigates to `/callback` passing code+state via React Router in-memory state (never touches sessionStorage) → `CallbackWrapper` reads them via `useLocation().state` → `exchangeCode()` validates the state, POSTs to Xero's token endpoint, then clears PKCE values from sessionStorage → `loadConnections()` fetches orgs → single org auto-selects, multiple orgs go to `OrgPickerScreen`.

### State management (Zustand — `src/lib/store.js`)
Two tiers of persistence, both under `useAuthStore`:
- **Credentials** (`clientId`, `clientSecret`): `localStorage` with `xero_cred_` prefix — survive tab close
- **Session** (`accessToken`, `refreshToken`, `expiresAt`, `tenantId`, `tenantName`, `allConnections`): `sessionStorage` with `xero_` prefix — cleared on tab close

`clearTokens()` wipes the session tier only. `clearAll()` wipes both tiers.

### API layer (`src/lib/auth.js` + `src/lib/xero.js`)
- `fetchWithTimeout(url, options, ms=15000)` — wraps every HTTP call with an AbortController
- `withRetry(fn, maxAttempts=3)` — exponential backoff (1.5s, 3s); skips retry for 401/403/429/Permission-denied/NOT_AUTHENTICATED/NO_TENANT/AbortError/rate-limit
- `getToken()` — refreshes automatically if the token is within 2 minutes of expiry
- `doRefreshToken()` — deduped: concurrent calls share one in-flight promise via `_refreshInFlight`
- `xeroGet(path)` — adds auth headers, handles 401 with one token-refresh retry, handles 429 with Retry-After delay
- `fetchReconciliationData()` — paginates BankTransactions (100/page, up to 10 pages), fetches Accounts in parallel

### Routing (`src/App.jsx`)
HashRouter is used so `?code=&state=` OAuth params land in `window.location.search` (not swallowed by the router). Route guards: `RequireAuth` (needs clientId + accessToken), `RequireCreds` (needs clientId only). All five screens are lazy-loaded via `React.lazy`.

### Data fetching
TanStack Query v5 via `useReconciliation()` / `useForceRefresh()` in `src/hooks/useReconciliation.js`. Cache is stale after 2 minutes (`CACHE_STALE_MS`). `NOT_AUTHENTICATED`, `NO_TENANT`, 403/Permission-denied, and 429/rate-limit errors are not retried (xeroGet already handles Retry-After for 429 before throwing).

### CSP
Injected at **build time only** (not dev) by the `inject-csp` Vite plugin in `vite.config.js`. Dev server has no CSP so HMR works. The CSP restricts `connect-src` to `login.xero.com`, `api.xero.com`, and `identity.xero.com`.

### Accessibility
- All `<button>` elements have explicit `type="button"` to prevent accidental form submission
- Interactive non-button elements (org picker, expandable rows) use `role="button"` + `tabIndex` + `onKeyDown` handlers for keyboard support
- Every interactive element has `:focus-visible` styles using `var(--accent)` outline
- FAQ accordion uses native `<details>`/`<summary>` for zero-JS keyboard/screenreader support
- Route changes are announced via `#ariaAnnounce` live region in `App.jsx`
- External links include `(opens in new tab)` in their `aria-label`
- `prefers-reduced-motion` disables all animations via `globals.css`

### Service Worker (`public/sw.js`)
Cache-first for the app shell (index.html, manifest, icon). Xero API calls always go to network. The SW does **not** call `skipWaiting()` on install — it waits for existing clients. `useSwUpdate()` in `useSessionWatcher.js` detects the waiting SW and shows the "Reload to update" banner. When the user clicks it, `SKIP_WAITING` is posted, the new SW activates, and the page reloads. Update `CACHE_NAME` manually when the shell changes significantly.

### Zustand selector pattern
Use `useShallow` from `zustand/react/shallow` when selecting multiple fields as an object. Without it, Zustand uses `Object.is` and re-renders on any store update even if the selected values haven't changed:
```js
import { useShallow } from 'zustand/react/shallow';
const { a, b } = useAuthStore(useShallow(s => ({ a: s.a, b: s.b })));
```

### Deployment
Static files only — deploy `dist/` to any CDN or static host. Set `VITE_REDIRECT_URI` to the app's fixed URL if the auto-detected `window.location` would be wrong (e.g. behind a reverse proxy). Register the same URI as the Xero app's redirect URI.
