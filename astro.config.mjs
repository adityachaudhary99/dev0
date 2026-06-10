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
    optimizeDeps: {
      // These deps are CommonJS and are imported only inside dynamically-imported
      // chunks (jq engine, quicktype engine, ERD renderer). optimizeDeps affects
      // the DEV server only (prod uses Rollup). Without pre-bundling, Vite's dev
      // server can't interop them on first dynamic import — jq-web in particular
      // resolves to an EMPTY namespace when excluded, and dagre/quicktype throw
      // "Failed to fetch dynamically imported module". Forcing esbuild to
      // pre-bundle them to proper ESM fixes dev. The jq.wasm binary is served
      // from public/jq.wasm (site root) and loaded by Emscripten's locateFile.
      include: ['jq-web', 'quicktype-core', 'dagre'],
    },
  },
});
