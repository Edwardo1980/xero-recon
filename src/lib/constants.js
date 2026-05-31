export const XERO_AUTH_URL    = 'https://login.xero.com/identity/connect/authorize';
export const XERO_TOKEN_URL   = 'https://login.xero.com/identity/connect/token';
export const XERO_API_BASE    = 'https://api.xero.com/api.xro/2.0';
export const XERO_CONNECTIONS = 'https://api.xero.com/connections';
export const SCOPES           = 'openid profile email accounting.transactions accounting.reports.read offline_access';
export const FETCH_TIMEOUT_MS = 15_000;
export const CACHE_STALE_MS   = 2 * 60 * 1000;
export const REDIRECT_URI     = window.location.href.split('?')[0].split('#')[0];
