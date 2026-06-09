// Client-side logic for all 4 dev0.dev tools.
// Self-contained: runs after DOMContentLoaded, wires up only the active section.

import { jwtSection } from './tools/jwt';
import { regexSection } from './tools/regex';
import { cronSection } from './tools/cron';
import { b64Section } from './tools/b64';

const wires: Record<string, () => void> = {
  jwt: jwtSection,
  regex: regexSection,
  cron: cronSection,
  b64: b64Section,
};

function getActiveTool(): string {
  const h = location.hash.replace('#/', '').replace('#', '');
  return (['jwt', 'regex', 'cron', 'b64'] as const).includes(h as 'jwt') ? h : 'jwt';
}

let current = '';
function refresh() {
  const tool = getActiveTool();
  if (tool === current) return;
  current = tool;
  (wires[tool] ?? wires.jwt)();
}

window.addEventListener('hashchange', refresh);
window.addEventListener('DOMContentLoaded', refresh);
if (document.readyState !== 'loading') refresh();
