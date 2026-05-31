import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './lib/store.js';
import { REDIRECT_URI } from './lib/constants.js';
import AlertBanners from './components/layout/AlertBanners.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import SetupScreen from './screens/SetupScreen.jsx';
import ConnectScreen from './screens/ConnectScreen.jsx';
import CallbackScreen from './screens/CallbackScreen.jsx';
import OrgPickerScreen from './screens/OrgPickerScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';

// Intercept OAuth redirect params before the router takes over
function OAuthInterceptor({ children }) {
  const navigate   = useNavigate();
  const clientId   = useAuthStore(s => s.clientId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    const state  = params.get('state');
    if (code && state) {
      window.history.replaceState({}, '', window.location.pathname);
      if (!clientId) { navigate('/setup'); return; }
      // Store params in sessionStorage and redirect to callback route
      sessionStorage.setItem('xero_oauth_code',  code);
      sessionStorage.setItem('xero_oauth_state', state);
      navigate('/callback');
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}

function RequireAuth({ children }) {
  const clientId    = useAuthStore(s => s.clientId);
  const accessToken = useAuthStore(s => s.accessToken);
  if (!clientId)    return <Navigate to="/setup"   replace />;
  if (!accessToken) return <Navigate to="/connect" replace />;
  return children;
}

function RequireCreds({ children }) {
  const clientId = useAuthStore(s => s.clientId);
  if (!clientId) return <Navigate to="/setup" replace />;
  return children;
}

// CallbackScreen wrapper that reads code/state from sessionStorage
function CallbackWrapper() {
  const code  = sessionStorage.getItem('xero_oauth_code')  ?? '';
  const state = sessionStorage.getItem('xero_oauth_state') ?? '';
  useEffect(() => {
    sessionStorage.removeItem('xero_oauth_code');
    sessionStorage.removeItem('xero_oauth_state');
  }, []);
  return <CallbackScreen code={code} state={state} />;
}

export default function App() {
  return (
    <HashRouter>
      <OAuthInterceptor>
        <AlertBanners />
        <div className="wrap" role="main">
          <div id="ariaAnnounce" className="sr-only" aria-live="polite" aria-atomic="true" />
          <Header />

          <Routes>
            <Route path="/setup"     element={<SetupScreen />} />
            <Route path="/connect"   element={<RequireCreds><ConnectScreen /></RequireCreds>} />
            <Route path="/callback"  element={<RequireCreds><CallbackWrapper /></RequireCreds>} />
            <Route path="/org-select" element={<RequireCreds><OrgPickerScreen /></RequireCreds>} />
            <Route path="/dashboard" element={<RequireAuth><DashboardScreen /></RequireAuth>} />
            <Route path="*"          element={<DefaultRedirect />} />
          </Routes>

          <Footer />
        </div>
      </OAuthInterceptor>
    </HashRouter>
  );
}

function DefaultRedirect() {
  const clientId    = useAuthStore(s => s.clientId);
  const accessToken = useAuthStore(s => s.accessToken);
  if (!clientId)    return <Navigate to="/setup"     replace />;
  if (!accessToken) return <Navigate to="/connect"   replace />;
  return <Navigate to="/dashboard" replace />;
}
