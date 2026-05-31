import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
    tailwindcss(),
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    outDir: 'dist',
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
