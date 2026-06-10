// Heavy engine module — dynamically imported on first generate so quicktype-core
// (~1.5 MB) lands in its own chunk and never loads on initial page render.
import { quicktype, InputData, jsonInputForTargetLanguage } from 'quicktype-core';

const TARGETS = [
  { id: 'typescript', label: 'TypeScript', opts: { 'just-types': 'true' } },
  { id: 'typescript-zod', label: 'Zod', opts: {} },
  { id: 'python', label: 'Python (dataclass)', opts: { 'just-types': 'true', 'python-version': '3.7' } },
  { id: 'go', label: 'Go', opts: { 'just-types': 'true' } },
] as const;

export async function generate(json: string, target: string, topLevelName: string): Promise<string> {
  const input = jsonInputForTargetLanguage(target);
  await input.addSource({ name: topLevelName || 'Root', samples: [json] });
  const data = new InputData();
  data.addInput(input);
  const t = TARGETS.find((x) => x.id === target)!;
  const result = await quicktype({ inputData: data, lang: target, rendererOptions: t.opts as any });
  return result.lines.join('\n');
}

export const TARGET_LIST = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'typescript-zod', label: 'Zod' },
  { id: 'python', label: 'Python (dataclass)' },
  { id: 'go', label: 'Go' },
];
