import { XERO_AUTH_URL, XERO_TOKEN_URL, REDIRECT_URI, SCOPES, FETCH_TIMEOUT_MS } from './constants.js';
import { useAuthStore } from './store.js';

// ── Crypto helpers ────────────────────────────────────────────
function b64url(buf) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return b64url(buf);
}

function randString(n = 32) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return b64url(arr);
}

// ── Fetch with timeout ────────────────────────────────────────
export async function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Request timed out after 15 seconds.', { cause: e });
    throw e;
  } finally {
    clearTimeout(id);
  }
}

// ── Retry with backoff ────────────────────────────────────────
export async function withRetry(fn, maxAttempts = 3) {
  let lastErr;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const permanent =
        e.message.includes('401') ||
        e.message.includes('403') || e.message.includes('Permission denied') ||
        e.message.includes('429') || e.message.includes('rate limit') ||
        e.message.includes('State mismatch') || e.name === 'AbortError' ||
        e.message === 'NOT_AUTHENTICATED' || e.message === 'NO_TENANT';
      if (permanent || i === maxAttempts - 1) throw e;
      await new Promise(r => setTimeout(r, (i + 1) * 1500));
    }
  }
  throw lastErr;
}

// ── PKCE build URL ────────────────────────────────────────────
export async function buildAuthURL(clientId) {
  const verifier  = randString(43);
  const challenge = await sha256(verifier);
  const state     = randString(16);

  sessionStorage.setItem('xero_codeVerifier', JSON.stringify(verifier));
  sessionStorage.setItem('xero_state',        JSON.stringify(state));

  return `${XERO_AUTH_URL}?${new URLSearchParams({
    response_type:         'code',
    client_id:             clientId,
    redirect_uri:          REDIRECT_URI,
    scope:                 SCOPES,
    state,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
  })}`;
}

// ── Exchange code for tokens ──────────────────────────────────
export async function exchangeCode(code, returnedState) {
  const savedState = JSON.parse(sessionStorage.getItem('xero_state') ?? 'null');
  if (returnedState !== savedState) throw new Error('State mismatch — possible security issue. Please try again.');

  const verifier     = JSON.parse(sessionStorage.getItem('xero_codeVerifier') ?? 'null');
  const { clientId, clientSecret, saveTokens } = useAuthStore.getState();

  const body    = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, client_id: clientId, code_verifier: verifier });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (clientSecret) headers['Authorization'] = 'Basic ' + btoa(`${clientId}:${clientSecret}`);

  const resp = await fetchWithTimeout(XERO_TOKEN_URL, { method: 'POST', headers, body });
  if (!resp.ok) {
    const raw  = await resp.text().catch(() => '');
    let detail = raw;
    try { const j = JSON.parse(raw); detail = j.error_description || j.error || raw; } catch { /* not JSON */ }
    throw new Error(`Token exchange failed (${resp.status})${detail ? `: ${detail}` : ''}`);
  }
  const tokens = await resp.json();
  // Clear PKCE values immediately after use — they have no value after exchange
  sessionStorage.removeItem('xero_state');
  sessionStorage.removeItem('xero_codeVerifier');
  saveTokens(tokens);
  return tokens;
}

// ── Deduped token refresh ─────────────────────────────────────
let _refreshInFlight = null;

export async function doRefreshToken() {
  if (_refreshInFlight) return _refreshInFlight;

  _refreshInFlight = (async () => {
    const { refreshToken, clientId, clientSecret, saveTokens, clearTokens } = useAuthStore.getState();
    if (!refreshToken) throw new Error('NOT_AUTHENTICATED');

    const body    = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId });
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (clientSecret) headers['Authorization'] = 'Basic ' + btoa(`${clientId}:${clientSecret}`);

    const resp = await fetchWithTimeout(XERO_TOKEN_URL, { method: 'POST', headers, body });
    if (!resp.ok) { clearTokens(); throw new Error('NOT_AUTHENTICATED'); }

    const tokens = await resp.json();
    saveTokens(tokens);
    return tokens.access_token;
  })().finally(() => { _refreshInFlight = null; });

  return _refreshInFlight;
}

// ── Get valid token (refresh if near expiry) ──────────────────
export async function getToken() {
  const { accessToken, expiresAt } = useAuthStore.getState();
  if (!accessToken) throw new Error('NOT_AUTHENTICATED');
  if (Date.now() > expiresAt - 120_000) return doRefreshToken();
  return accessToken;
}
