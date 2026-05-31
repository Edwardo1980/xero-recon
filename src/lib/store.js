import { create } from 'zustand';

// ── helpers ──────────────────────────────────────────────────────
const ls  = (k) => { try { return JSON.parse(localStorage.getItem('xero_cred_' + k)); } catch { return null; } };
const ss  = (k) => { try { return JSON.parse(sessionStorage.getItem('xero_' + k)); } catch { return null; } };
const lsw = (k, v) => localStorage.setItem('xero_cred_' + k, JSON.stringify(v));
const ssw = (k, v) => sessionStorage.setItem('xero_' + k, JSON.stringify(v));
const ssd = (k) => sessionStorage.removeItem('xero_' + k);

const SESSION_KEYS = ['accessToken', 'refreshToken', 'expiresAt', 'tenantId', 'tenantName', 'allConnections', 'codeVerifier', 'state'];

// ── store ─────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  // credentials (localStorage)
  clientId:     ls('clientId'),
  clientSecret: ls('clientSecret'),

  // session (sessionStorage)
  accessToken:     ss('accessToken'),
  refreshToken:    ss('refreshToken'),
  expiresAt:       ss('expiresAt'),
  tenantId:        ss('tenantId'),
  tenantName:      ss('tenantName'),
  allConnections:  ss('allConnections') ?? [],

  setCredentials(clientId, clientSecret) {
    lsw('clientId', clientId);
    if (clientSecret) lsw('clientSecret', clientSecret);
    set({ clientId, clientSecret });
  },

  saveTokens(tokens) {
    const expiresAt = Date.now() + (tokens.expires_in || 1800) * 1000;
    ssw('accessToken', tokens.access_token);
    if (tokens.refresh_token) ssw('refreshToken', tokens.refresh_token);
    ssw('expiresAt', expiresAt);
    set({
      accessToken:  tokens.access_token,
      refreshToken: tokens.refresh_token ?? get().refreshToken,
      expiresAt,
    });
  },

  setTenant(tenantId, tenantName) {
    ssw('tenantId', tenantId);
    ssw('tenantName', tenantName);
    set({ tenantId, tenantName });
  },

  setConnections(conns) {
    ssw('allConnections', conns);
    set({ allConnections: conns });
  },

  clearTokens() {
    SESSION_KEYS.forEach(ssd);
    set({ accessToken: null, refreshToken: null, expiresAt: null, tenantId: null, tenantName: null, allConnections: [] });
  },

  clearAll() {
    get().clearTokens();
    localStorage.removeItem('xero_cred_clientId');
    localStorage.removeItem('xero_cred_clientSecret');
    set({ clientId: null, clientSecret: null });
  },
}));
