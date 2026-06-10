import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://dev0.dev',
  integrations: [tailwind()],
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    // jq-web is an Emscripten build that breaks when esbuild "optimizes" it
    // (it relies on runtime feature-detection and dynamic wasm loading). Exclude
    // it so Vite serves it as-is in dev and bundles it untouched for prod. The
    // wasm itself is shipped from public/jq.wasm and loaded at the site root.
    optimizeDeps: { exclude: ['jq-web'] },
  },
});
