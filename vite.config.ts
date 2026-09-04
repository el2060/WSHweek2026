import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sites } from '@openai/sites-vite-plugin';
import { mkdirSync, writeFileSync } from 'node:fs';

const staticSiteWorker = () => ({
  name: 'auditlens-static-worker',
  closeBundle() {
    mkdirSync('dist/server', { recursive: true });
    writeFileSync('dist/server/index.js', `export default { async fetch(request, env) {
  const response = await env.ASSETS.fetch(request);
  if (response.status !== 404) return response;
  const url = new URL(request.url);
  url.pathname = '/index.html';
  return env.ASSETS.fetch(new Request(url, request));
}};\n`);
  },
});

export default defineConfig(({ mode }) => ({
  base: mode === 'scorm' ? './' : '/',
  plugins: mode === 'scorm' ? [react()] : [react(), sites(), staticSiteWorker()],
}));
