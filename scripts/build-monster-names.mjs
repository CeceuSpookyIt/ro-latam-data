import { readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { extractFromGrf } from './extract-grf.mjs';
import { pickMonsterTable, namesToJson } from './monster-names.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = resolve(ROOT, 'tmp/grf-csv');
const OUT = resolve(ROOT, 'data/monster-names.json');

rmSync(TMP, { recursive: true, force: true });
const csvs = extractFromGrf(['.csv'], TMP);
console.log(`  ${csvs.length} CSVs extraídos do data.grf`);
const { name, table } = pickMonsterTable(
  readdirSync(TMP).map((f) => ({ name: f, text: readFileSync(join(TMP, f), 'latin1') })),
);
const json = namesToJson(table);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(json, null, 0) + '\n', 'utf-8');
console.log(`Escrito ${OUT}: ${Object.keys(json).length} chaves (tabela ${name})`);
