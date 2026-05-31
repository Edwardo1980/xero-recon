export function fmt(n, currency = '') {
  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency', currency, maximumFractionDigits: 2,
        notation: Math.abs(n) >= 1_000_000 ? 'compact' : 'standard',
      }).format(n);
    } catch {
      // Fall through to simple format if currency code is invalid
    }
  }
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${currency} ${(n / 1_000).toFixed(1)}K`;
  return `${currency} ${parseFloat(n).toFixed(2)}`;
}

export function parseXeroDate(xeroDate) {
  if (!xeroDate) return '—';
  const m = String(xeroDate).match(/\/Date\((-?\d+)/);
  if (m) return new Date(parseInt(m[1])).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' });
  return xeroDate;
}

export function translateError(msg) {
  if (!msg) return 'An unexpected error occurred. Please try again.';
  if (msg === 'NOT_AUTHENTICATED') return 'Your session has expired. Please reconnect to Xero.';
  if (msg.includes('State mismatch')) return 'Security check failed. Please start the login process again.';
  if (msg.includes('401') || msg.includes('Unauthorized')) return 'Your Xero session has expired. Please reconnect.';
  if (msg.includes('403') || msg.includes('Forbidden')) return 'Permission denied. Make sure your Xero app has the required scopes.';
  if (msg.includes('429') || msg.includes('Too Many')) return 'Too many requests — Xero has rate-limited your app. Please wait a minute before refreshing.';
  if (msg.includes('503') || msg.includes('502') || msg.includes('500')) return 'Xero is experiencing issues right now. Please try again in a few minutes.';
  if (msg.includes('timed out')) return 'The request timed out. Please check your connection and try again.';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return 'Network error — please check your internet connection and try again.';
  if (msg.includes('Token exchange failed')) return 'Failed to complete the Xero login. Make sure you copied the full redirect URL and try again.';
  return msg;
}
