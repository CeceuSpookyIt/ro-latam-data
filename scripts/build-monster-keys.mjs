import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { keysFromRrf, buildSeed } from './rrf-keys.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = process.env.RO_REPLAY_DIR || 'D:/Gravity/Ragnarok/Replay';
const NAMES = resolve(ROOT, 'data/monster-names.json');
const OUT = resolve(ROOT, 'data/monster-keys.json');

// Sem a pasta de replays (outra máquina, CI): mantém a semente anterior, mesmo espírito do
// keep-previous do item.json -- a semente só cresce quando alguém com replays roda o build.
const arquivos = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.rrf')) : [];
if (arquivos.length === 0) {
  if (!existsSync(OUT)) writeFileSync(OUT, '{}\n', 'utf-8');
  console.log(`  ${DIR} sem .rrf: mantido ${OUT}`);
  process.exit(0);
}
const names = JSON.parse(readFileSync(NAMES, 'utf-8'));
const pares = arquivos.flatMap((f) => keysFromRrf(new Uint8Array(readFileSync(join(DIR, f)))));
const { seed, ambiguous } = buildSeed(pares, names);
for (const a of ambiguous) console.log(`  ambíguo, fora da semente: ${a.monster_id} -> ${a.keys.join('/')}`);
writeFileSync(OUT, JSON.stringify(seed, null, 0) + '\n', 'utf-8');
console.log(`Escrito ${OUT}: ${Object.keys(seed).length} monstros de ${arquivos.length} replays (${pares.length} pares)`);
