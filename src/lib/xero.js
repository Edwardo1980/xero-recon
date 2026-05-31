import { XERO_API_BASE, XERO_CONNECTIONS } from './constants.js';
import { getToken, doRefreshToken, fetchWithTimeout, withRetry } from './auth.js';
import { useAuthStore } from './store.js';

// ── Connections / tenant ──────────────────────────────────────
export async function loadConnections() {
  const conns = await withRetry(async () => {
    const token = await getToken();
    const resp = await fetchWithTimeout(XERO_CONNECTIONS, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (resp.status === 401) throw new Error('NOT_AUTHENTICATED');
    if (!resp.ok) throw new Error(`Could not fetch Xero connections (${resp.status})`);
    return resp.json();
  });
  if (!conns.length) throw new Error('No Xero organisations found. Make sure your app has access to at least one organisation.');
  useAuthStore.getState().setConnections(conns);
  return conns;
}

// ── Core API call ─────────────────────────────────────────────
const STATUS_MESSAGES = {
  403: (path) => `Permission denied on ${path}. Check your app scopes in the Xero developer portal.`,
  404: (path) => `Xero resource not found: ${path}`,
  429: ()     => 'Xero rate limit reached. Please wait before refreshing.',
  500: ()     => 'Xero internal error. Please try again later.',
  503: ()     => 'Xero is temporarily unavailable. Please try again later.',
};

export async function xeroGet(path, retried = false) {
  const token    = await getToken();
  const tenantId = useAuthStore.getState().tenantId;
  if (!tenantId) throw new Error('NO_TENANT');

  const doFetch = () => fetchWithTimeout(`${XERO_API_BASE}${path}`, {
    headers: {
      Authorization:    `Bearer ${token}`,
      'Xero-tenant-id': tenantId,
      Accept:           'application/json',
    },
  });

  let resp = await withRetry(doFetch);

  // Respect Retry-After on 429 (one retry with the header-specified delay)
  if (resp.status === 429) {
    const raw   = parseInt(resp.headers.get('Retry-After') ?? '10', 10);
    const delay = Math.min(Number.isFinite(raw) && raw > 0 ? raw * 1000 : 10_000, 30_000);
    await new Promise(r => setTimeout(r, delay));
    resp = await withRetry(doFetch);
  }

  if (resp.status === 401 && !retried) {
    await doRefreshToken();
    return xeroGet(path, true);
  }

  if (!resp.ok) {
    const msgFn = STATUS_MESSAGES[resp.status];
    throw new Error(msgFn ? msgFn(path) : `Xero API error ${resp.status} on ${path}`);
  }

  return resp.json();
}

// Xero paginates at 100 records/page; fetch all pages up to a safety cap.
const TX_PAGE_CAP = 10; // max 1000 transactions

async function fetchAllBankTransactions() {
  const all = [];
  for (let page = 1; page <= TX_PAGE_CAP; page++) {
    const resp  = await xeroGet(`/BankTransactions?where=IsReconciled%3D%3Dfalse%26%26Status%3D%3D%22AUTHORISED%22&page=${page}`);
    const batch = resp.BankTransactions ?? [];
    all.push(...batch);
    if (batch.length < 100) break; // reached the last page
  }
  return all;
}

// ── Data fetching ─────────────────────────────────────────────
export async function fetchReconciliationData() {
  const [txs, accResp] = await Promise.all([
    fetchAllBankTransactions(),
    xeroGet('/Accounts?where=Type%3D%3D%22BANK%22%26%26Status%3D%3D%22ACTIVE%22'),
  ]);

  const accounts = accResp.Accounts ?? [];

  // Group transactions by account ID in one pass (O(N+M) vs O(N*M))
  const txByAccount = new Map();
  for (const tx of txs) {
    const id = tx.BankAccount?.AccountID;
    if (id) {
      const list = txByAccount.get(id);
      if (list) list.push(tx);
      else txByAccount.set(id, [tx]);
    }
  }

  const accountSummary = accounts.map(acc => {
    const accTxs = txByAccount.get(acc.AccountID) ?? [];
    return {
      id:           acc.AccountID,
      name:         acc.Name,
      code:         acc.Code || '—',
      currency:     acc.CurrencyCode || 'AUD',
      count:        accTxs.length,
      total:        accTxs.reduce((s, t) => s + (t.Total || 0), 0),
      transactions: accTxs,
    };
  });

  const { tenantName } = useAuthStore.getState();
  return {
    tenantName:        tenantName ?? 'Your Organisation',
    totalUnreconciled: txs.length,
    totalValue:        txs.reduce((s, t) => s + Math.abs(t.Total || 0), 0),
    accounts:          accountSummary,
    currency:          accounts[0]?.CurrencyCode ?? 'AUD',
  };
}
