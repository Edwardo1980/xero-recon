import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://login.xero.com https://api.xero.com https://identity.xero.com",
  "worker-src 'self'",
  "img-src 'self' data: blob:",
  "frame-ancestors 'none'",
].join('; ');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-csp',
      apply: 'build',
      transformIndexHtml(html) {
        return html.replace(
          '<meta charset="UTF-8">',
          `<meta charset="UTF-8">\n  <meta http-equiv="Content-Security-Policy" content="${CSP}">`,
        );
      },
    },
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    outDir: 'dist',
    // 'hidden': maps generated for error tracking but not referenced in bundles
    sourcemap: 'hidden',
  },
  server: {
    port: 5173,
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
